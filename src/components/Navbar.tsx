import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-slate-900 transition hover:text-slate-700">ReLead</Link>
        <nav className="flex gap-3 text-sm font-medium text-slate-600">
          <Link href="/auth/login" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">Ingresar</Link>
          <Link href="/auth/register" className="rounded-md bg-slate-900 px-4 py-2 text-white font-semibold transition hover:bg-slate-800 hover:shadow-md">Crear mi página</Link>
        </nav>
      </div>
    </header>
  );
}
