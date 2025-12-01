"use client";

import { useEffect } from "react";

function handleMessage(event: MessageEvent) {
  if (event.origin !== "https://www.facebook.com") return;

  try {
    const data = JSON.parse(event.data as string);

    if (data.type === "WA_EMBEDDED_SIGNUP") {
      console.log("Datos recibidos de WA_EMBEDDED_SIGNUP:", data);
      // TODO: más adelante enviar estos datos a una API interna para guardarlos
    }
  } catch (error) {
    console.error("Error al procesar mensaje de WA_EMBEDDED_SIGNUP:", error);
  }
}

export default function WhatsappEmbeddedSignup() {
  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="mt-4">
      <button
        type="button"
        id="whatsapp-embedded-signup-button"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
      >
        Conectar WhatsApp Business
      </button>

      {/* TODO: aquí se podrá reemplazar el botón por el <div> oficial del registro insertado de WhatsApp de Meta */}
    </div>
  );
}
