import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import Script from "next/script";
import { redirect } from "next/navigation";
import WhatsappEmbeddedSignup from "./WhatsappEmbeddedSignup";

export default async function WhatsappPage() {
  const session = await getSession();
  if (!session?.user?.email) redirect("/auth/login");

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

        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">Conecta tu WhatsApp Business</h1>
            <p className="mt-2 text-gray-700">
              Habilita el registro insertado para vincular tu cuenta de WhatsApp Business y gestionar
              conversaciones directamente desde ReLead.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Primeros pasos</h2>
                <p className="mt-1 text-gray-700">
                  Sigue el flujo guiado de Meta para autorizar la cuenta correcta y finalizar el onboarding.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {["Inicia sesión con Facebook Business.", "Selecciona tu cuenta de WhatsApp Business.", "Autoriza y completa la conexión."].map((step) => (
                  <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-gray-800">
                    {step}
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <WhatsappEmbeddedSignup />
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
