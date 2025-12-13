import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findWhatsAppAccountByPhoneNumberIdForUser, recordWhatsAppMessage } from "@/lib/db";

type Body =
  | {
      phone_number_id?: string;
      to?: string;
      type?: "text";
      text?: string;
    }
  | {
      phone_number_id?: string;
      to?: string;
      type?: "template";
      template?: { name?: string; language?: string };
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

  const phoneNumberId = (body as any)?.phone_number_id?.trim();
  const to = (body as any)?.to?.trim();
  const type = ((body as any)?.type || "text") as "text" | "template";

  if (!phoneNumberId || !to) {
    return NextResponse.json(
      { error: "Faltan datos: phone_number_id o to" },
      { status: 400 }
    );
  }

  const account = await findWhatsAppAccountByPhoneNumberIdForUser(user.id, phoneNumberId);
  if (!account) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  try {
    const payload: any = {
      messaging_product: "whatsapp",
      to,
      type,
    };

    if (type === "template") {
      const templateName = (body as any)?.template?.name?.trim();
      const language = (body as any)?.template?.language?.trim();
      if (!templateName || !language) {
        return NextResponse.json(
          { error: "Faltan datos: template.name o template.language" },
          { status: 400 }
        );
      }
      payload.template = { name: templateName, language: { code: language } };
    } else {
      const text = ((body as any)?.text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Falta texto" }, { status: 400 });
      }
      payload.text = { body: text };
    }

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v24.0/${account.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error("Error enviando mensaje:", errorText);
      return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 500 });
    }

    const data = await whatsappResponse.json();
    const metaMessageId = Array.isArray(data?.messages) ? data.messages?.[0]?.id : null;

    await recordWhatsAppMessage({
      userId: user.id,
      phoneNumberId: account.phoneNumberId,
      contact: to,
      direction: "outbound",
      messageType: type,
      textBody: type === "text" ? payload.text.body : null,
      templateName: type === "template" ? payload.template.name : null,
      templateLanguage: type === "template" ? payload.template.language.code : null,
      metaMessageId,
      raw: data,
    });

    return NextResponse.json({ success: true, metaResponse: data });
  } catch (error) {
    console.error("Error en send-message:", error);
    return NextResponse.json({ error: "Error enviando mensaje" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

