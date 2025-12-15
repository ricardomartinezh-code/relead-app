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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/5">
          <h1 className="text-xl font-semibold text-foreground">
            Inicia sesión para configurar WABA.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm shadow-black/5">
          Necesitas crear tu perfil antes de conectar WhatsApp.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            WABA
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            WhatsApp Business
          </h1>
          <p className="text-sm text-muted-foreground">
            Conecta tu cuenta con el flujo embebido oficial de Meta y administra el envío de mensajes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Conectar cuenta</h2>
              <p className="text-sm text-muted-foreground">
                Usa el onboarding embebido para obtener el <code>phone_number_id</code> y el <code>waba_id</code>.
              </p>
            </div>
            <MetaSdkProvider>
              <WhatsappEmbeddedSignup />
            </MetaSdkProvider>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/5">
            <WhatsappTestMessagePanel />
            <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
              <span className="font-semibold">Webhook (recepción):</span>{" "}
              <code className="break-all">https://relead.com.mx/api/meta-webhook</code>{" "}
              <span className="mx-1">·</span>{" "}
              <span className="font-semibold">token</span>{" "}
              <code className="break-all">verify_whatsapp_rlead</code>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
