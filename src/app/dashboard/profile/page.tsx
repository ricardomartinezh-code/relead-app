import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null;
  const profile = user?.profile;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-sm text-gray-600">Actualiza la información de tu página pública.</p>
      </div>
      {profile ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <ProfileForm profile={profile} />
        </div>
      ) : (
        <p className="p-6">Crea tu perfil primero.</p>
      )}
    </DashboardLayout>
  );
}
