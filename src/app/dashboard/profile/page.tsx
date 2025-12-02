import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.email) {
    return (
      <DashboardLayout>
        <p className="p-6">Inicia sesión para actualizar tu perfil.</p>
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
