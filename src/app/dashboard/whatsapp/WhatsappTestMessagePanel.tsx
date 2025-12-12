"use client";

import { FormEvent, useState } from "react";

type TestMessageResult = {
  success?: boolean;
  phoneNumberId?: string;
  to?: string;
  message?: string;
  metaResponse?: unknown;
  error?: string;
};

export default function WhatsappTestMessagePanel() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("Selecciona una plantilla de marketing o escribe un mensaje personalizado");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestMessageResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!phoneNumberId.trim() || !to.trim()) {
      setError("Completa el phone_number_id y el destinatario de prueba.");
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch("/api/whatsapp/send-test-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: phoneNumberId.trim(),
          to: to.trim(),
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "No se pudo enviar el mensaje de prueba.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err?.message || "Error desconocido al enviar el mensaje de prueba.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="phoneNumberId">
          phone_number_id
        </label>
        <input
          id="phoneNumberId"
          name="phoneNumberId"
          value={phoneNumberId}
          onChange={(event) => setPhoneNumberId(event.target.value)}
          placeholder="Ej: 123456789"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="text-xs text-slate-500">Usa el ID devuelto por el flujo embebido.</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="wabaId">
          waba_id
        </label>
        <input
          id="wabaId"
          name="wabaId"
          value={wabaId}
          onChange={(event) => setWabaId(event.target.value)}
          placeholder="Ej: 987654321"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="text-xs text-slate-500">Referencia del negocio asociada a tu número.</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="to">
          Destinatario de prueba
        </label>
        <input
          id="to"
          name="to"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="Número en formato internacional"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="text-xs text-slate-500">Ejemplo: 5215512345678</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700" htmlFor="message">
          Mensaje opcional
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
      >
        {isSending ? "Enviando mensaje..." : "Enviar mensaje de prueba"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">Resultado del envío</p>
          <p>
            <span className="font-medium">phone_number_id:</span> {result.phoneNumberId || phoneNumberId || "-"}
          </p>
          {wabaId && (
            <p>
              <span className="font-medium">waba_id:</span> {wabaId}
            </p>
          )}
          <p>
            <span className="font-medium">Destinatario:</span> {result.to}
          </p>
          <p>
            <span className="font-medium">Mensaje:</span> {result.message}
          </p>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Respuesta de Meta:</p>
            <pre className="max-h-48 overflow-auto rounded bg-slate-900 p-2 text-[11px] text-slate-100">
              {JSON.stringify(result.metaResponse ?? result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </form>
  );
}
