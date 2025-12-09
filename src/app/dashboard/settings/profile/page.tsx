"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface SocialLink {
  type: string;
  url: string;
}

interface ProfileForm {
  username: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
  settings: any;
}

const SOCIAL_OPTIONS = ["instagram", "tiktok", "x", "youtube", "custom"];

export default function ProfileSettingsPage() {
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    username: "",
    bio: "",
    avatarUrl: null,
    socialLinks: [],
    settings: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setProfileForm({
          username: data.username || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || null,
          socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
          settings: data.settings || {},
        });
      } catch (err: any) {
        setError(err.message || "Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof ProfileForm, value: any) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    setProfileForm((prev) => {
      const next = [...prev.socialLinks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, socialLinks: next };
    });
  };

  const handleAddSocial = () => {
    setProfileForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { type: "custom", url: "" }],
    }));
  };

  const handleRemoveSocial = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleAvatarChange = () => {
    // Reutiliza el flujo de subida existente si está disponible en el cliente
    const openAvatarUpload = (window as any).openAvatarUpload;
    if (typeof openAvatarUpload === "function") {
      openAvatarUpload((newUrl: string) => {
        handleChange("avatarUrl", newUrl);
      });
    } else {
      alert("Flujo de carga de avatar no disponible en esta vista.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar el perfil");
      }

      setMessage("Perfil actualizado correctamente");
    } catch (err: any) {
      setError(err.message || "Error guardando perfil");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Maneja la eliminación permanente de la cuenta. Muestra una confirmación
   * antes de enviar la solicitud al servidor. Tras borrar la cuenta
   * redirigimos al usuario a la página principal.
   */
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
      // Después de eliminar la cuenta, redirigimos al usuario fuera del dashboard.
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
        <h1 className="text-xl font-semibold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-500">
          Actualiza tu nombre de usuario, bio y enlaces sociales.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando perfil…</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
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

          <div className="grid gap-4 md:grid-cols-[160px,1fr]">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {profileForm.avatarUrl ? (
                <Image
                  src={profileForm.avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700">
                  Sin avatar
                </div>
              )}
              <button
                type="button"
                onClick={handleAvatarChange}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Cambiar avatar
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="tu_usuario"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  rows={4}
                  placeholder="Cuenta algo sobre ti (puedes usar emojis)."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Redes sociales</h2>
              <button
                type="button"
                onClick={handleAddSocial}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Añadir red
              </button>
            </div>

            {profileForm.socialLinks.length === 0 && (
              <p className="text-sm text-slate-500">Aún no tienes redes añadidas.</p>
            )}

            <div className="space-y-3">
              {profileForm.socialLinks.map((link, index) => (
                <div
                  key={`${link.type}-${index}`}
                  className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr,2fr,auto]"
                >
                  <select
                    value={link.type}
                    onChange={(e) => handleSocialChange(index, "type", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {SOCIAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(index)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-white"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          {/* Sección de eliminación de cuenta */}
          <div className="mt-8 space-y-2 rounded-md border border-red-200 bg-red-50 p-4">
            <h2 className="text-sm font-semibold text-red-800">Eliminar cuenta</h2>
            <p className="text-sm text-red-700">
              Al eliminar tu cuenta se borrará tu perfil y dejarás de tener acceso
              al panel. Esta acción es irreversible.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={saving}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? "Eliminando..." : "Eliminar cuenta"}
            </button>
          </div>
        </form>
      )}
      </div>
    </DashboardLayout>
  );
}
