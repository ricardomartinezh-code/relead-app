import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  completeWhatsAppOnboardingSessionBySignupSessionId,
  findWhatsAppAccountByPhoneNumberId,
  findWhatsAppAccountByWabaId,
  recordWhatsAppMessage,
  recordWhatsAppWebhookEvent,
} from "@/lib/db";

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
  if (appSecret && !signatureHeader) {
    return new Response("Missing signature", { status: 403 });
  }
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
    const object = payload?.object ? String(payload.object) : null;

    for (const entry of entries) {
      const entryId = entry?.id ? String(entry.id) : null;
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value;
        const field = change?.field ? String(change.field) : null;
        const metadata = value?.metadata;
        const phone_number_id = metadata?.phone_number_id;
        const wabaIdGuess =
          metadata?.waba_id || value?.waba_id || (object === "whatsapp_business_account" ? entryId : null);
        const businessIdGuess = metadata?.business_id || value?.business_id || null;
        const signupSessionId =
          metadata?.signup_session_id || metadata?.session_id || value?.signup_session_id || value?.session_id || null;

        let account =
          phone_number_id ? await findWhatsAppAccountByPhoneNumberId(String(phone_number_id)) : null;
        if (!account && wabaIdGuess) {
          account = await findWhatsAppAccountByWabaId(String(wabaIdGuess));
        }
        const userId = account?.userId ?? null;

        // Logging completo del evento (aun si no podemos mapear a usuario todavía).
        try {
          await recordWhatsAppWebhookEvent({
            userId,
            object,
            field,
            entryId,
            businessId: businessIdGuess ? String(businessIdGuess) : account?.businessId ?? null,
            wabaId: wabaIdGuess ? String(wabaIdGuess) : account?.wabaId ?? null,
            phoneNumberId: phone_number_id ? String(phone_number_id) : account?.phoneNumberId ?? null,
            signupSessionId: signupSessionId ? String(signupSessionId) : null,
            raw: { entry, change },
          });
        } catch (err) {
          console.error("No se pudo registrar evento de webhook:", err);
        }

        // Si llega un evento de onboarding/coexistence con signup_session_id, intentamos marcarlo como completed.
        const eventText = value?.event ? String(value.event) : "";
        const statusText = value?.status ? String(value.status) : "";
        const hints = [eventText, statusText].filter(Boolean).join(" ").toUpperCase();
        if (signupSessionId && hints && (hints.includes("COMPLETE") || hints.includes("FINISH") || hints.includes("SUCCESS"))) {
          try {
            await completeWhatsAppOnboardingSessionBySignupSessionId({
              signupSessionId: String(signupSessionId),
              phoneNumberId: phone_number_id ? String(phone_number_id) : null,
              wabaId: wabaIdGuess ? String(wabaIdGuess) : null,
              businessId: businessIdGuess ? String(businessIdGuess) : null,
              meta: { webhook: { event: eventText || null, status: statusText || null } },
            });
          } catch (err) {
            console.error("No se pudo completar sesión por signup_session_id:", err);
          }
        }

        // Procesamiento de mensajes
        if (!phone_number_id) continue;
        if (!userId) continue;

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
            userId,
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
