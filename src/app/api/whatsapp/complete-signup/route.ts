import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  consumeWhatsAppOnboardingSession,
  completeWhatsAppOnboardingSession,
  failWhatsAppOnboardingSession,
  upsertWhatsAppAccountForUser,
} from "@/lib/db";

type RequestBody = {
  code?: string;
  phone_number_id?: string;
  waba_id?: string;
  business_id?: string;
  signup_session_id?: string;
  state?: string;
  session_info?: any;
  label?: string;
};

async function debugToken(params: {
  inputToken: string;
  appId: string;
  appSecret: string;
}) {
  const { inputToken, appId, appSecret } = params;
  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", inputToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: RequestBody;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido" },
      { status: 400 },
    );
  }

  const { code, phone_number_id: phoneNumberId, waba_id: wabaId, label } =
    body ?? {};
  const state = typeof body?.state === "string" ? body.state : "";
  const businessId = typeof body?.business_id === "string" ? body.business_id : null;
  const signupSessionId =
    typeof body?.signup_session_id === "string" ? body.signup_session_id : null;
  const sessionInfo = body?.session_info ?? null;

  if (!state) {
    return NextResponse.json({ error: "Falta state" }, { status: 400 });
  }

  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("wa_es_state="))
    ?.split("=")
    ?.slice(1)
    .join("=") || "";
  const cookieStateDecoded = cookieState ? decodeURIComponent(cookieState) : "";

  if (!cookieStateDecoded || cookieStateDecoded !== state) {
    return NextResponse.json({ error: "State inválido (CSRF)" }, { status: 403 });
  }

  const consumed = await consumeWhatsAppOnboardingSession({ userId: user.id, state });
  if (!consumed) {
    return NextResponse.json(
      { error: "No hay sesión de onboarding activa para este state" },
      { status: 409 }
    );
  }

  if (!code || !phoneNumberId || !wabaId) {
    await failWhatsAppOnboardingSession({
      userId: user.id,
      state,
      meta: { error: "Faltan datos: code, phone_number_id o waba_id" },
    });
    return NextResponse.json(
      { error: "Faltan datos: code, phone_number_id o waba_id" },
      { status: 400 },
    );
  }

  const { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI } = process.env;

  if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
    await failWhatsAppOnboardingSession({
      userId: user.id,
      state,
      meta: { error: "Faltan variables de entorno para Meta" },
    });
    return NextResponse.json(
      { error: "Faltan variables de entorno para Meta" },
      { status: 500 },
    );
  }

  try {
    const params = new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      redirect_uri: META_REDIRECT_URI,
      code,
    });

    const metaResponse = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?${params.toString()}`,
      { method: "GET" },
    );

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      // eslint-disable-next-line no-console
      console.error("Error al obtener el access_token de Meta:", errorText);

      await failWhatsAppOnboardingSession({
        userId: user.id,
        state,
        meta: { error: "No se pudo obtener el access_token de Meta", metaError: errorText },
      });
      return NextResponse.json(
        { error: "No se pudo obtener el access_token de Meta" },
        { status: 500 },
      );
    }

    const tokenData = (await metaResponse.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      [key: string]: unknown;
    };

    if (!tokenData.access_token) {
      await failWhatsAppOnboardingSession({
        userId: user.id,
        state,
        meta: { error: "Meta no regresó un access_token válido", tokenData },
      });
      return NextResponse.json(
        { error: "Meta no regresó un access_token válido" },
        { status: 500 },
      );
    }

    const tokenDebug = await debugToken({
      inputToken: tokenData.access_token,
      appId: META_APP_ID,
      appSecret: META_APP_SECRET,
    });

    const scopes: string[] = Array.isArray(tokenDebug?.data?.scopes)
      ? tokenDebug.data.scopes.map((s: any) => String(s))
      : [];
    const requiredScopes = ["whatsapp_business_management", "whatsapp_business_messaging"];
    const missingScopes = requiredScopes.filter((s) => !scopes.includes(s));
    if (missingScopes.length > 0) {
      await failWhatsAppOnboardingSession({
        userId: user.id,
        state,
        meta: { error: "Scopes faltantes", missingScopes, scopes, tokenDebug },
      });
      return NextResponse.json(
        { error: `Faltan permisos: ${missingScopes.join(", ")}` },
        { status: 400 }
      );
    }

    const account = await upsertWhatsAppAccountForUser(
      user.id,
      phoneNumberId,
      wabaId,
      tokenData.access_token,
      businessId,
      label,
      typeof tokenData.expires_in === "number" ? tokenData.expires_in : null
    );

    await completeWhatsAppOnboardingSession({
      userId: user.id,
      state,
      phoneNumberId,
      wabaId,
      businessId,
      signupSessionId,
      meta: { tokenDebug, sessionInfo },
    });

    const response = NextResponse.json({
      success: true,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      expires_in: account.expiresIn,
      label: account.label,
      access_token_preview: tokenData.access_token.substring(0, 10),
      scopes,
    });
    response.cookies.set({
      name: "wa_es_state",
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error en complete-signup:", error);

    await failWhatsAppOnboardingSession({
      userId: user.id,
      state,
      meta: { error: "Ocurrió un error al completar el registro", detail: String(error) },
    });
    return NextResponse.json(
      { error: "Ocurrió un error al completar el registro" },
      { status: 500 },
    );
  }
}
