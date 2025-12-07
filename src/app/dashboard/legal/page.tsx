import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function LegalIndexPage() {
  const documents = [
    {
      title: "Política de privacidad",
      description: "Revisa cómo tratamos los datos personales y las solicitudes de eliminación.",
      href: "/dashboard/legal/privacy",
    },
    {
      title: "Términos y condiciones",
      description: "Consulta las reglas de uso y responsabilidades dentro de ReLead.",
      href: "/dashboard/legal/terms",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</p>
          <h1 className="text-3xl font-semibold text-slate-900">Documentos legales</h1>
          <p className="text-sm text-slate-600">
            Accede a la política de privacidad y términos directamente desde el dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800">
                  {doc.title}
                </h2>
                <p className="text-sm text-slate-600">{doc.description}</p>
              </div>
              <span className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                Abrir documento →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
