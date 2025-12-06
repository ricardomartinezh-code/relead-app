import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const steps = [
  {
    title: "1. Crea tu perfil",
    description: "Completa tu nombre, biografía y una foto para tu página pública.",
  },
  {
    title: "2. Añade tus enlaces",
    description: "Agrega botones hacia tus redes sociales, productos, contenido o WhatsApp.",
  },
  {
    title: "3. Comparte tu link",
    description: "Coloca tu URL de ReLead en TikTok, Instagram, X y cualquier otra plataforma.",
  },
];

const benefits = [
  "Una sola página para todo tu contenido",
  "Diseñado para creadores y pequeños negocios",
  "Listo para integrarse con WhatsApp Business",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col space-y-16 px-4 py-12">
          <section className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200 sm:px-10">
            <div className="mx-auto max-w-3xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">ReLead</p>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                  Crea tu página de enlaces en minutos
                </h1>
                <p className="text-base text-slate-700 sm:text-lg">
                  Centraliza tu contenido, conecta tus redes y entiende qué enlaces funcionan mejor.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/dashboard"
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
                >
                  Ir al panel
                </Link>
                <Link
                  href="/demo"
                  className="w-full rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
                >
                  Ver un ejemplo
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Cómo funciona</p>
              <h2 className="text-3xl font-semibold">Tres pasos para publicar</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="flex h-full flex-col gap-3 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-700">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Beneficios</p>
              <h2 className="text-3xl font-semibold">Hecho para compartir mejor</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {benefits.map((title) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Publícalo una vez y dirige a tus visitantes al contenido correcto, sin enlaces rotos ni confusión.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-900 px-8 py-10 text-center text-white shadow-lg">
            <div className="mx-auto max-w-2xl space-y-3">
              <h3 className="text-2xl font-semibold">Empieza a construir tu presencia en un solo enlace.</h3>
              <p className="text-sm text-slate-200">
                Abre tu panel de ReLead, completa tu perfil y comparte tu link en bio en cualquier red social.
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/dashboard"
                  className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Abrir ReLead
                </Link>
                <Link
                  href="/demo"
                  className="w-full text-sm font-semibold text-slate-100 underline underline-offset-8 transition hover:text-white sm:w-auto"
                >
                  Ver un ejemplo
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} ReLead</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard/legal/privacy" className="hover:text-slate-900">
              Política de privacidad
            </Link>
            <Link href="/dashboard/legal/terms" className="hover:text-slate-900">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
