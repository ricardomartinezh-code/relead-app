"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, CornerDownLeft, Sparkles, X } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "relead.dashboard.chat.v1";

function loadStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(-30)
      .map((m: any): ChatMessage => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        content: typeof m?.content === "string" ? m.content : "",
      }))
      .filter((m) => Boolean(m.content.trim()));
  } catch {
    return [];
  }
}

function storeMessages(messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  } catch {
    // ignore
  }
}

export function DashboardChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadStoredMessages();
    if (stored.length) return stored;
    return [
      {
        role: "assistant",
        content:
          "¿En qué te ayudo? Puedo guiarte para configurar WABA, mejorar tu página pública o entender las analíticas.",
      },
    ];
  });

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    storeMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  const suggestions = useMemo(
    () => [
      "¿Cómo agrego redes sociales a mi página y que se vean con iconos?",
      "Explícame el flujo para conectar WABA (Embedded Signup) paso a paso.",
      "¿Qué significa Evolución/Origen/Dispositivos en Analíticas y cómo mejoro el CTR?",
      "Quiero que una imagen abra un link distinto por miniatura, ¿cómo se configura?",
    ],
    []
  );

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ messages: nextMessages.slice(-20) }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error enviando mensaje.");

      const reply = typeof json?.message === "string" ? json.message : "";
      if (!reply.trim()) throw new Error("Respuesta vacía.");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.trim() },
      ]);
    } catch (err: any) {
      setError(err?.message || "Error hablando con el asistente.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "No pude responder en este momento. Revisa que `OPENAI_API_KEY` esté configurada en Vercel y vuelve a intentar.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div
          className={cn(
            "w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/15",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">Asistente</p>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    IA
                  </span>
                </div>
                <p className="truncate text-[11px] text-white/70">
                  Respuestas rápidas sobre ReLead
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={listRef}
            className="max-h-[min(520px,calc(100dvh-210px))] overflow-auto px-4 py-3"
          >
            <div className="space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {messages.length <= 1 && (
                <div className="mt-2 grid gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void sendMessage(s)}
                      className="group rounded-xl border border-border bg-card px-3 py-2 text-left text-sm text-foreground/80 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles
                          className="mt-0.5 h-4 w-4 text-indigo-500 transition group-hover:scale-110"
                          aria-hidden="true"
                        />
                        <span className="leading-snug">{s}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          <form
            className="border-t border-border bg-popover px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Escribe tu pregunta…"
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/20"
              />
              <Button type="submit" disabled={sending || !input.trim()}>
                <CornerDownLeft className="h-4 w-4" />
                {sending ? "Enviando" : "Enviar"}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      role: "assistant",
                      content:
                        "Listo. ¿Qué quieres hacer hoy en ReLead (Páginas, WABA o Analíticas)?",
                    },
                  ]);
                  setError(null);
                }}
                className="rounded-md px-2 py-1 hover:bg-accent"
              >
                Reiniciar chat
              </button>
              <span className="tabular-nums">{Math.min(2000, input.length)}/2000</span>
            </div>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Abrir asistente"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition group-hover:scale-105">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:block">Ayuda</span>
          <ChevronDown className="h-4 w-4 rotate-180 opacity-80" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
