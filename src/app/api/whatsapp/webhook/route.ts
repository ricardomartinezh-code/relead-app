import { NextResponse } from "next/server";
import crypto from "crypto";

import { findWhatsAppAccountByPhoneNumberId, recordWhatsAppMessage } from "@/lib/db";

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function verifyMetaSignature(params: { rawBody: string; signatureHeader: string; appSecret: string }) {
  const { rawBody, signatureHeader, appSecret } = params;
  const [algo, signature] = signatureHeader.split("=");
  if (algo !== "sha256" || !signature) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new Response("Bad Request", { status: 400 });
  }

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    return new Response("Missing verify token", { status: 500 });
  }

  if (token !== verifyToken) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const appSecret = process.env.META_APP_SECRET;
  const signatureHeader = request.headers.get("x-hub-signature-256");
  if (appSecret && signatureHeader) {
    const ok = verifyMetaSignature({ rawBody, signatureHeader, appSecret });
    if (!ok) {
      return new Response("Invalid signature", { status: 403 });
    }
  }

  const payload = safeJsonParse(rawBody);
  if (!payload) {
    return new Response("Invalid JSON", { status: 400 });
  }

  try {
    const entries = Array.isArray(payload?.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value;
        const metadata = value?.metadata;
        const phone_number_id = metadata?.phone_number_id;
        if (!phone_number_id) continue;

        const account = await findWhatsAppAccountByPhoneNumberId(String(phone_number_id));
        if (!account?.userId) continue;

        const messages = Array.isArray(value?.messages) ? value.messages : [];
        for (const message of messages) {
          const from = message?.from ? String(message.from) : null;
          if (!from) continue;

          const messageType = message?.type ? String(message.type) : "unknown";
          const textBody =
            messageType === "text" && message?.text?.body
              ? String(message.text.body)
              : null;

          await recordWhatsAppMessage({
            userId: account.userId,
            phoneNumberId: String(phone_number_id),
            contact: from,
            direction: "inbound",
            messageType,
            textBody,
            metaMessageId: message?.id ? String(message.id) : null,
            raw: payload,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    // WhatsApp reintenta si no respondemos 200; devolvemos 200 para evitar loops.
    return NextResponse.json({ received: true });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

