import Link from "next/link";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">ReLead</Link>
          <nav className="flex gap-4 text-sm text-gray-700">
            <Link href="/dashboard" className="hover:text-gray-900">Resumen</Link>
            <Link href="/dashboard/profile" className="hover:text-gray-900">Perfil</Link>
            <Link href="/dashboard/links" className="hover:text-gray-900">Links</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
