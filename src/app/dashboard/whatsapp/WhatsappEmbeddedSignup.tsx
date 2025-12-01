"use client";

import { useEffect } from "react";

export default function WhatsappEmbeddedSignup() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com") return;

      try {
        const data = JSON.parse(event.data);

        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Datos recibidos de WA_EMBEDDED_SIGNUP:", data);
        }
      } catch (error) {
        console.error("Error al procesar mensaje de WA_EMBEDDED_SIGNUP:", error);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="space-y-3">
      {/* TODO: Insertar aquí el div del embedded signup proporcionado por Meta */}
      <button
        id="whatsapp-embedded-signup-button"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
      >
        Conectar WhatsApp Business
      </button>
    </div>
  );
}
