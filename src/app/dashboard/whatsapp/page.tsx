import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import Script from "next/script";
import WhatsappEmbeddedSignup from "./WhatsappEmbeddedSignup";

export default async function WhatsappPage() {
  const session = await getSession();
  if (!session?.user?.email) return <p className="p-6">No autorizado</p>;

  return (
    <DashboardLayout>
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
        id="facebook-jssdk"
        async
        defer
        crossOrigin="anonymous"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/sdk.js"
      />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Integración con WhatsApp Business</h1>
        <p className="text-sm text-gray-600">Conecta tu cuenta de WhatsApp Business para habilitar el signup embebido.</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow space-y-4">
        <p className="text-sm text-gray-700">
          Sigue los pasos para completar el registro embebido de WhatsApp Business y conectar tu cuenta.
        </p>
        <WhatsappEmbeddedSignup />
      </div>
    </DashboardLayout>
  );
}
