import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <DashboardLayout>
        <Card className="border-slate-100 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Inicia sesión para administrar tu panel</CardTitle>
            <CardDescription>
              Accede con tu cuenta de Clerk o regístrate para empezar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Crear cuenta</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const user = await getUserById(userId);

  if (!user?.profileId) return <p className="p-6">Configura tu perfil primero.</p>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_30%)]" />
          <CardHeader className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Inicio
              </Badge>
              <Separator orientation="vertical" className="h-6 bg-white/30" />
              <p className="text-sm text-slate-100/80">Todo lo que necesitas para tu presencia digital.</p>
            </div>
            <CardTitle className="text-3xl font-semibold">Inicio</CardTitle>
            <CardDescription className="max-w-2xl text-base text-slate-100/80">
              Configura tu perfil, tus páginas de enlaces y las integraciones desde un solo lugar.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-wrap gap-3">
            <Button asChild className="bg-white text-slate-900 hover:bg-white/90">
              <Link href="/dashboard/profile">Ir a Perfil</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 text-white hover:bg-white/10">
              <Link href="/dashboard/link-pages">Abrir editor de páginas</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Perfil</CardTitle>
              <CardDescription>Nombre, bio, avatar y redes sociales.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="default" className="w-full">
                <Link href="/dashboard/profile">Editar perfil</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Páginas</CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700" variant="secondary">
                  Nuevo
                </Badge>
              </div>
              <CardDescription>Construye y ordena tus páginas link-in-bio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/link-pages">Abrir editor</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comercial</p>
              <h2 className="text-lg font-semibold text-slate-900">Canales y captación</h2>
              <p className="text-sm text-slate-600">Conecta WhatsApp Business y gestiona tus CTA.</p>
            </div>
            <Badge variant="outline">Beta</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription>Configura mensajes de prueba y webhook.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/whatsapp">Abrir Comercial</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Documentos legales</CardTitle>
                <CardDescription>Consulta políticas públicas fuera del panel.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/legal/privacy">Política de privacidad</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/legal/terms">Términos y condiciones</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Páginas</h2>
              <p className="text-sm text-slate-600">
                Construye y ordena tus páginas link-in-bio con bloques, diseño y enlaces.
              </p>
            </div>
            <Link
              href="/dashboard/link-pages"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Abrir editor
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Legal</h2>
              <p className="text-sm text-slate-600">Consulta privacidad y términos directamente desde el panel.</p>
            </div>
            <Link
              href="/dashboard/legal"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Ver documentos
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Ajustes</h2>
              <p className="text-sm text-slate-600">Administra el username, avatar y enlaces sociales de tu perfil.</p>
            </div>
            <Link
              href="/dashboard/settings/profile"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Ajustar perfil
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
