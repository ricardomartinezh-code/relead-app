import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: {
    code?: string;
    phone_number_id?: string;
    waba_id?: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido" },
      { status: 400 },
    );
  }

  const { code, phone_number_id, waba_id } = body ?? {};

  if (!code || !phone_number_id || !waba_id) {
    return NextResponse.json(
      { error: "Faltan datos: code, phone_number_id o waba_id" },
      { status: 400 },
    );
  }

  const { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI } = process.env;
  // META_REDIRECT_URI debe coincidir exactamente con la URL donde se ejecuta FB.login,
  // en este caso: https://relead.com.mx/dashboard/whatsapp
  // y la misma URL debe estar registrada como "Valid OAuth Redirect URI" en Meta Developers.

  if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Faltan variables de entorno para Meta" },
      { status: 500 },
    );
  }

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

  const { access_token, expires_in } = tokenData;

  // TODO: Guardar credenciales en la base de datos y continuar con la configuración de la API de WhatsApp Cloud.
  return NextResponse.json({
    success: true,
    access_token_preview: access_token?.substring(0, 10),
    expires_in,
    phone_number_id,
    waba_id,
  });
}
