import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { getUserById, getProfileById } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Inicia sesión para administrar tu panel.</h1>
          <p className="mt-2 text-sm text-slate-600">Accede con tus credenciales o crea una cuenta nueva.</p>
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
  if (!user?.profileId) return <p className="p-6">Crea tu perfil primero.</p>;

  const profile = await getProfileById(user.profileId);
  if (!profile) return <p className="p-6">Perfil no encontrado.</p>;

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
