import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.email) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Inicia sesión para administrar tu panel.</h1>
          <p className="mt-2 text-sm text-slate-600">Accede con tus credenciales o crea una cuenta nueva.</p>
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

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return <p className="p-6">Crea tu perfil primero.</p>;

  const profile = user.profile;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Perfil público</h1>
          <p className="text-sm text-slate-600">
            La información que completes aquí se mostrará en tu página de enlaces.
          </p>
        </div>

        <div className="max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </DashboardLayout>
  );
}
