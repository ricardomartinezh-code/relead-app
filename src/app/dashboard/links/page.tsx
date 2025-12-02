import { DashboardLayout } from "@/components/DashboardLayout";
import { LinksManager } from "@/components/LinksManager";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LinksPage() {
  const session = await getSession();
  if (!session?.user?.email) {
    return (
      <DashboardLayout>
        <p className="p-6">Inicia sesión para administrar tus enlaces públicos.</p>
      </DashboardLayout>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return <p className="p-6">Crea tu perfil primero.</p>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Enlaces</h1>
          <p className="text-sm text-slate-600">Crea y organiza los botones que verán en tu página pública.</p>
        </div>
        <LinksManager />
      </div>
    </DashboardLayout>
  );
}
