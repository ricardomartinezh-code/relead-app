"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Importamos el componente de Clerk para permitir cerrar la sesión
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/components/lib/utils";
import { DashboardChatWidget } from "@/components/chat/DashboardChatWidget";

// Definimos la navegación principal para el dashboard. Se incluyen todas
// las secciones disponibles como una barra horizontal en vez de un panel lateral.
/**
 * Definición de las pestañas disponibles en el panel.
 *
 * Se eliminaron las entradas duplicadas de Perfil y Legal para unificar la
 * gestión del usuario bajo "Ajustes" y mover los documentos legales al footer.
 * Cada entrada contiene una etiqueta y la ruta asociada dentro del dashboard.
 */
const navItems = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Páginas", href: "/dashboard/link-pages" },
  { label: "WABA", href: "/dashboard/waba" },
  // La ruta de Ajustes apunta directamente a /dashboard/settings, ya que
  // toda la configuración del usuario ahora se gestiona en esa página.
  { label: "Ajustes", href: "/dashboard/settings" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Fondo decorativo en el header */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-slate-900/10 via-slate-700/10 to-amber-500/10 blur-2xl"
        aria-hidden="true"
      />
      <header className="relative border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          {/* Primera fila: logo y acción secundaria */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-lg font-semibold text-slate-900 transition hover:text-slate-700"
              >
                ReLead
              </Link>
            </div>
            {/* Botón para cerrar sesión disponible en todas las vistas */}
            <div className="flex items-center gap-2">
              <SignOutButton>
                <Button variant="outline" size="sm" className="shadow-sm">
                  Cerrar sesión
                </Button>
              </SignOutButton>
            </div>
          </div>

          {/* Barra de navegación horizontal con animaciones sutiles */}
          <nav className="flex w-full flex-wrap items-center gap-2 overflow-x-auto pb-1 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 transition transform duration-200",
                  pathname === item.href
                    ? "bg-slate-900 text-white shadow"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:-translate-y-0.5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-8">
        {/* En el nuevo diseño no utilizamos panel lateral */}
        <div>{children}</div>
      </main>

      <DashboardChatWidget />
    </div>
  );
}
