"use client";

import { useEffect, useState } from "react";

import { useMetaSdk } from "@/app/providers/MetaSdkProvider";
import { CollapsiblePanel } from "@/components/ui/collapsible-panel";

declare const FB: any;

const allowedOrigins = ["https://www.facebook.com", "https://web.facebook.com"];
const WHATSAPP_CONFIG_ID_CTWA = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA;
const WHATSAPP_CONFIG_ID_NO_CTWA =
  process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA;
// Meta Embedded Signup usa `extras.setup` (no generamos QR/códigos localmente).
// Mantenerlo mínimo para evitar incompatibilidades entre variantes/config.
const WHATSAPP_EXTRAS = { setup: {} as Record<string, unknown> };
const REQUEST_BUSINESS_MANAGEMENT =
  process.env.NEXT_PUBLIC_META_REQUEST_BUSINESS_MANAGEMENT === "true";

type EmbeddedSignupMessage = any;
type FbAuthResponse = { code?: string | null } | null;
type FbLoginResponse = { authResponse?: FbAuthResponse | null } & Record<string, any>;

type WaIdsState = {
  phoneNumberId: string | null;
  wabaId: string | null;
  businessId?: string | null;
  signupSessionId?: string | null;
};

export default function WhatsappEmbeddedSignup() {
  const { isReady: isMetaSdkReady, error: sdkError, redirectUri } = useMetaSdk();
  const [sessionInfo, setSessionInfo] = useState<EmbeddedSignupMessage | null>(null);
  const [sdkResponse, setSdkResponse] = useState<FbLoginResponse | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [onboardingState, setOnboardingState] = useState<string | null>(null);
  const [onboardingSessionId, setOnboardingSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [waIds, setWaIds] = useState<WaIdsState>({
    phoneNumberId: null,
    wabaId: null,
    businessId: null,
    signupSessionId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  useEffect(() => {
    if (sdkError) {
      setSubmitError(sdkError);
    }
  }, [sdkError]);

  // Escuchamos los mensajes del flujo WA_EMBEDDED_SIGNUP
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) return;

      let data: EmbeddedSignupMessage;

      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        // Si no podemos parsear el mensaje simplemente lo ignoramos. Evitamos logs en consola
        // para no ensuciar la salida del build.
        return;
      }

      if (data?.type === "WA_EMBEDDED_SIGNUP") {
        if (data.event === "FINISH") {
          const {
            phone_number_id,
            waba_id,
            business_id,
            signup_session_id,
            session_id,
          } = data.data || {};

          setWaIds({
            phoneNumberId: phone_number_id ?? null,
            wabaId: waba_id ?? null,
            businessId: business_id ?? null,
            signupSessionId: signup_session_id ?? session_id ?? null,
          });

          // No logeamos en consola para evitar ruido en producción
        } else if (data.event === "CANCEL") {
          const { current_step } = data.data || {};
          // Si el usuario cancela podemos mostrar un mensaje de error opcional
          setSubmitError(
            `Flujo cancelado en el paso ${current_step ?? "desconocido"}. Puedes volver a intentarlo.`
          );
        } else if (data.event === "ERROR") {
          const { error_message } = data.data || {};
          // Registramos el mensaje de error en el estado para mostrarlo al usuario. No hacemos log en consola.
          setSubmitError(error_message || "Error desconocido en el flujo de WhatsApp");
        }
      }

      setSessionInfo(data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const startOnboardingSession = async (configId: string | undefined) => {
    setIsStarting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/whatsapp/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config_id: configId ?? null,
          redirect_uri: redirectUri ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el onboarding.");
      const session = data?.session;
      if (!session?.state || !session?.id) {
        throw new Error("Respuesta inválida al iniciar onboarding.");
      }
      setOnboardingState(String(session.state));
      setOnboardingSessionId(String(session.id));
      return { state: String(session.state), sessionId: String(session.id) };
    } finally {
      setIsStarting(false);
    }
  };

  const cancelOnboardingSession = async () => {
    try {
      await fetch("/api/whatsapp/onboarding/cancel", { method: "POST" });
    } finally {
      setOnboardingState(null);
      setOnboardingSessionId(null);
      setAuthCode(null);
      setWaIds({ phoneNumberId: null, wabaId: null, businessId: null, signupSessionId: null });
      setSessionInfo(null);
      setSdkResponse(null);
      setSubmitResult(null);
      setSubmitError(null);
    }
  };

  // Facebook llama este callback de forma sync; guardamos el code y dejamos que el submit
  // ocurra cuando también tengamos WA IDs + state (el orden de eventos puede variar).
  const fbLoginCallback = (response: FbLoginResponse) => {
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

    setAuthCode(code);
  };

  useEffect(() => {
    if (isSubmitting) return;
    if (!authCode) return;
    if (!onboardingState) return;
    if (!waIds.phoneNumberId || !waIds.wabaId) return;

    let cancelled = false;
    const submit = async () => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitResult(null);

        const res = await fetch("/api/whatsapp/complete-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: authCode,
            phone_number_id: waIds.phoneNumberId,
            waba_id: waIds.wabaId,
            business_id: waIds.businessId ?? null,
            signup_session_id: waIds.signupSessionId ?? null,
            state: onboardingState,
            session_info: sessionInfo ?? null,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || data.error) {
          setSubmitError(
            data.error || "Error al completar el registro de WhatsApp en el servidor."
          );
          return;
        }

        setSubmitResult({
          success: data.success,
          phone_number_id: data.phone_number_id ?? waIds.phoneNumberId,
          waba_id: data.waba_id ?? waIds.wabaId,
          access_token_preview: data.access_token_preview,
          expires_in: data.expires_in,
          scopes: data.scopes,
        });
      } catch (err: any) {
        if (!cancelled) {
          setSubmitError(
            err?.message || "Error desconocido al llamar a /api/whatsapp/complete-signup."
          );
        }
      } finally {
        if (!cancelled) setIsSubmitting(false);
      }
    };

    void submit();
    return () => {
      cancelled = true;
    };
  }, [
    authCode,
    isSubmitting,
    onboardingState,
    sessionInfo,
    waIds.businessId,
    waIds.phoneNumberId,
    waIds.signupSessionId,
    waIds.wabaId,
  ]);

  const launchWhatsAppSignupWithConfig = (
    configId: string | undefined,
    variantLabel: string
  ) => {
    setSessionInfo(null);
    setSdkResponse(null);
    setSubmitError(null);
    setSubmitResult(null);
    setAuthCode(null);

    if (!configId) {
      setSubmitError(
        `Falta configurar el ID de configuración de WhatsApp para la variante "${variantLabel}".`
      );
      return;
    }

    if (!isMetaSdkReady || typeof FB === "undefined") {
      setSubmitError(
        "El SDK de Facebook todavía no terminó de cargar. Espera unos segundos y vuelve a intentar."
      );
      return;
    }

    (async () => {
      try {
        const { state } = await startOnboardingSession(configId);
        const scopes = [
          "whatsapp_business_management",
          "whatsapp_business_messaging",
          ...(REQUEST_BUSINESS_MANAGEMENT ? ["business_management"] : []),
        ].join(",");
        FB.login(
          (response: FbLoginResponse) => {
            fbLoginCallback(response);
          },
          {
            config_id: configId,
            response_type: "code",
            override_default_response_type: true,
            extras: WHATSAPP_EXTRAS,
            redirect_uri: redirectUri ?? undefined,
            state,
            scope: scopes,
            return_scopes: true,
            auth_type: "rerequest",
          }
        );
      } catch (err: any) {
        setSubmitError(err?.message || "No se pudo iniciar el onboarding.");
      }
    })();
  };

  const launchWhatsAppSignup = () => {
    const preferredConfig = WHATSAPP_CONFIG_ID_CTWA || WHATSAPP_CONFIG_ID_NO_CTWA;
    launchWhatsAppSignupWithConfig(preferredConfig, WHATSAPP_CONFIG_ID_CTWA ? "CTWA" : "sin CTWA");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => launchWhatsAppSignupWithConfig(WHATSAPP_CONFIG_ID_CTWA, "CTWA")}
          disabled={isSubmitting || isStarting || !isMetaSdkReady || !WHATSAPP_CONFIG_ID_CTWA}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          title={!WHATSAPP_CONFIG_ID_CTWA ? "Falta NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA" : undefined}
        >
          {isSubmitting || isStarting ? "Conectando..." : "Conectar (CTWA)"}
        </button>

        <button
          type="button"
          onClick={() =>
            launchWhatsAppSignupWithConfig(WHATSAPP_CONFIG_ID_NO_CTWA, "sin CTWA")
          }
          disabled={isSubmitting || isStarting || !isMetaSdkReady || !WHATSAPP_CONFIG_ID_NO_CTWA}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          title={!WHATSAPP_CONFIG_ID_NO_CTWA ? "Falta NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA" : undefined}
        >
          {isSubmitting || isStarting ? "Conectando..." : "Conectar (sin CTWA)"}
        </button>

        {(onboardingState || onboardingSessionId) && (
          <button
            type="button"
            onClick={cancelOnboardingSession}
            disabled={isSubmitting || isStarting}
            className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
          >
            Cancelar intento
          </button>
        )}
      </div>

      {!WHATSAPP_CONFIG_ID_CTWA && !WHATSAPP_CONFIG_ID_NO_CTWA && (
        <p className="text-sm text-red-600">
          Faltan variables: <code>NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA</code> o{" "}
          <code>NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA</code>.
        </p>
      )}

      {onboardingSessionId && onboardingState && (
        <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
          <div>
            Sesión activa: <span className="font-mono">{onboardingSessionId}</span>
          </div>
          <div>
            state: <span className="font-mono">{onboardingState.slice(0, 12)}…</span>
          </div>
        </div>
      )}

      {!isMetaSdkReady && !submitError && (
        <p className="text-sm text-gray-600">
          Cargando SDK de Meta... espera unos segundos antes de continuar.
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-500">
          {submitError}
        </p>
      )}

      {authCode && (!waIds.phoneNumberId || !waIds.wabaId) && !submitError && (
        <p className="text-sm text-slate-600">
          Autorización lista. Esperando IDs de WhatsApp desde el flujo embebido…
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
          {Array.isArray(submitResult.scopes) && submitResult.scopes.length > 0 && (
            <p>scopes: {submitResult.scopes.join(", ")}</p>
          )}
          {submitResult.access_token_preview && (
            <p>access_token (preview): {submitResult.access_token_preview}...</p>
          )}
        </div>
      )}

      <CollapsiblePanel
        title="Debug (Embedded Signup)"
        description="Útil para validar el mensaje WA_EMBEDDED_SIGNUP y la respuesta del SDK."
        className="mt-4"
      >
        <div className="space-y-3">
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
      </CollapsiblePanel>
    </div>
  );
}
