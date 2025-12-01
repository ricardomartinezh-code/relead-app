"use client";

import { useEffect, useState } from "react";

declare const FB: any;

const allowedOrigins = ["https://www.facebook.com", "https://web.facebook.com"];
const WHATSAPP_CONFIG_ID_CTWA = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA;
const WHATSAPP_CONFIG_ID_NO_CTWA =
  process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA;

type EmbeddedSignupMessage = any;
type FbAuthResponse = { code?: string | null } | null;
type FbLoginResponse = { authResponse?: FbAuthResponse | null } & Record<string, any>;

type WaIdsState = {
  phoneNumberId: string | null;
  wabaId: string | null;
};

export default function WhatsappEmbeddedSignup() {
  const [sessionInfo, setSessionInfo] = useState<EmbeddedSignupMessage | null>(null);
  const [sdkResponse, setSdkResponse] = useState<FbLoginResponse | null>(null);
  const [waIds, setWaIds] = useState<WaIdsState>({
    phoneNumberId: null,
    wabaId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Escuchamos los mensajes del flujo WA_EMBEDDED_SIGNUP
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) return;

      let data: EmbeddedSignupMessage;

      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        console.log("Mensaje no JSON desde postMessage:", event.data);
        return;
      }

      if (data?.type === "WA_EMBEDDED_SIGNUP") {
        if (data.event === "FINISH") {
          const { phone_number_id, waba_id } = data.data || {};

          setWaIds({
            phoneNumberId: phone_number_id ?? null,
            wabaId: waba_id ?? null,
          });

          console.log("FINISH WA_EMBEDDED_SIGNUP:", { phone_number_id, waba_id });
        } else if (data.event === "CANCEL") {
          const { current_step } = data.data || {};
          console.warn("CANCEL WA_EMBEDDED_SIGNUP en paso:", current_step);
        } else if (data.event === "ERROR") {
          const { error_message } = data.data || {};
          console.error("ERROR WA_EMBEDDED_SIGNUP:", error_message);
        }
      }

      setSessionInfo(data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ESTA función YA NO ES async desde el punto de vista de Facebook
  const fbLoginCallback = (response: FbLoginResponse) => {
    // Encapsulamos la lógica async en una IIFE
    (async () => {
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
        setSubmitError(
          "Aún no se han recibido los IDs de WhatsApp (phone_number_id y waba_id) desde el mensaje WA_EMBEDDED_SIGNUP."
        );
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
          setSubmitError(
            data.error || "Error al completar el registro de WhatsApp en el servidor."
          );
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
        setSubmitError(
          err?.message || "Error desconocido al llamar a /api/whatsapp/complete-signup."
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const launchWhatsAppSignupWithConfig = (
    configId: string | undefined,
    variantLabel: string
  ) => {
    setSessionInfo(null);
    setSdkResponse(null);
    setSubmitError(null);

    if (!configId) {
      console.error("Falta configId para la variante:", variantLabel);
      setSubmitError(
        `Falta configurar el ID de configuración de WhatsApp para la variante "${variantLabel}".`
      );
      return;
    }

    if (typeof FB === "undefined") {
      console.error("El SDK de Facebook aún no está disponible (FB es undefined).");
      setSubmitError(
        "El SDK de Facebook todavía no terminó de cargar. Actualiza la página, espera unos segundos y vuelve a intentar."
      );
      return;
    }

    FB.login(
      (response: FbLoginResponse) => {
        fbLoginCallback(response);
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { version: "v3" },
      }
    );
  };

  const launchWhatsAppSignupCtwa = () => {
    launchWhatsAppSignupWithConfig(WHATSAPP_CONFIG_ID_CTWA, "CTWA");
  };

  const launchWhatsAppSignupNoCtwa = () => {
    launchWhatsAppSignupWithConfig(WHATSAPP_CONFIG_ID_NO_CTWA, "sin CTWA");
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={launchWhatsAppSignupCtwa}
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSubmitting
          ? "Conectando con WhatsApp..."
          : "Conectar cuenta de WhatsApp con CTWA"}
      </button>

      <button
        type="button"
        onClick={launchWhatsAppSignupNoCtwa}
        disabled={isSubmitting}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSubmitting
          ? "Conectando con WhatsApp..."
          : "Conectar cuenta de WhatsApp sin CTWA"}
      </button>

      {submitError && (
        <p className="text-sm text-red-500">
          {submitError}
        </p>
      )}

      {submitResult && (
        <div className="rounded border border-green-500 bg-green-50 p-2 text-xs text-green-800">
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

      <div className="mt-4 space-y-2">
        <div>
          <p className="text-xs font-semibold text-gray-500">
            Session info response (WA_EMBEDDED_SIGNUP):
          </p>
          <pre className="mt-1 max-h-60 overflow-auto rounded bg-gray-900 p-2 text-[10px] text-gray-100">
            {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : "Sin datos aún."}
          </pre>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500">
            SDK response (FB.login):
          </p>
          <pre className="mt-1 max-h-60 overflow-auto rounded bg-gray-900 p-2 text-[10px] text-gray-100">
            {sdkResponse ? JSON.stringify(sdkResponse, null, 2) : "Sin datos aún."}
          </pre>
        </div>
      </div>
    </div>
  );
}
