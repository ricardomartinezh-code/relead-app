import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import Link from "next/link";
import { LineChart, Globe2, Zap, Activity } from "lucide-react";
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
import AnalyticsOverview from "./AnalyticsOverview";

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
        {/* Tarjeta de analíticas principal */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          {/* Capa de degradados decorativos */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_30%)]" />
          <CardHeader className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Paneles
              </Badge>
              <Separator orientation="vertical" className="h-6 bg-white/30" />
              <p className="text-sm text-slate-100/80">Tus métricas de presencia digital</p>
            </div>
            <CardTitle className="text-3xl font-semibold">Analíticas</CardTitle>
            <CardDescription className="max-w-2xl text-base text-slate-100/80">
              Consulta el rendimiento de tus enlaces y redes sociales en tiempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {/* Contenedor de gráfico y métricas */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-inner">
              <AnalyticsOverview />
            </div>
          </CardContent>
        </Card>

        {/* Sección de puntos destacados de analíticas */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: LineChart,
              title: "Evolución diaria",
              description: "Tendencias de clics y visitas para ver qué día convierte mejor.",
            },
            {
              icon: Globe2,
              title: "Origen y dispositivos",
              description: "Detecta de dónde vienen tus clics y en qué pantalla navegan.",
            },
            {
              icon: Zap,
              title: "Acciones rápidas",
              description: "Duplica páginas, reordena enlaces y publica cambios al instante.",
            },
          ].map((item) => (
            <Card key={item.title} className="shadow-sm">
              <CardHeader className="flex items-start gap-3 pb-3">
                {/* Icono dinamico */}
                <item.icon className="h-5 w-5 text-slate-900" />
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
