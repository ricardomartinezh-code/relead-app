import Link from "next/link";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-slate-900 transition hover:text-slate-700">ReLead</Link>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="transition hover:text-slate-900">Resumen</Link>
            <Link href="/dashboard/profile" className="transition hover:text-slate-900">Perfil</Link>
            <Link href="/dashboard/links" className="transition hover:text-slate-900">Links</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
