"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  normalizeUsername,
  USERNAME_RULES_MESSAGE,
  validateUsernameInput,
} from "@/lib/username";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Regístrate para empezar a compartir tus links.</CardDescription>
        </CardHeader>

        <CardContent>
          {successSlug && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-medium">¡Cuenta creada correctamente!</p>
              <p className="mt-1">
                Tu perfil público está disponible en{" "}
                <Link href={`/${successSlug}`} className="font-semibold underline">
                  /{successSlug}
                </Link>
                . Inicia sesión para personalizarlo.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
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
                className={`border text-sm ${
                  usernameStatus === "available"
                    ? "border-emerald-500 focus-visible:ring-emerald-300"
                    : usernameStatus === "unavailable"
                      ? "border-red-500 focus-visible:ring-red-200"
                      : ""
                }`}
              />
              <p className="text-xs text-slate-600">{USERNAME_RULES_MESSAGE}</p>
              {usernameMessage && (
                <p
                  className={`text-sm ${
                    usernameStatus === "available"
                      ? "text-emerald-700"
                      : usernameStatus === "checking"
                        ? "text-slate-600"
                        : "text-red-600"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="******"
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || usernameStatus === "checking"}>
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
