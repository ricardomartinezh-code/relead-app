"use client";

import { FormEvent, useState } from "react";
import type { ChangeEvent } from "react";
import { type ProfileRecord } from "@/lib/db";

type ProfileFormProps = {
  profile: ProfileRecord;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResponse = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage =
          typeof errorData?.error === "string" ? errorData.error : "No se pudo subir la imagen";
        throw new Error(errorMessage);
      }

      const uploadData: { url?: string } = await uploadResponse.json();
      if (!uploadData.url) {
        throw new Error("No se pudo obtener la URL del avatar");
      }

      const saveResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ avatarUrl: uploadData.url }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json().catch(() => ({}));
        const message = typeof data?.error === "string" ? data.error : "No se pudo guardar el avatar";
        throw new Error(message);
      }

      await saveResponse.json().catch(() => ({}));

      setAvatarUrl(uploadData.url);
      setMessage("Avatar actualizado");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error subiendo imagen";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        title: form.get("title"),
        bio: form.get("bio") || null,
        avatarUrl: avatarUrl || null,
        theme: form.get("theme") || "default",
      }),
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo actualizar");
      return;
    }
    setMessage("Perfil actualizado");
  };

  const inputClassName =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">Título</label>
        <input name="title" defaultValue={profile.title} required className={inputClassName} placeholder="Ej. Regina Mora" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio || ""}
          rows={3}
          className={inputClassName}
          placeholder="Comparte en qué te enfocas o a quién ayudas."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Avatar</label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleAvatarChange}
          className={inputClassName}
        />
        {uploading && <p className="text-xs text-slate-600">Subiendo imagen...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        {avatarUrl && (
          <div className="flex items-center gap-2">
            <img src={avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
            <p className="text-xs text-slate-600 break-all">{avatarUrl}</p>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">Tema</label>
        <select name="theme" defaultValue={profile.theme} className={inputClassName}>
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="pastel">Pastel</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
