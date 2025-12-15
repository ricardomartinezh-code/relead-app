import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroAuthButtons } from "@/components/HeroAuthButtons";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Globe2,
  LayoutTemplate,
  LineChart,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const stats = [
  { label: "Páginas creadas", value: "12k+" },
  { label: "CTR promedio", value: "38%" },
  { label: "Listo en", value: "< 5 min" },
];

const featureTiles = [
  {
    icon: LayoutTemplate,
    title: "Bloques que brillan",
    description: "Botones, galerías y CTAs con bordes fluidos y sombras suaves.",
  },
  {
    icon: MessageCircle,
    title: "Listo para WhatsApp",
    description: "Embudos y CTAs directos a chat con textos optimizados.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro y consistente",
    description: "Autenticación con Clerk y datos en Postgres/Neon.",
  },
  {
    icon: BarChart3,
    title: "Métricas claras",
    description: "Visualiza clics y páginas vistas sin hojas de cálculo.",
  },
];

const flows = [
  {
    label: "01",
    title: "Diseña",
    description: "Configura tu página con bloques listos y tipografía cuidada.",
  },
  {
    label: "02",
    title: "Publica",
    description: "Obtén tu enlace único y compártelo en bio, campañas y chat.",
  },
  {
    label: "03",
    title: "Mide",
    description: "Sigue CTR, clics y visitas para optimizar tu CTA principal.",
  },
];

const analyticsHighlights = [
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
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(15,23,42,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.05),transparent_30%)]" />
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white/80">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-[0.06]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8">
            <div className="space-y-7">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-slate-900 text-white">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Nuevo look
                </Badge>
                <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                  Inspirado en dub.co
                </Badge>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                  Un solo enlace. Un diseño que se siente de producto final.
                </h1>
                <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
                  ReLead combina bloques listos, CTA a WhatsApp y analíticas limpias. Crea una página profesional en
                  minutos y entiende qué convierte mejor sin perder tiempo ajustando estilos.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <HeroAuthButtons />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <Card key={stat.label} className="border-slate-200/80 shadow-sm">
                    <CardHeader className="space-y-1">
                      <CardDescription className="text-xs uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-2xl text-slate-900">{stat.value}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-slate-200/80 bg-white shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-slate-900/10 blur-3xl" />
              <div className="absolute -right-16 bottom-6 h-48 w-48 rounded-full bg-emerald-200/40 blur-[110px]" />
              <CardHeader className="relative space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Vista previa
                </div>
                <CardTitle className="text-2xl text-slate-900">Página en vivo</CardTitle>
                <CardDescription className="text-slate-600">
                  Una maqueta limpia inspirada en dub.co: bloques agrupados, CTA claro y métricas a un clic.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-700" />
                    <div className="space-y-1">
                      <div className="h-2.5 w-32 rounded-full bg-slate-200" />
                      <div className="h-2 w-20 rounded-full bg-slate-200/80" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-3 text-white shadow-sm">
                      <p className="text-sm font-semibold">CTA principal</p>
                      <p className="text-xs text-white/80">Un botón único que dirige a tu mejor oferta.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">Links rápidos</p>
                        <p className="text-xs text-slate-600">Reordena y publica cambios en segundos.</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-3">
                        <p className="text-sm font-semibold text-emerald-900">WhatsApp listo</p>
                        <p className="text-xs text-emerald-700">Con copy y tracking automático.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      Analytics
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">Tiempo real</span>
                  </div>
                  <div className="mt-3 h-24 rounded-xl bg-[conic-gradient(at_left,_#e2e8f0,_#cbd5e1,_#e2e8f0)] opacity-70" />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
                      <p className="text-sm font-semibold text-slate-900">1.2k</p>
                      <p>Clicks</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
                      <p className="text-sm font-semibold text-slate-900">3.8%</p>
                      <p>CTR</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
                      <p className="text-sm font-semibold text-slate-900">Top</p>
                      <p>WhatsApp</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="producto" className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <Badge variant="secondary" className="bg-slate-200 text-slate-900">
              Producto
            </Badge>
            <h2 className="text-3xl font-semibold">Todo lo esencial en un solo panel</h2>
            <p className="text-sm text-slate-700 sm:text-base">
              Diseño inspirado en dub.co: limpio, intencional y listo para producción.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featureTiles.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="h-full border-slate-200/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="rounded-xl bg-slate-900/90 p-2 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-sm text-slate-700">{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="flujo" className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <Badge variant="secondary" className="bg-slate-200 text-slate-900">
              Flujo
            </Badge>
            <h2 className="text-3xl font-semibold">Construye, publica y mide sin fricción</h2>
            <p className="text-sm text-slate-700 sm:text-base">
              Toma el camino corto: pasos claros y acciones rápidas para lanzar tu link en bio.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {flows.map((flow) => (
              <Card
                key={flow.label}
                className="h-full border-slate-200/80 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <Badge variant="secondary" className="w-fit rounded-full bg-slate-100 text-slate-800">
                    {flow.label}
                  </Badge>
                  <CardTitle className="text-lg">{flow.title}</CardTitle>
                  <CardDescription className="text-sm text-slate-700">{flow.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="metricas" className="mx-auto max-w-6xl space-y-8 px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl sm:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-3">
                <Badge className="bg-slate-900 text-white">Métricas</Badge>
                <h3 className="text-2xl font-semibold text-slate-900">Analítica enfocada en acciones</h3>
                <p className="text-sm text-slate-700 sm:text-base">
                  Inspirado en los paneles de dub.co: visualizaciones claras, botones rápidos y foco en decisiones.
                </p>
                <div className="space-y-3">
                  {analyticsHighlights.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
                      <div className="rounded-full bg-white p-2 shadow-sm">
                        <Icon className="h-5 w-5 text-slate-900" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{title}</p>
                        <p className="text-xs text-slate-600">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-900 text-white shadow-lg">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-white/70">Panel en vivo</p>
                      <p className="text-lg font-semibold">Rendimiento de enlaces</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/15 text-white">
                      Tiempo real
                    </Badge>
                  </div>
                </div>
                <div className="space-y-5 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-sm text-white/70">Clicks</p>
                      <p className="text-2xl font-semibold text-white">1,204</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-sm text-white/70">CTR</p>
                      <p className="text-2xl font-semibold text-white">3.8%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-sm text-white/70">Top link</p>
                      <p className="text-2xl font-semibold text-white">WA</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-4">
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Crecimiento semanal
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">+12%</span>
                    </div>
                    <div className="mt-3 h-28 rounded-lg bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_40%)]" />
                    <p className="mt-3 text-xs text-white/70">
                      Cada bloque refleja cambios en segundos para que pruebes rápido y veas impacto real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white/90">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-semibold">¿Listo para compartir un link que sí convierte?</h3>
              <p className="text-sm text-slate-700 sm:text-base">
                Crea tu página en minutos, con un diseño final que inspira confianza y métricas accionables.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth/register">Empezar gratis</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">Ir al panel</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} ReLead</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/legal/privacy" className="hover:text-slate-900">
              Política de privacidad
            </Link>
            <Link href="/legal/terms" className="hover:text-slate-900">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
