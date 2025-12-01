import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  const ctaHref = session ? "/dashboard" : "/auth/register";
  const exampleHref = "/auth/login";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex rounded-full bg-white/80 px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            ReLead V1
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Convierte tu link en bio en un mini sitio profesional
            </h1>
            <p className="text-lg text-slate-700 sm:text-xl">
              Crea una página simple, bonita y medible para tus redes. Sin complicarte, sin saber programar.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={ctaHref}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Crear mi página gratis
            </Link>
            <Link href={exampleHref} className="text-sm font-semibold text-slate-800 underline underline-offset-4 hover:text-slate-900">
              Ver ejemplo
            </Link>
          </div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">¿Para quién es ReLead?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Creadores de contenido</h3>
              <p className="mt-2 text-sm text-slate-700">
                Reúne todos tus links en un solo lugar y comparte solo uno en TikTok, Instagram o X.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Negocios pequeños</h3>
              <p className="mt-2 text-sm text-slate-700">
                Lleva a tus clientes a WhatsApp, menú, catálogo o reseñas desde un solo link.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Freelancers y profesionales</h3>
              <p className="mt-2 text-sm text-slate-700">
                Comparte tu portafolio, contacto y redes en una página limpia y fácil de leer.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">¿Cómo funciona ReLead?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paso 1</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Crea tu cuenta</h3>
              <p className="mt-2 text-sm text-slate-700">Regístrate con tu correo y genera tu primer perfil en minutos.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paso 2</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Añade tus links</h3>
              <p className="mt-2 text-sm text-slate-700">Agrega botones hacia tus redes, WhatsApp, catálogo, agenda, etc.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paso 3</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Comparte tu link</h3>
              <p className="mt-2 text-sm text-slate-700">Pega tu link en TikTok, Instagram, X o donde quieras y empieza a ver las visitas.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Lo esencial, sin complicaciones</h2>
          </div>
          <ul className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <li className="flex items-start gap-3 text-sm text-slate-800">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" aria-hidden />
              <span>Link en bio limpio y personalizable.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-800">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" aria-hidden />
              <span>Métricas básicas: visitas y clics por botón.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-800">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" aria-hidden />
              <span>Pensado para móvil primero.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-800">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" aria-hidden />
              <span>Gratis en esta primera versión.</span>
            </li>
          </ul>
        </section>

        <section className="mt-16 flex justify-center">
          <Link
            href={ctaHref}
            className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Crear mi página gratis
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 text-sm text-slate-700">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center sm:text-left">© {new Date().getFullYear()} ReLead Digital</p>
            <div className="flex items-center gap-4">
              <Link href="/legal/privacy" className="hover:text-slate-900">
                Política de privacidad
              </Link>
              <Link href="/legal/terms" className="hover:text-slate-900">
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
