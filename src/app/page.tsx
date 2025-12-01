import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  const ctaHref = "/auth/register";
  const exampleHref = "/demo";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col space-y-16 px-4 py-10">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-center text-white shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-3xl space-y-6">
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                <span>ReLead · Link en bio profesional</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                  Convierte tu link en bio en un mini sitio profesional
                </h1>
                <p className="text-lg text-slate-100 sm:text-xl">
                  Crea una página simple, bonita y medible para tus redes. Sin complicarte, sin saber programar.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href={ctaHref}
                  className="w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Crear mi página gratis
                </Link>
                <Link
                  href={exampleHref}
                  className="w-full text-sm font-semibold text-white/90 underline underline-offset-8 transition hover:text-white sm:w-auto"
                >
                  Ver ejemplo
                </Link>
              </div>
              <div className="grid gap-3 text-left text-sm text-white/80 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Link en bio limpio</div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Botones y bloques listos</div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">Métricas básicas</div>
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Casos de uso</p>
              <h2 className="text-3xl font-semibold text-slate-900">¿Para quién es ReLead?</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {["Creadores de contenido", "Negocios pequeños", "Freelancers y profesionales"].map((title, index) => {
                const descriptions = [
                  "Reúne todos tus links en un solo lugar y comparte solo uno en TikTok, Instagram o X.",
                  "Lleva a tus clientes a WhatsApp, menú, catálogo o reseñas desde un solo link.",
                  "Comparte tu portafolio, contacto y redes en una página limpia y fácil de leer.",
                ];

                return (
                  <div
                    key={title}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {`0${index + 1}`}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    </div>
                    <p className="text-sm text-slate-700">{descriptions[index]}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-10">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pasos</p>
              <h2 className="text-3xl font-semibold text-slate-900">¿Cómo funciona ReLead?</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {["Crea tu cuenta", "Añade tus links", "Comparte tu link"].map((title, index) => {
                const descriptions = [
                  "Regístrate con tu correo y genera tu primer perfil en minutos.",
                  "Agrega botones hacia tus redes, WhatsApp, catálogo, agenda, etc.",
                  "Pega tu link en TikTok, Instagram, X o donde quieras y empieza a ver las visitas.",
                ];

                return (
                  <div
                    key={title}
                    className="flex h-full flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">Paso {index + 1}</span>
                      <span className="h-px flex-1 bg-slate-200" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-700">{descriptions[index]}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Valor</p>
              <h2 className="text-3xl font-semibold text-slate-900">Lo esencial, sin complicaciones</h2>
            </div>
            <ul className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
              {["Link en bio limpio y personalizable.", "Métricas básicas: visitas y clics por botón.", "Pensado para móvil primero.", "Gratis en esta primera versión."].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-800">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-center gap-4 rounded-3xl bg-slate-900 px-6 py-8 text-center text-white shadow-lg">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Empieza gratis</p>
              <h3 className="text-2xl font-semibold">Publica tu página en minutos</h3>
              <p className="text-sm text-slate-200">
                Abre tu cuenta y deja listo tu link en bio con bloques, botones y métricas básicas incluidas.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={session ? "/dashboard" : ctaHref}
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
              >
                Crear mi página gratis
              </Link>
              <Link
                href={exampleHref}
                className="text-sm font-semibold text-white/90 underline underline-offset-8 transition hover:text-white"
              >
                Ver ejemplo
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
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
