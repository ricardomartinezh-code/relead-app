"use client";

import { useEffect, useState } from "react";

type EmbeddedSignupMessage = {
  type?: string;
  event?: string;
  phone_number_id?: string;
  waba_id?: string;
  current_step?: string;
  error_message?: string;
  data?: {
    phone_number_id?: string;
    waba_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type FbAuthResponse = {
  code?: string;
  [key: string]: unknown;
};

type FbLoginResponse = {
  authResponse?: FbAuthResponse;
  [key: string]: unknown;
};

const allowedOrigins = ["https://www.facebook.com", "https://web.facebook.com"];
const WHATSAPP_CONFIG_ID = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;

export default function WhatsappEmbeddedSignup() {
  const [sessionInfo, setSessionInfo] = useState<EmbeddedSignupMessage | null>(null);
  const [sdkResponse, setSdkResponse] = useState<FbLoginResponse | null>(null);
  const [waIds, setWaIds] = useState<{ phoneNumberId?: string; wabaId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) return;

      try {
        const data = (typeof event.data === "string"
          ? JSON.parse(event.data)
          : event.data) as EmbeddedSignupMessage;

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id } = data.data ?? {};

            setWaIds({
              phoneNumberId: phone_number_id,
              wabaId: waba_id,
            });
          } else if (data.event === "CANCEL") {
            // eslint-disable-next-line no-console
            console.warn("Embedded signup cancel:", data.current_step);
          } else if (data.event === "ERROR") {
            // eslint-disable-next-line no-console
            console.error("Embedded signup error:", data.error_message);
          }
        }

        setSessionInfo(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Non JSON response", event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fbLoginCallback = async (response: FbLoginResponse) => {
    setSdkResponse(response);
    setSubmitError(null);
    setSubmitResult(null);

    const authResponse = response.authResponse;
    if (!authResponse) {
      setSubmitError("No se recibió authResponse desde Facebook.");
      return;
    }

    const code = authResponse.code;
    if (!code) {
      setSubmitError("No se recibió el código de autorización (code) desde Facebook.");
      return;
    }

    if (!waIds.phoneNumberId || !waIds.wabaId) {
      setSubmitError("Aún no se han recibido los IDs de WhatsApp (phone_number_id y waba_id) desde el mensaje WA_EMBEDDED_SIGNUP.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/whatsapp/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          phone_number_id: waIds.phoneNumberId,
          waba_id: waIds.wabaId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(data.error || "Error al completar el registro de WhatsApp en el servidor.");
      } else {
        setSubmitResult({
          success: data.success,
          phone_number_id: data.phone_number_id ?? waIds.phoneNumberId,
          waba_id: data.waba_id ?? waIds.wabaId,
          access_token_preview: data.access_token_preview,
          expires_in: data.expires_in,
        });
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Error desconocido al llamar a /api/whatsapp/complete-signup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const launchWhatsAppSignup = () => {
    setSessionInfo(null);
    setSdkResponse(null);
    setSubmitError(null);
    setSubmitResult(null);

    if (!WHATSAPP_CONFIG_ID) {
      console.error("Falta NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID");
      setSubmitError("Falta configurar el ID de configuración de WhatsApp (NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID).");
      return;
    }

    const { FB } = window as typeof window & { FB?: any };

    if (!FB) {
      // eslint-disable-next-line no-console
      console.error("Facebook SDK no está disponible en window.FB");
      setSubmitError("Facebook SDK no está disponible en window.FB.");
      return;
    }

    // @ts-expect-error FB viene del SDK global
    FB.login(fbLoginCallback, {
      config_id: WHATSAPP_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

  return (
    <div className="mt-6 space-y-4">
      <button
        type="button"
        onClick={launchWhatsAppSignup}
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSubmitting ? "Conectando con WhatsApp..." : "Conectar cuenta de WhatsApp"}
      </button>

      {submitError && (
        <p className="mt-2 text-sm text-red-500">
          {submitError}
        </p>
      )}

      {submitResult && (
        <div className="mt-3 rounded border border-green-500 bg-green-50 p-2 text-xs text-green-800">
          <p>Registro completado correctamente.</p>
          <p>phone_number_id: {submitResult.phone_number_id}</p>
          <p>waba_id: {submitResult.waba_id}</p>
          {submitResult.expires_in && (
            <p>expires_in (segundos): {submitResult.expires_in}</p>
          )}
          {submitResult.access_token_preview && (
            <p>access_token (preview): {submitResult.access_token_preview}...</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Session info</h3>
          <pre className="mt-2 overflow-auto text-xs text-slate-800">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">SDK response</h3>
          <pre className="mt-2 overflow-auto text-xs text-slate-800">
            {JSON.stringify(sdkResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
