import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 transition hover:text-slate-700">
          <span>ReLead</span>
          <Badge variant="secondary" className="hidden text-[11px] text-slate-700 sm:inline-flex">Beta</Badge>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Button asChild variant="ghost" size="sm" className="px-3 text-slate-700 hover:bg-slate-100">
            <Link href="/auth/login">Ingresar</Link>
          </Button>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/auth/register">Crear mi página</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
