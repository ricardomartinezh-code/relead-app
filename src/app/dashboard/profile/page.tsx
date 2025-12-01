import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.email) redirect("/auth/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return <p className="p-6">Crea tu perfil primero.</p>;

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
