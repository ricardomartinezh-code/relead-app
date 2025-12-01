import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RequestBody = {
  phone_number_id?: string;
  to?: string;
  message?: string;
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

  const { phone_number_id: phoneNumberId, to, message } = body ?? {};

  if (!phoneNumberId || !to) {
    return NextResponse.json(
      { error: "Faltan datos: phone_number_id o to" },
      { status: 400 },
    );
  }

  try {
    const account = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumberId },
    });

    if (!account) {
      return NextResponse.json(
        { error: "No se encontró una cuenta de WhatsApp para ese número" },
        { status: 404 },
      );
    }

    const textBody = message?.trim() || "Mensaje de prueba de ReLead";

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v24.0/${account.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: textBody },
        }),
      },
    );

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      // eslint-disable-next-line no-console
      console.error("Error al enviar mensaje de prueba:", errorText);

      return NextResponse.json(
        { error: "No se pudo enviar el mensaje de prueba" },
        { status: 500 },
      );
    }

    const data = await whatsappResponse.json();

    return NextResponse.json({
      success: true,
      phoneNumberId: account.phoneNumberId,
      to,
      message: textBody,
      metaResponse: data,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error en send-test-message:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al enviar el mensaje de prueba" },
      { status: 500 },
    );
  }
}
