import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { upsertWhatsAppAccountForUser } from "@/lib/db";

type Body = {
  phone_number_id?: string;
  waba_id?: string;
  access_token?: string;
  label?: string;
  business_id?: string;
  expires_in?: number;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const phoneNumberId = String(body?.phone_number_id || "").trim();
  const wabaId = String(body?.waba_id || "").trim();
  const accessToken = String(body?.access_token || "").trim();
  const label = body?.label ? String(body.label).trim() : null;
  const businessId = body?.business_id ? String(body.business_id).trim() : null;
  const expiresIn =
    typeof body?.expires_in === "number" && Number.isFinite(body.expires_in)
      ? Math.max(0, Math.trunc(body.expires_in))
      : null;

  if (!phoneNumberId || !accessToken) {
    return NextResponse.json(
      { error: "Faltan datos: phone_number_id o access_token" },
      { status: 400 }
    );
  }

  try {
    const account = await upsertWhatsAppAccountForUser(
      user.id,
      phoneNumberId,
      wabaId || phoneNumberId,
      accessToken,
      businessId,
      label,
      expiresIn
    );

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        phoneNumberId: account.phoneNumberId,
        wabaId: account.wabaId ?? null,
        businessId: account.businessId ?? null,
        label: account.label ?? null,
        expiresIn: account.expiresIn ?? null,
      },
    });
  } catch (error: any) {
    console.error("Error guardando conexión manual:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo guardar la conexión" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

