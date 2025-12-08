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
  <h2 className="text-xl font-semibold">1. Finalidad de esta política</h2>
  <p className="text-sm text-slate-700">
    Esta Política resume, de forma accesible, los criterios generales que ReLead aplica para el
    tratamiento de datos personales. Su objetivo es complementar la versión extendida disponible en
    el panel de administración y ofrecer a las personas usuarias una visión clara sobre el uso de su
    información.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">2. Información que tratamos</h2>
  <p className="text-sm text-slate-700">
    De manera enunciativa, podemos tratar datos identificativos, de contacto, configuración de
    páginas, métricas de uso y registros de interacción con el sitio. Parte de esta información se
    obtiene directamente de la persona usuaria y otra surge de la navegación o del uso de las
    herramientas de analítica.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">3. Uso de la información</h2>
  <p className="text-sm text-slate-700">
    La información se utiliza para prestar el servicio, mantener la seguridad de la plataforma,
    analizar su funcionamiento y comunicar novedades relevantes. En ningún caso se emplea con fines
    incompatibles con las expectativas razonables de la persona usuaria.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">4. Compartición y conservación</h2>
  <p className="text-sm text-slate-700">
    ReLead puede compartir datos con proveedores que apoyan la operación tecnológica de la
    plataforma, bajo compromisos de confidencialidad. La información se conserva durante el tiempo
    necesario para cumplir las finalidades indicadas o durante los plazos que exija la normativa
    aplicable.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">5. Derechos y contacto</h2>
  <p className="text-sm text-slate-700">
    Las personas usuarias pueden solicitar información adicional, así como ejercer sus derechos de
    acceso, rectificación o eliminación de datos, escribiendo a la dirección de contacto indicada en
    la propia plataforma. Las solicitudes se atenderán con la mayor diligencia posible dentro del
    marco legal aplicable.
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
