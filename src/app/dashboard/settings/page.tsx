"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CollapsiblePanel } from "@/components/ui/collapsible-panel";
import { applyDashboardTheme, storeDashboardTheme } from "@/lib/dashboardTheme";

/**
 * Este componente implementa la página de ajustes del perfil.  A diferencia
 * de la antigua vista de perfil, aquí se centraliza la configuración
 * relacionada con la cuenta del usuario.  Incluye cambios de foto de
 * perfil, nombre de usuario, selección de tema y eliminación de cuenta.
 *
 * Se elimina la sección de bio y la gestión de redes sociales, ya que
 * estos aspectos se gestionan ahora desde la página de creación de enlaces.
 */

interface SettingsForm {
  username: string;
  avatarUrl: string | null;
  settings: any;
  themeMode: string;
  customColor: string;
}

const THEME_OPTIONS = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Obscuro" },
  { value: "custom", label: "Teñido" },
];

// Colores predeterminados para el modo personalizado.  Se pueden extender o
// ajustar según la paleta de la marca.  Cada valor es un código HEX.
const PRESET_COLORS = [
  { value: "#f97316", label: "Naranja" }, // orange-500
  { value: "#10b981", label: "Verde" },   // emerald-500
  { value: "#6366f1", label: "Indigo" },  // indigo-500
  { value: "#ec4899", label: "Rosa" },    // pink-500
];

export default function SettingsPage() {
  // Estado inicial del formulario de ajustes
  const [form, setForm] = useState<SettingsForm>({
    username: "",
    avatarUrl: null,
    settings: {},
    themeMode: "light",
    customColor: PRESET_COLORS[0].value,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Carga inicial de datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/profile");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo cargar el perfil");
        }
        const data = await res.json();
        const settings = data.settings || {};
        const nextForm = {
          username: data.username || "",
          avatarUrl: data.avatarUrl || null,
          settings: settings,
          themeMode: settings.themeMode || "light",
          customColor: settings.customColor || PRESET_COLORS[0].value,
        };
        setForm(nextForm);
        applyDashboardTheme({
          themeMode: nextForm.themeMode,
          customColor: nextForm.customColor,
        });
      } catch (err: any) {
        setError(err.message || "Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handlers para modificar los campos del formulario
  const handleChange = (field: keyof SettingsForm, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "themeMode" || field === "customColor") {
        applyDashboardTheme({
          themeMode: next.themeMode,
          customColor: next.customColor,
        });
        storeDashboardTheme({
          themeMode: next.themeMode,
          customColor: next.customColor,
        });
      }
      return next;
    });
  };

  const uploadAvatarFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "No se pudo subir el avatar");
    }
    return data.url as string;
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      setError(null);
      setMessage(null);
      const url = await uploadAvatarFile(file);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el avatar");
      handleChange("avatarUrl", url);
      setMessage("Avatar actualizado");
    } catch (err: any) {
      setError(err.message || "Error subiendo avatar");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Guardar cambios en el servidor
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      // Componemos el cuerpo a enviar.  Actualizamos username y avatarUrl,
      // así como el objeto settings con el tema y el color personalizado.
      const nextSettings = {
        ...(form.settings || {}),
        themeMode: form.themeMode,
        customColor: form.customColor,
      };
      const body: any = {
        username: form.username,
        avatarUrl: form.avatarUrl,
        settings: nextSettings,
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar el perfil");
      }
      storeDashboardTheme({
        themeMode: form.themeMode,
        customColor: form.customColor,
      });
      setMessage("Ajustes guardados correctamente");
    } catch (err: any) {
      setError(err.message || "Error guardando ajustes");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar cuenta permanente con confirmación
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la cuenta");
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Error eliminando cuenta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        <header>
          <h1 className="text-xl font-semibold text-slate-900">Ajustes</h1>
          <p className="text-sm text-slate-500">
            Configura tu foto de perfil, nombre de usuario y apariencia del panel.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando ajustes…</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5"
          >
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            )}

            <CollapsiblePanel
              title="Perfil"
              description="Actualiza tu avatar y tu nombre de usuario."
              defaultOpen
            >
              <div className="grid gap-4 md:grid-cols-[160px,1fr]">
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {form.avatarUrl ? (
                    <Image
                      src={form.avatarUrl}
                      alt="Foto de perfil"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700">
                      Sin foto
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {uploadingAvatar ? "Subiendo..." : "Cambiar foto"}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-800">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="tu_usuario"
                      required
                    />
                  </div>
                </div>
              </div>
            </CollapsiblePanel>

            {/* Selección de tema */}
            <CollapsiblePanel
              title="Apariencia"
              description="Elige cómo se verá tu panel (claro/obscuro/personalizado)."
              defaultOpen
            >
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  {THEME_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-sm text-slate-800"
                    >
                      <input
                        type="radio"
                        name="themeMode"
                        value={opt.value}
                        checked={form.themeMode === opt.value}
                        onChange={() => handleChange("themeMode", opt.value)}
                        className="h-4 w-4"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {form.themeMode === "custom" && (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleChange("customColor", color.value)}
                        style={{ backgroundColor: color.value }}
                        className={
                          "h-8 w-full rounded-md border-2" +
                          (form.customColor === color.value
                            ? " border-slate-900"
                            : " border-transparent")
                        }
                      >
                        <span className="sr-only">{color.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CollapsiblePanel>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>

            <CollapsiblePanel
              title={<span className="text-red-800">Eliminar cuenta</span>}
              description={
                <span className="text-red-700">
                  Esta acción es irreversible y perderás acceso al panel.
                </span>
              }
              className="border-red-200 bg-red-50"
              headerClassName="hover:bg-red-100/50"
            >
              <p className="text-sm text-red-700">
                Al eliminar tu cuenta se borrará tu perfil y dejarás de tener acceso al panel.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={saving}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Eliminando…" : "Eliminar cuenta"}
              </button>
            </CollapsiblePanel>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
