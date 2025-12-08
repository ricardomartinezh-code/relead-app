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
  <h2 className="text-xl font-semibold">1. Naturaleza del servicio</h2>
  <p className="text-sm text-slate-700">
    ReLead es una plataforma tecnológica que permite crear y administrar páginas de enlaces con fines
    profesionales, comerciales o personales. El acceso al servicio implica la aceptación de estos
    Términos, que constituyen un acuerdo de carácter mercantil entre la persona usuaria y ReLead.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">2. Obligaciones de la persona usuaria</h2>
  <p className="text-sm text-slate-700">
    Debes utilizar la plataforma de forma diligente y conforme a la normativa aplicable. Eres
    responsable del contenido que publiques y de garantizar que no vulnera derechos de terceros,
    incluyendo derechos de propiedad intelectual, protección de datos y competencia económica.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">3. Propiedad intelectual y licencias</h2>
  <p className="text-sm text-slate-700">
    La titularidad del software, interfaces, marcas y demás activos intangibles vinculados a ReLead
    corresponde a sus desarrolladores y/o licenciantes. El uso de la plataforma no supone cesión de
    dichos derechos, sino una licencia limitada y revocable para aprovechar sus funcionalidades.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">4. Responsabilidad y limitaciones</h2>
  <p className="text-sm text-slate-700">
    Aunque se realizan esfuerzos razonables para asegurar la continuidad del servicio, no se garantiza
    la ausencia total de interrupciones o errores. En ningún caso ReLead será responsable por daños
    indirectos o pérdida de oportunidades derivadas del uso de la plataforma, salvo que la normativa
    aplicable disponga lo contrario.
  </p>
</section>

<section className="space-y-2">
  <h2 className="text-xl font-semibold">5. Vigencia y modificaciones</h2>
  <p className="text-sm text-slate-700">
    Estos Términos permanecerán vigentes mientras la persona usuaria mantenga una cuenta activa o
    utilice el servicio. ReLead podrá modificar su contenido para adaptarlo a cambios tecnológicos o
    regulatorios, publicando la versión actualizada en esta misma sección.
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
