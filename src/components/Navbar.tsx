import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold text-gray-900">ReLead</Link>
        <nav className="flex gap-3 text-sm font-medium text-gray-700">
          <Link href="/auth/login" className="hover:text-gray-900">Ingresar</Link>
          <Link href="/auth/register" className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Crear mi página</Link>
        </nav>
      </div>
    </header>
  );
}
