"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo crear la cuenta");
      return;
    }
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">Regístrate para empezar a compartir tus links.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input name="name" placeholder="Tu nombre" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contraseña</label>
            <input name="password" type="password" placeholder="******" minLength={6} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta? <a href="/auth/login" className="font-medium text-blue-600">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
