import Link from "next/link";

import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";

import WhatsappEmbeddedSignup from "./WhatsappEmbeddedSignup";
import WhatsappTestMessagePanel from "./WhatsappTestMessagePanel";

export default async function WhatsappPage() {
  const session = await getSession();

  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Inicia sesión para conectar WhatsApp.</h1>
          <p className="mt-2 text-sm text-slate-600">
            Usa tus credenciales para acceder o crea una cuenta nueva para empezar.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const user = await getUserById(userId);

  if (!user?.profileId) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
          Necesitas crear tu perfil antes de conectar WhatsApp.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">WhatsApp Business</h1>
          <p className="text-sm text-slate-600">
            Completa el onboarding con Meta y envía un mensaje de prueba usando tu phone_number_id y waba_id.
          </p>
          <p className="text-xs text-slate-500">
            Configura las variables <code>NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA</code> y
            {" "}
            <code>NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA</code> para habilitar el flujo embebido.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Conectar cuenta</h2>
              <p className="text-sm text-slate-600">
                Usa el flujo oficial de Meta para obtener el <code>phone_number_id</code> y el <code>waba_id</code> asociados a tu
                número.
              </p>
            </div>
            <WhatsappEmbeddedSignup />
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Enviar mensaje de prueba</h2>
              <p className="text-sm text-slate-600">
                Guarda los IDs obtenidos y envía un mensaje de validación a un destinatario de prueba.
              </p>
            </div>
            <WhatsappTestMessagePanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
