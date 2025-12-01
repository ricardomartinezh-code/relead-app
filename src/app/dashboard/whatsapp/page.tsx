import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import Script from "next/script";
import WhatsappEmbeddedSignup from "./WhatsappEmbeddedSignup";

export default async function WhatsappPage() {
  const session = await getSession();
  if (!session?.user?.email) return <p className="p-6">No autorizado</p>;

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-slate-100">
        <Script id="facebook-sdk-init" strategy="afterInteractive">
          {`
    window.fbAsyncInit = function() {
      FB.init({
        appId            : '1112702537665058',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v24.0'
      });
    };
  `}
        </Script>

        <Script
          id="facebook-sdk-script"
          src="https://connect.facebook.net/en_US/sdk.js"
          async
          defer
          crossOrigin="anonymous"
        />

        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            Conecta tu WhatsApp Business
          </h1>
          <p className="mt-2 text-gray-700">
            Al conectar tu cuenta de WhatsApp Business podrás recibir mensajes y registrar
            clientes directamente desde tu página de ReLead.
          </p>

          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Primeros pasos con el registro insertado de WhatsApp
            </h2>
            <p className="text-gray-700">
              Utiliza el registro insertado de WhatsApp para vincular tu cuenta de negocio en la
              plataforma de WhatsApp Business y habilitar el onboarding de clientes en la API de la nube.
            </p>
            <p className="text-gray-700">
              Sigue el flujo guiado para autenticarte, elegir la cuenta correcta y autorizar el acceso
              necesario para completar la conexión.
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-700">
              <li>Inicia sesión con tu cuenta de Facebook Business.</li>
              <li>Selecciona la cuenta de WhatsApp Business.</li>
              <li>Autoriza el acceso y completa el registro.</li>
            </ol>
            <WhatsappEmbeddedSignup />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
