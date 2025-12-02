import { DashboardLayout } from "@/components/DashboardLayout";

export default async function WhatsappPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Conecta tu WhatsApp Business (en construcción)</h1>
          <p className="text-sm text-slate-600">
            Estamos preparando la integración directa con la API de la nube de WhatsApp Business. Pronto podrás autorizar tu cuenta
            y gestionar conversaciones desde ReLead.
          </p>
        </div>
        <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>Lo que podrás hacer muy pronto:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Autorizar tu cuenta con Meta sin salir de ReLead.</li>
            <li>Responder conversaciones desde el panel.</li>
            <li>Ver métricas básicas de interacción con tus enlaces.</li>
          </ul>
        </div>
        <p className="text-sm text-slate-600">
          Estamos trabajando para ofrecer una experiencia simple y segura. Te avisaremos cuando esté lista la conexión.
        </p>
      </div>
    </DashboardLayout>
  );
}
