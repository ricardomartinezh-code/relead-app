import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Legal
          </p>
          <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
          <p className="text-sm text-slate-600">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </header>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Aceptación</h2>
            <p className="text-sm text-slate-700">
              Al usar ReLead aceptas estos términos y garantizas que tienes la capacidad legal para
              hacerlo. Si representas a una organización, confirmas que cuentas con la autoridad
              necesaria.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Uso del servicio</h2>
            <p className="text-sm text-slate-700">
              Eres responsable del contenido que publiques en tus páginas. No uses ReLead para
              actividades ilícitas, spam o contenido que vulnere derechos de terceros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Propiedad intelectual</h2>
            <p className="text-sm text-slate-700">
              Conservas la propiedad de tu contenido. ReLead conserva los derechos sobre la
              plataforma, su marca y su código.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Disponibilidad y cambios</h2>
            <p className="text-sm text-slate-700">
              Trabajamos para ofrecer un servicio estable, pero no garantizamos disponibilidad
              ininterrumpida. Podemos actualizar o modificar el producto; te informaremos de cambios
              relevantes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Cancelación</h2>
            <p className="text-sm text-slate-700">
              Puedes dejar de usar ReLead en cualquier momento. Podemos suspender cuentas que violen
              estos términos o la ley.
            </p>
          </section>
        </div>

        <div>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
