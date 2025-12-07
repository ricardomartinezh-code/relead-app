import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#producto", label: "Producto" },
  { href: "#flujo", label: "Flujo" },
  { href: "#metricas", label: "Métricas" },
  { href: "/legal/terms", label: "Legal" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 transition hover:text-slate-700 sm:text-xl"
        >
          <span>ReLead</span>
          <Badge variant="secondary" className="hidden text-[11px] text-slate-700 sm:inline-flex">
            Beta
          </Badge>
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1 transition hover:text-slate-900",
                item.href.startsWith("#") ? "hover:bg-slate-100/80" : undefined
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="px-3 text-slate-700 hover:bg-slate-100">
            <Link href="/auth/login">Ingresar</Link>
          </Button>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/auth/register">Crear mi página</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
