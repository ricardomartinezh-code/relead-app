import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Legal
          </p>
          <h1 className="text-3xl font-bold">Política de Privacidad</h1>
          <p className="text-sm text-slate-600">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </header>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Datos que recopilamos</h2>
            <p className="text-sm text-slate-700">
              Recopilamos la información que proporcionas al crear tu cuenta, configurar tu perfil y
              administrar tus páginas de enlaces. También registramos datos técnicos mínimos para
              mantener la seguridad y el rendimiento del servicio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Uso de la información</h2>
            <p className="text-sm text-slate-700">
              Usamos tus datos para operar ReLead, ofrecer soporte, mejorar el producto y
              comunicarnos contigo sobre cambios o novedades relevantes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Compartir y terceros</h2>
            <p className="text-sm text-slate-700">
              No vendemos tus datos. Solo los compartimos con proveedores necesarios para prestar el
              servicio (por ejemplo, infraestructura y autenticación), siempre bajo acuerdos de
              confidencialidad.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Conservación y seguridad</h2>
            <p className="text-sm text-slate-700">
              Conservamos tus datos mientras tengas una cuenta activa. Aplicamos controles técnicos y
              organizativos razonables para proteger la información.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Tus derechos</h2>
            <p className="text-sm text-slate-700">
              Puedes solicitar acceso, actualización o eliminación de tus datos. Escríbenos si deseas
              ejercer estos derechos o tienes preguntas sobre privacidad.
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
