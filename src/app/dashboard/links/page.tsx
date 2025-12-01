import { DashboardLayout } from "@/components/DashboardLayout";
import { LinksManager } from "@/components/LinksManager";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LinksPage() {
  const session = await getSession();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null;
  const profile = user?.profile;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Links</h1>
        <p className="text-sm text-gray-600">Administra tus enlaces públicos.</p>
      </div>
      {profile ? <LinksManager /> : <p className="p-6">Crea tu perfil primero.</p>}
    </DashboardLayout>
  );
}
