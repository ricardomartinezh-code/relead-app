import Link from "next/link";

import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MetaSdkProvider } from "@/app/providers/MetaSdkProvider";

import WhatsappEmbeddedSignup from "../whatsapp/WhatsappEmbeddedSignup";
import WhatsappTestMessagePanel from "../whatsapp/WhatsappTestMessagePanel";

export default async function WabaPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">
            Inicia sesión para configurar WABA.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Accede con tu cuenta para conectar WhatsApp Business y administrar mensajes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/register">Crear cuenta</Link>
            </Button>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            WABA
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            WhatsApp Business
          </h1>
          <p className="text-sm text-slate-600">
            Conecta tu cuenta con el flujo embebido oficial de Meta y administra el envío de mensajes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Conectar cuenta</h2>
              <p className="text-sm text-slate-600">
                Usa el onboarding embebido para obtener el <code>phone_number_id</code> y el <code>waba_id</code>.
              </p>
            </div>
            <MetaSdkProvider>
              <WhatsappEmbeddedSignup />
            </MetaSdkProvider>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Mensajería</h2>
              <p className="text-sm text-slate-600">
                Envía mensajes (texto o plantillas) y revisa conversaciones entrantes/salientes.
              </p>
            </div>
            <WhatsappTestMessagePanel />
            <p className="text-xs text-slate-500">
              Webhook (recepción): configura la URL <code>/api/whatsapp/webhook</code> en tu app de Meta y usa <code>WHATSAPP_WEBHOOK_VERIFY_TOKEN</code>.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
