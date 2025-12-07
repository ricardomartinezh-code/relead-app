import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  LayoutTemplate,
  Link2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    title: "Listo en minutos",
    description: "Crea tu link, publica y prueba sin tocar código.",
    icon: Sparkles,
  },
  {
    title: "Optimizado para WhatsApp",
    description: "Conecta flujos y CTAs pensados para chat.",
    icon: MessageCircle,
  },
  {
    title: "Componentes shadcn",
    description: "UI consistente, accesible y lista para crecer.",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    label: "Paso 1",
    title: "Crea tu perfil",
    description: "Nombre, biografía y tu imagen para que la página se sienta tuya.",
  },
  {
    label: "Paso 2",
    title: "Añade tus enlaces",
    description: "Botones a tus redes, productos, contenido o embudos de WhatsApp.",
  },
  {
    label: "Paso 3",
    title: "Comparte tu link",
    description: "Colócalo en TikTok, Instagram, X o donde tengas audiencia.",
  },
];

const features = [
  {
    title: "Diseños listos",
    description: "Plantillas limpias con sombras suaves, bordes fluidos y tipografía cuidada.",
    icon: LayoutTemplate,
  },
  {
    title: "Un solo enlace",
    description: "Centraliza todo tu contenido y evita enlaces rotos o bios saturadas.",
    icon: Link2,
  },
  {
    title: "Medible",
    description: "Entiende qué CTA convierte mejor y ajusta tu página rápido.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06)_0,_transparent_45%)]"
        aria-hidden
      />
      <Navbar />
      <main className="flex-1">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />
            <div className="absolute left-0 top-0 h-24 w-24 -translate-x-6 -translate-y-6 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-10 p-10 sm:p-12 lg:grid-cols-[1.15fr,1fr]">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-white/15 text-white">
                    Nuevo diseño
                  </Badge>
                  <Badge variant="outline" className="border-white/40 text-white">
                    Construido con shadcn/ui
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                    Crea tu página de enlaces con un diseño limpio y medible
                  </h1>
                  <p className="max-w-xl text-base text-slate-100/90 sm:text-lg">
                    Usa componentes listos, conecta WhatsApp y comparte un solo link que agrupa todo tu contenido sin
                    perder tiempo configurando estilos.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Ir al panel
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                    <Link href="/demo">Ver un ejemplo</Link>
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {highlights.map(({ title, description, icon: Icon }) => (
                    <Card
                      key={title}
                      className="border-white/10 bg-white/5 text-white shadow-none transition hover:-translate-y-0.5 hover:border-white/30 hover:shadow-lg backdrop-blur-sm"
                    >
                      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                        <div className="rounded-full bg-white/10 p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold text-white">{title}</CardTitle>
                          <CardDescription className="text-sm text-slate-100/80">{description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
                <CardHeader className="space-y-3">
                  <Badge className="w-fit bg-emerald-500 text-white">Preview</Badge>
                  <CardTitle className="text-2xl font-semibold">Tu página en un vistazo</CardTitle>
                  <CardDescription className="text-slate-100/80">
                    Publica tu link y destaca tus productos, redes y embudos de WhatsApp en un bloque ordenado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/30" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-32 rounded-full bg-white/40" />
                        <div className="h-2 w-24 rounded-full bg-white/30" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-sm font-semibold">Botón principal</p>
                        <p className="text-xs text-white/70">Tu CTA prioritario en un click.</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-semibold">Listado de enlaces</p>
                        <p className="text-xs text-white/70">Agrega y reordena sin salir del panel.</p>
                      </div>
                      <div className="rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-300/40">
                        <p className="text-sm font-semibold">CTA a WhatsApp</p>
                        <p className="text-xs text-white/80">Listo para que te escriban directo.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-3 text-center">
              <Badge variant="secondary" className="bg-slate-200 text-slate-900">
                Cómo funciona
              </Badge>
              <div className="space-y-1">
                <h2 className="text-3xl font-semibold">Publica en tres pasos</h2>
                <p className="text-sm text-slate-700 sm:text-base">
                  Configura tu página y comparte el enlace en menos de lo que tardas en preparar una historia.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <Card
                  key={step.title}
                  className="h-full border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader className="space-y-3">
                    <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-800">
                      {step.label}
                    </Badge>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription className="text-sm text-slate-700">{step.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-3 text-center">
              <Badge variant="secondary" className="bg-slate-200 text-slate-900">
                Beneficios
              </Badge>
              <div className="space-y-1">
                <h2 className="text-3xl font-semibold">Hecho para compartir mejor</h2>
                <p className="text-sm text-slate-700 sm:text-base">
                  Diseñado para creadores, negocios locales y equipos que quieren claridad.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <Card
                  key={title}
                  className="h-full border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
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

          <section className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-lg">
            <div className="mx-auto max-w-2xl space-y-4">
              <h3 className="text-2xl font-semibold">Empieza a construir tu presencia en un solo enlace</h3>
              <p className="text-sm text-slate-700 sm:text-base">
                Abre tu panel de ReLead, completa tu perfil y comparte tu link en bio en cualquier red social.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/auth/register">Crear mi página</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/dashboard">Ir al panel</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
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
