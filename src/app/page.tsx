import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  const ctaHref = session ? "/dashboard" : "/auth/register";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="space-y-6">
          <p className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">ReLead V1</p>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Tu link in bio en minutos</h1>
          <p className="text-lg text-gray-700">
            Crea tu perfil, agrega tus enlaces y comparte una sola URL. ReLead te da métricas de visitas y clics.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href={ctaHref} className="rounded-md bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700">
              Crear mi página
            </Link>
            <Link href="/[slug]" className="text-sm text-gray-700 underline">
              Ver ejemplo público
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} ReLead Digital</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/legal/privacy" className="hover:text-gray-900">
              Política de privacidad
            </Link>
            <Link href="/legal/terms" className="hover:text-gray-900">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
