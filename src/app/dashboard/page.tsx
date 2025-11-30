import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.email) {
    return <p className="p-6">Necesitas iniciar sesión.</p>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: {
        include: {
          links: true,
          pageViews: true,
        },
      },
    },
  });
  const profile = user?.profile;
  if (!profile) return <p className="p-6">Configura tu perfil primero.</p>;
  const linkIds = profile.links.map((l) => l.id);
  const totalClicks = await prisma.linkClick.count({ where: { linkId: { in: linkIds } } });
  const totalViews = profile.pageViews.length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Hola {user?.name || ""}</h1>
        <p className="text-sm text-gray-600">Gestiona tu link in bio y revisa las métricas.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Visitas totales</p>
          <p className="text-3xl font-bold">{totalViews}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Clics totales</p>
          <p className="text-3xl font-bold">{totalClicks}</p>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-white p-4 shadow">
        <p className="text-sm text-gray-600">Tu URL pública</p>
        <Link href={`/${profile.slug}`} className="text-blue-600 underline">/ {profile.slug}</Link>
      </div>
    </DashboardLayout>
  );
}
