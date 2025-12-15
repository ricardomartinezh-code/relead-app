"use client";

import { useEffect, useMemo, useState } from "react";
import { CollapsiblePanel } from "@/components/ui/collapsible-panel";

type Account = {
  id: string;
  phoneNumberId: string;
  wabaId: string | null;
  businessId: string | null;
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
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.phoneNumberId === selectedPhoneNumberId) ?? null,
    [accounts, selectedPhoneNumberId]
  );

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [activeContact, setActiveContact] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [text, setText] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [manualConnect, setManualConnect] = useState({
    label: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
  });
  const [manualConnectLoading, setManualConnectLoading] = useState(false);
  const [manualConnectMessage, setManualConnectMessage] = useState<string | null>(null);

  const canSend = Boolean(selectedAccount?.phoneNumberId);
  const canUseTemplates = Boolean(selectedAccount?.wabaId);

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((c) =>
      String(c.contact || "").toLowerCase().includes(needle)
    );
  }, [conversations, search]);

  const loadAccounts = async () => {
    setAccountsError(null);
    try {
      const res = await fetch("/api/whatsapp/accounts", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudieron cargar las cuentas.");
      const next = (json.accounts || []) as Account[];
      setAccounts(next);
      if (!selectedPhoneNumberId && next.length > 0) {
        setSelectedPhoneNumberId(next[0].phoneNumberId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error cargando cuentas";
      setAccountsError(message);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoadingAccounts(true);
        if (!mounted) return;
        await loadAccounts();
      } finally {
        if (mounted) setLoadingAccounts(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAccount?.phoneNumberId || !selectedAccount?.wabaId) {
      setTemplates([]);
      setSelectedTemplateKey("");
      if (mode === "template") setMode("text");
      return;
    }

    let mounted = true;
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const url = new URL("/api/whatsapp/templates", window.location.origin);
        url.searchParams.set("phone_number_id", selectedAccount.phoneNumberId);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
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
  }, [mode, selectedAccount?.phoneNumberId, selectedAccount?.wabaId]);

  useEffect(() => {
    if (!selectedAccount?.phoneNumberId) {
      setConversations([]);
      setActiveContact("");
      setMessages([]);
      return;
    }

    let mounted = true;
    const loadConversations = async () => {
      try {
        const url = new URL("/api/whatsapp/conversations", window.location.origin);
        url.searchParams.set("phone_number_id", selectedAccount.phoneNumberId);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
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
  }, [selectedAccount?.phoneNumberId]);

  useEffect(() => {
    if (!selectedAccount?.phoneNumberId || !activeContact) return;

    let mounted = true;
    const loadMessages = async () => {
      try {
        const url = new URL("/api/whatsapp/messages", window.location.origin);
        url.searchParams.set("phone_number_id", selectedAccount.phoneNumberId);
        url.searchParams.set("contact", activeContact);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
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
  }, [selectedAccount?.phoneNumberId, activeContact]);

  const handleOpenChat = () => {
    const next = to.trim();
    if (!next) return;
    setActiveContact(next);
  };

  const handleSend = async () => {
    if (!selectedAccount?.phoneNumberId) {
      setError("Primero conecta una cuenta para enviar mensajes.");
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
        if (!name || !language) throw new Error("Selecciona una plantilla.");
        const res = await fetch("/api/whatsapp/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number_id: selectedAccount.phoneNumberId,
            to: target,
            type: "template",
            template: { name, language },
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "No se pudo enviar la plantilla.");
      } else {
        const body = text.trim();
        if (!body) throw new Error("Escribe un mensaje.");
        const res = await fetch("/api/whatsapp/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number_id: selectedAccount.phoneNumberId,
            to: target,
            type: "text",
            text: body,
          }),
        });
        const json = await res.json().catch(() => ({}));
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

  const handleManualConnect = async () => {
    setManualConnectMessage(null);
    setError(null);

    const phoneNumberId = manualConnect.phoneNumberId.trim();
    const wabaId = manualConnect.wabaId.trim();
    const accessToken = manualConnect.accessToken.trim();
    const label = manualConnect.label.trim();

    if (!phoneNumberId || !accessToken) {
      setManualConnectMessage("Falta phone_number_id y/o access_token.");
      return;
    }

    try {
      setManualConnectLoading(true);
      const res = await fetch("/api/whatsapp/manual-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: phoneNumberId,
          waba_id: wabaId || null,
          access_token: accessToken,
          label: label || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo guardar la conexión.");

      setManualConnectMessage("Conexión guardada. Ya puedes enviar mensajes.");
      setManualConnect({ label: "", phoneNumberId: "", wabaId: "", accessToken: "" });

      await loadAccounts();
      setSelectedPhoneNumberId(phoneNumberId);
    } catch (err: any) {
      setManualConnectMessage(err?.message || "Error guardando conexión manual.");
    } finally {
      setManualConnectLoading(false);
    }
  };

  if (loadingAccounts) {
    return <div className="p-6 text-sm text-slate-500">Cargando WhatsApp…</div>;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="grid min-h-[520px] grid-rows-[auto,1fr] overflow-hidden rounded-2xl border border-slate-200 sm:min-h-[640px] sm:h-[min(860px,calc(100dvh-220px))]">
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                WhatsApp Cloud API
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {selectedAccount?.label || "Mensajería"}
              </div>
              <div className="text-xs text-slate-500">
                Embedded Signup + Cloud API (plantillas y chats).
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <select
                className="w-full min-w-0 max-w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm sm:min-w-[240px] sm:max-w-[640px]"
                value={selectedPhoneNumberId}
                onChange={(e) => setSelectedPhoneNumberId(e.target.value)}
                disabled={!accounts.length}
              >
                {accounts.length ? (
                  accounts.map((a) => (
                    <option key={a.phoneNumberId} value={a.phoneNumberId}>
                      {a.label ? `${a.label} · ` : ""}
                      {a.phoneNumberId}
                      {a.wabaId ? ` · waba_id: ${a.wabaId}` : ""}
                    </option>
                  ))
                ) : (
                  <option value="">Sin cuenta conectada</option>
                )}
              </select>

              <button
                type="button"
                onClick={() => void loadAccounts()}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Recargar
              </button>
            </div>
          </div>

          {accountsError && (
            <p className="mt-2 text-sm text-red-600">Error: {accountsError}</p>
          )}
        </div>

        <div className="grid h-full min-h-0 lg:grid-cols-[380px,1fr]">
          {/* Sidebar */}
          <div className="flex h-full min-h-0 flex-col border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            {!accounts.length && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No hay cuenta conectada. Conecta vía Embedded Signup (panel “Conectar cuenta”) o usa la conexión manual aquí.
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Chats</p>
              <span className="text-xs text-slate-500">{filteredConversations.length}</span>
            </div>

            <div className="mt-3 space-y-2">
              <input
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Buscar por número…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Nuevo chat: 52155..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  disabled={!to.trim()}
                >
                  Abrir
                </button>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
              {filteredConversations.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">
                  {conversations.length === 0 ? "Sin conversaciones todavía." : "Sin resultados."}
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredConversations.map((c) => (
                    <button
                      key={c.contact}
                      type="button"
                      onClick={() => setActiveContact(c.contact)}
                      className={[
                        "w-full px-3 py-3 text-left transition",
                        activeContact === c.contact ? "bg-emerald-700 text-white" : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{c.contact}</span>
                        <span
                          className={[
                            "text-[11px]",
                            activeContact === c.contact ? "text-white/80" : "text-slate-500",
                          ].join(" ")}
                        >
                          {new Date(c.lastMessageAt).toLocaleTimeString("es-MX")}
                        </span>
                      </div>
                      <div
                        className={[
                          "mt-1 truncate text-[12px]",
                          activeContact === c.contact ? "text-white/80" : "text-slate-500",
                        ].join(" ")}
                      >
                        {c.lastText || "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <CollapsiblePanel
              className="mt-3"
              title="Conectar Cloud API manualmente"
              description={
                <>
                  Guarda <code>phone_number_id</code>, <code>waba_id</code> (para plantillas) y un{" "}
                  <code>access_token</code>.
                </>
              }
            >
              <div className="space-y-2">
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Etiqueta (opcional)"
                  value={manualConnect.label}
                  onChange={(e) =>
                    setManualConnect((p) => ({ ...p, label: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="phone_number_id"
                  value={manualConnect.phoneNumberId}
                  onChange={(e) =>
                    setManualConnect((p) => ({ ...p, phoneNumberId: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="waba_id (opcional)"
                  value={manualConnect.wabaId}
                  onChange={(e) =>
                    setManualConnect((p) => ({ ...p, wabaId: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Access token"
                  value={manualConnect.accessToken}
                  onChange={(e) =>
                    setManualConnect((p) => ({ ...p, accessToken: e.target.value }))
                  }
                />
                {manualConnectMessage && (
                  <p className="text-xs text-slate-700">{manualConnectMessage}</p>
                )}
                <button
                  type="button"
                  onClick={handleManualConnect}
                  disabled={manualConnectLoading}
                  className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {manualConnectLoading ? "Guardando…" : "Guardar conexión"}
                </button>
              </div>
            </CollapsiblePanel>
          </div>

          {/* Chat */}
          <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-700 px-5 py-4 text-white">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{activeContact || "Selecciona un chat"}</div>
                <div className="truncate text-xs text-white/80">
                  {selectedAccount
                    ? `${selectedAccount.label ? `${selectedAccount.label} · ` : ""}${selectedAccount.phoneNumberId}`
                    : "Sin cuenta"}
                  {selectedAccount?.wabaId ? ` · waba_id: ${selectedAccount.wabaId}` : ""}
                </div>
              </div>

              <select
                className="rounded-md bg-white/10 px-3 py-2 text-xs text-white outline-none"
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                disabled={!canSend}
                title={!canSend ? "Conecta una cuenta para enviar" : undefined}
              >
                <option value="text">Mensaje</option>
                <option value="template" disabled={!canUseTemplates}>
                  Plantilla
                </option>
              </select>
            </div>

            {error && (
              <div className="border-b border-slate-200 bg-red-50 px-5 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div
              className="flex-1 overflow-auto px-6 py-5"
              style={{
                backgroundColor: "#efeae2",
                backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
            >
              {!activeContact ? (
                <div className="mx-auto max-w-md rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                  Elige una conversación o abre un chat nuevo para empezar.
                </div>
              ) : messages.length === 0 ? (
                <div className="mx-auto max-w-md rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                  Sin mensajes aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={["flex", m.direction === "outbound" ? "justify-end" : "justify-start"].join(" ")}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          m.direction === "outbound" ? "bg-emerald-600 text-white" : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        {m.messageType === "template" ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] opacity-90">Plantilla</div>
                            <div className="font-semibold">
                              {m.templateName} {m.templateLanguage ? `(${m.templateLanguage})` : ""}
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.textBody || "—"}</div>
                        )}
                        <div className="mt-1 text-[10px] opacity-80">
                          {new Date(m.createdAt).toLocaleTimeString("es-MX")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              {mode === "template" && (
                <select
                  className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  disabled={!canSend || !canUseTemplates || loadingTemplates}
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
              )}

              <div className="flex items-end gap-3">
                <textarea
                  className="min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  placeholder={
                    mode === "template"
                      ? "Envía la plantilla seleccionada…"
                      : canSend
                      ? "Escribe un mensaje…"
                      : "Conecta una cuenta para enviar…"
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!canSend || !activeContact}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    isSending ||
                    !canSend ||
                    !activeContact ||
                    (mode === "template" ? !selectedTemplateKey : !text.trim())
                  }
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSending ? "Enviando…" : "Enviar"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Recepción: para ver mensajes entrantes necesitas el webhook configurado en Meta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
