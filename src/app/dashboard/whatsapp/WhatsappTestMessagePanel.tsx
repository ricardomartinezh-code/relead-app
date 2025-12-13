"use client";

import { useEffect, useMemo, useState } from "react";

type Account = {
  id: string;
  phoneNumberId: string;
  wabaId: string | null;
  label: string | null;
  expiresIn: number | null;
};

type Template = {
  name: string;
  language: string;
  status?: string;
  category?: string;
};

type Conversation = {
  contact: string;
  lastMessageAt: string;
  lastText: string | null;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  messageType: string;
  textBody?: string | null;
  templateName?: string | null;
  templateLanguage?: string | null;
  createdAt: string;
};

export default function WhatsappTestMessagePanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.phoneNumberId === selectedPhoneNumberId) ?? null,
    [accounts, selectedPhoneNumberId]
  );

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContact, setActiveContact] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [text, setText] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const res = await fetch("/api/whatsapp/accounts", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudieron cargar las cuentas.");
        const next = (json.accounts || []) as Account[];
        if (!mounted) return;
        setAccounts(next);
        if (!selectedPhoneNumberId && next.length > 0) {
          setSelectedPhoneNumberId(next[0].phoneNumberId);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando cuentas";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoadingAccounts(false);
      }
    };
    void loadAccounts();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPhoneNumberId) return;
    let mounted = true;

    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const url = new URL("/api/whatsapp/templates", window.location.origin);
        url.searchParams.set("phone_number_id", selectedPhoneNumberId);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudieron cargar plantillas.");
        const next = (json.templates || []) as any[];
        if (!mounted) return;
        setTemplates(
          next.map((t) => ({
            name: String(t.name),
            language: String(t.language),
            status: t.status ? String(t.status) : undefined,
            category: t.category ? String(t.category) : undefined,
          }))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando plantillas";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoadingTemplates(false);
      }
    };

    void loadTemplates();
    return () => {
      mounted = false;
    };
  }, [selectedPhoneNumberId]);

  useEffect(() => {
    if (!selectedPhoneNumberId) return;
    let mounted = true;

    const loadConversations = async () => {
      try {
        const url = new URL("/api/whatsapp/conversations", window.location.origin);
        url.searchParams.set("phone_number_id", selectedPhoneNumberId);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudieron cargar conversaciones.");
        if (!mounted) return;
        setConversations(json.conversations || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando conversaciones";
        if (mounted) setError(message);
      }
    };

    void loadConversations();
    const id = window.setInterval(loadConversations, 5000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [selectedPhoneNumberId]);

  useEffect(() => {
    if (!selectedPhoneNumberId || !activeContact) return;
    let mounted = true;
    const loadMessages = async () => {
      try {
        const url = new URL("/api/whatsapp/messages", window.location.origin);
        url.searchParams.set("phone_number_id", selectedPhoneNumberId);
        url.searchParams.set("contact", activeContact);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudieron cargar mensajes.");
        if (!mounted) return;
        setMessages(json.messages || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando mensajes";
        if (mounted) setError(message);
      }
    };

    void loadMessages();
    const id = window.setInterval(loadMessages, 3000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [selectedPhoneNumberId, activeContact]);

  const handleOpenChat = () => {
    const next = to.trim();
    if (!next) return;
    setActiveContact(next);
  };

  const handleSend = async () => {
    if (!selectedPhoneNumberId) {
      setError("Selecciona una cuenta primero.");
      return;
    }
    const target = (activeContact || to).trim();
    if (!target) {
      setError("Escribe un destinatario (formato internacional).");
      return;
    }

    setError(null);
    setIsSending(true);
    try {
      if (mode === "template") {
        const [name, language] = selectedTemplateKey.split("::");
        if (!name || !language) {
          throw new Error("Selecciona una plantilla.");
        }
        const res = await fetch("/api/whatsapp/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number_id: selectedPhoneNumberId,
            to: target,
            type: "template",
            template: { name, language },
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudo enviar la plantilla.");
      } else {
        const body = text.trim();
        if (!body) throw new Error("Escribe un mensaje.");
        const res = await fetch("/api/whatsapp/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number_id: selectedPhoneNumberId,
            to: target,
            type: "text",
            text: body,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudo enviar el mensaje.");
        setText("");
      }
      setActiveContact(target);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error enviando";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  if (loadingAccounts) {
    return <p className="text-sm text-slate-500">Cargando WhatsApp…</p>;
  }

  if (!accounts.length) {
    return (
      <div className="space-y-2 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Aún no tienes una cuenta conectada.</p>
        <p className="text-slate-600">
          Completa el flujo de “Conectar cuenta” y vuelve aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Cuenta</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={selectedPhoneNumberId}
              onChange={(e) => setSelectedPhoneNumberId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.phoneNumberId} value={a.phoneNumberId}>
                  {a.label ? `${a.label} · ` : ""}
                  {a.phoneNumberId}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">waba_id</span>
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={selectedAccount?.wabaId || ""}
              readOnly
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 space-y-1 text-sm text-slate-700">
            <span className="font-medium">Destinatario</span>
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="Ej: 5215512345678"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={handleOpenChat}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Abrir chat
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-3 text-sm font-semibold text-slate-900">
            Conversaciones
          </div>
          <div className="max-h-[420px] overflow-auto p-2">
            {conversations.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">
                Aún no hay conversaciones. Envía un mensaje para iniciar.
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.contact}
                    type="button"
                    onClick={() => setActiveContact(c.contact)}
                    className={[
                      "w-full rounded-lg p-2 text-left text-sm transition",
                      activeContact === c.contact
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.contact}</span>
                      <span className="text-[11px] opacity-80">
                        {new Date(c.lastMessageAt).toLocaleTimeString("es-MX")}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[12px] opacity-80">
                      {c.lastText || "—"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-3 text-sm font-semibold text-slate-900">
            {activeContact ? `Chat con ${activeContact}` : "Selecciona una conversación"}
          </div>
          <div className="flex max-h-[420px] flex-col gap-2 overflow-auto p-3">
            {!activeContact ? (
              <p className="text-sm text-slate-500">Elige una conversación para ver mensajes.</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500">Sin mensajes aún.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.direction === "outbound"
                      ? "ml-auto bg-emerald-600 text-white"
                      : "mr-auto bg-slate-100 text-slate-900",
                  ].join(" ")}
                >
                  {m.messageType === "template" ? (
                    <div>
                      <div className="text-xs opacity-90">Plantilla</div>
                      <div className="font-medium">
                        {m.templateName} ({m.templateLanguage})
                      </div>
                    </div>
                  ) : (
                    <div>{m.textBody || "—"}</div>
                  )}
                  <div className="mt-1 text-[10px] opacity-80">
                    {new Date(m.createdAt).toLocaleTimeString("es-MX")}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-slate-700">
                <span className="sr-only">Modo</span>
                <select
                  className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="text">Mensaje</option>
                  <option value="template">Plantilla</option>
                </select>
              </label>

              {mode === "template" ? (
                <select
                  className="min-w-[240px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  disabled={loadingTemplates}
                >
                  <option value="">
                    {loadingTemplates ? "Cargando plantillas..." : "Selecciona plantilla"}
                  </option>
                  {templates.map((t) => (
                    <option key={`${t.name}::${t.language}`} value={`${t.name}::${t.language}`}>
                      {t.name} · {t.language}
                      {t.status ? ` · ${t.status}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="min-w-[240px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Escribe un mensaje…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!activeContact && !to.trim()}
                />
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || (!activeContact && !to.trim())}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSending ? "Enviando…" : "Enviar"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Recepción: para ver mensajes entrantes aquí necesitas configurar el webhook de WhatsApp Cloud API hacia tu app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
