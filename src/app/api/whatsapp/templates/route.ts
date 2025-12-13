import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findWhatsAppAccountByPhoneNumberIdForUser } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const phoneNumberId = url.searchParams.get("phone_number_id") || "";

  if (!phoneNumberId) {
    return NextResponse.json(
      { error: "Falta query param: phone_number_id" },
      { status: 400 }
    );
  }

  const account = await findWhatsAppAccountByPhoneNumberIdForUser(user.id, phoneNumberId);
  if (!account) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }
  if (!account.wabaId) {
    return NextResponse.json({ error: "La cuenta no tiene waba_id" }, { status: 400 });
  }

  try {
    const fields = "name,category,language,status,components";
    const templatesUrl = new URL(`https://graph.facebook.com/v24.0/${account.wabaId}/message_templates`);
    templatesUrl.searchParams.set("fields", fields);
    templatesUrl.searchParams.set("limit", "50");

    const metaResponse = await fetch(templatesUrl.toString(), {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    });

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      console.error("Error obteniendo plantillas:", errorText);
      return NextResponse.json({ error: "No se pudieron obtener plantillas" }, { status: 500 });
    }

    const data = await metaResponse.json();
    return NextResponse.json({ templates: data?.data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error en templates:", error);
    return NextResponse.json({ error: "Error obteniendo plantillas" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

