 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";

const primaryNav = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Panel", href: "/dashboard/link-pages" },
  { label: "Comercial", href: "/dashboard/whatsapp" },
];

const secondaryNav = [{ label: "Cuenta", href: "/dashboard/profile" }];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-slate-900/10 via-slate-700/10 to-amber-500/10 blur-2xl"
        aria-hidden="true"
      />
      <header className="relative border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-slate-900 transition hover:text-slate-700"
            >
              ReLead
            </Link>
            <Badge variant="secondary" className="bg-slate-100 text-slate-800">
              Panel
            </Badge>
          </div>
          <div className="hidden md:block">
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/dashboard/link-pages">Crear/editar página</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
            <nav className="space-y-6 text-sm font-medium text-slate-700">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secciones</p>
                <div className="flex flex-col gap-1">
                  {primaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2 transition hover:bg-slate-100",
                        pathname === item.href
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cuenta</p>
                <div className="flex flex-col gap-1">
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2 transition hover:bg-slate-100",
                        pathname === item.href
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
