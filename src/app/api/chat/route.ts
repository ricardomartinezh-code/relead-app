import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = [
  "Eres ReLead Assistant, el asistente oficial dentro del dashboard de ReLead.",
  "Ayudas al usuario a: crear/editar Páginas (Link Pages), configurar WABA (WhatsApp Business), entender Analíticas y resolver problemas comunes.",
  "",
  "Reglas:",
  "- Responde en español (México) por defecto.",
  "- Da pasos claros, cortos y accionables.",
  "- Si te falta contexto, pregunta 1-2 cosas antes de asumir.",
  "- No inventes integraciones; si algo no existe, dilo y propone alternativa.",
  "- No pidas secretos (tokens, llaves). Si se requieren, explica dónde configurarlos en Vercel/env.",
].join("\n");

function clampText(value: unknown, maxLen: number) {
  const text = typeof value === "string" ? value : "";
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function extractOutputText(payload: any): string {
  if (!payload) return "";
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      const text = part?.text;
      if (typeof text === "string" && text.trim()) return text.trim();
    }
  }

  return "";
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Chat no configurado. Falta OPENAI_API_KEY en variables de entorno.",
      },
      { status: 500 }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const rawMessages: unknown[] = Array.isArray(body?.messages) ? body.messages : [];
  const messages: ChatMessage[] = rawMessages
    .slice(-20)
    .map((m: any): ChatMessage => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: clampText(m?.content, 2000),
    }))
    .filter((m) => Boolean(m.content.trim()));

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Envía al menos un mensaje." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_output_tokens: 450,
      input: [
        {
          role: "system",
          content: [{ type: "text", text: SYSTEM_PROMPT }],
        },
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: [{ type: "text", text: m.content }],
        })),
      ],
      metadata: {
        app: "relead",
        userId: user.id,
        clerkId: user.clerkId,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof json?.error?.message === "string"
        ? json.error.message
        : "Error hablando con el modelo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const text = extractOutputText(json);
  if (!text) {
    return NextResponse.json(
      { error: "La respuesta llegó vacía." },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: text });
}
