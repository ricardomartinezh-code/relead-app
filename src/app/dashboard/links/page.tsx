import { DashboardLayout } from "@/components/DashboardLayout";
import { LinksManager } from "@/components/LinksManager";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LinksPage() {
  const session = await getSession();
  if (!session?.user?.email) return <p className="p-6">No autorizado</p>;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return <p className="p-6">Crea tu perfil primero.</p>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Links</h1>
        <p className="text-sm text-gray-600">Administra tus enlaces públicos.</p>
      </div>
      <LinksManager />
    </DashboardLayout>
  );
}
