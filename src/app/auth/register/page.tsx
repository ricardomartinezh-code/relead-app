"use client";

import { FormEvent, useState } from "react";

import {
  normalizeUsername,
  USERNAME_RULES_MESSAGE,
  validateUsernameInput,
} from "@/lib/username";

type UsernameStatus = "idle" | "checking" | "available" | "unavailable";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  const checkUsernameAvailability = async (value: string) => {
    const validation = validateUsernameInput(value);
    if (!validation.valid || !validation.normalized) {
      setUsernameStatus("unavailable");
      setUsernameMessage(validation.message ?? USERNAME_RULES_MESSAGE);
      return false;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Verificando disponibilidad...");

    try {
      const res = await fetch(
        `/api/auth/username?username=${encodeURIComponent(validation.normalized)}`
      );
      const data = await res.json();

      if (!res.ok || !data.available) {
        setUsernameStatus("unavailable");
        setUsernameMessage(data.message || "Nombre de usuario no disponible.");
        return false;
      }

      setUsernameStatus("available");
      setUsernameMessage("¡Nombre de usuario disponible!");
      return true;
    } catch (err) {
      console.error("Username availability error", err);
      setUsernameStatus("unavailable");
      setUsernameMessage("No se pudo validar el nombre de usuario.");
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessSlug(null);
    setLoading(true);

    const usernameToSend = normalizeUsername(form.username);
    const usernameIsAvailable = await checkUsernameAvailability(usernameToSend);
    if (!usernameIsAvailable) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        username: usernameToSend,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || "No se pudo crear la cuenta.");
      return;
    }

    setForm({ name: "", email: "", password: "", username: "" });
    setUsernameStatus("idle");
    setUsernameMessage(null);
    setSuccessSlug(data.slug || null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">Regístrate para empezar a compartir tus links.</p>

        {successSlug && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <p className="font-medium">¡Cuenta creada correctamente!</p>
            <p className="mt-1">
              Tu perfil público está disponible en {""}
              <a href={`/${successSlug}`} className="font-semibold underline">/{successSlug}</a>. Inicia sesión para personalizarlo.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre de usuario</label>
            <input
              name="username"
              placeholder="tu-usuario"
              required
              value={form.username}
              onChange={(e) => {
                const value = normalizeUsername(e.target.value);
                setForm({ ...form, username: value });
                setUsernameStatus("idle");
                setUsernameMessage(null);
                setSuccessSlug(null);
              }}
              onBlur={() => checkUsernameAvailability(form.username)}
              pattern="^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$"
              title={USERNAME_RULES_MESSAGE}
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
                usernameStatus === "available"
                  ? "border-green-500 focus:border-green-600"
                  : usernameStatus === "unavailable"
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">{USERNAME_RULES_MESSAGE}</p>
            {usernameMessage && (
              <p
                className={`mt-1 text-sm ${
                  usernameStatus === "available"
                    ? "text-green-700"
                    : usernameStatus === "checking"
                      ? "text-gray-600"
                      : "text-red-600"
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="******"
              minLength={6}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
            disabled={loading || usernameStatus === "checking"}
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
