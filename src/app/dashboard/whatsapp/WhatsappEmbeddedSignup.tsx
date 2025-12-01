"use client";

import { useEffect, useState } from "react";

type EmbeddedSignupMessage = {
  type?: string;
  event?: string;
  phone_number_id?: string;
  waba_id?: string;
  current_step?: string;
  error_message?: string;
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

export default function WhatsappEmbeddedSignup() {
  const [sessionInfo, setSessionInfo] = useState<EmbeddedSignupMessage | null>(null);
  const [sdkResponse, setSdkResponse] = useState<FbLoginResponse | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState<string | undefined>();
  const [wabaId, setWabaId] = useState<string | undefined>();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) return;

      try {
        const data = JSON.parse(event.data as string) as EmbeddedSignupMessage;

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            setPhoneNumberId(data.phone_number_id);
            setWabaId(data.waba_id);
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

  const fbLoginCallback = (response: FbLoginResponse) => {
    setSdkResponse(response);

    if (response.authResponse) {
      const code = response.authResponse.code;
      // Enviar code + phone_number_id + waba_id al backend para finalizar el onboarding.
      void code;
      void phoneNumberId;
      void wabaId;
    }
  };

  const launchWhatsAppSignup = () => {
    const { FB } = window as typeof window & { FB?: any };

    if (!FB) {
      // eslint-disable-next-line no-console
      console.error("Facebook SDK no está disponible en window.FB");
      return;
    }

    FB.login(fbLoginCallback, {
      config_id: "3832046253763586",
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
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold shadow-sm transition hover:bg-emerald-700"
      >
        Login with Facebook
      </button>

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
