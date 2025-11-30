"use client";

import { Profile } from "@prisma/client";
import { FormEvent, useState } from "react";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({
        title: form.get("title"),
        bio: form.get("bio") || null,
        avatarUrl: form.get("avatarUrl") || null,
        slug: form.get("slug"),
        theme: form.get("theme") || "default",
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo actualizar");
      return;
    }
    setMessage("Perfil actualizado");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input name="title" defaultValue={profile.title} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea name="bio" defaultValue={profile.bio || ""} rows={3} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Avatar URL</label>
        <input name="avatarUrl" defaultValue={profile.avatarUrl || ""} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <input name="slug" defaultValue={profile.slug} required />
        <p className="text-xs text-gray-500">Debe ser único. Se usará en /{"{slug}"}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tema</label>
        <select name="theme" defaultValue={profile.theme}>
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="pastel">Pastel</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
