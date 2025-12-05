import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Inicia sesión para administrar tu panel.</h1>
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

  if (!user?.profileId) return <p className="p-6">Configura tu perfil primero.</p>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">Panel de ReLead</h1>
          <p className="mt-2 text-sm text-slate-600">
            Desde aquí podrás configurar tu perfil, tus enlaces y las integraciones.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Perfil</h2>
              <p className="text-sm text-slate-600">Actualiza tu nombre, biografía y foto pública.</p>
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Ir a Perfil
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Enlaces</h2>
              <p className="text-sm text-slate-600">Crea y organiza los botones que verán en tu página pública.</p>
            </div>
            <Link
              href="/dashboard/links"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Ir a Enlaces
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">WhatsApp</h2>
              <p className="text-sm text-slate-600">
                Próximamente: conecta tu cuenta de WhatsApp Business.
              </p>
            </div>
            <Link
              href="/dashboard/whatsapp"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Ver integración
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
