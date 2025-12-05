import { NextResponse } from "next/server";

import { upsertWhatsAppAccount } from "@/lib/db";

type RequestBody = {
  code?: string;
  phone_number_id?: string;
  waba_id?: string;
  label?: string;
};

export async function POST(request: Request) {
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

  if (!code || !phoneNumberId || !wabaId) {
    return NextResponse.json(
      { error: "Faltan datos: code, phone_number_id o waba_id" },
      { status: 400 },
    );
  }

  const { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI } = process.env;

  if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
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
      return NextResponse.json(
        { error: "Meta no regresó un access_token válido" },
        { status: 500 },
      );
    }

    const account = await upsertWhatsAppAccount(
      phoneNumberId,
      wabaId,
      tokenData.access_token,
      label,
      typeof tokenData.expires_in === "number" ? tokenData.expires_in : null
    );

    return NextResponse.json({
      success: true,
      phoneNumberId,
      wabaId,
      expiresIn: account.expiresIn,
      label: account.label,
      accessTokenPreview: tokenData.access_token.substring(0, 10),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error en complete-signup:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al completar el registro" },
      { status: 500 },
    );
  }
}
