"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import type { ChangeEvent } from "react";
import { type ProfileRecord } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  const [theme, setTheme] = useState<string>(profile.theme || "default");

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
        theme: theme || "default",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm text-slate-700">Título</Label>
        <Input name="title" defaultValue={profile.title} required placeholder="Ej. Regina Mora" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-slate-700">Bio</Label>
        <Textarea
          name="bio"
          defaultValue={profile.bio || ""}
          rows={3}
          placeholder="Comparte en qué te enfocas o a quién ayudas."
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-slate-700">Avatar</Label>
        <Input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} />
        <p className="text-xs text-slate-500">
          Sube una imagen cuadrada para mejores resultados.
        </p>
        {uploading && <p className="text-xs text-slate-600">Subiendo imagen...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        {avatarUrl && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <p className="text-xs text-slate-600 break-all">{avatarUrl}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-slate-700">Tema</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="pastel">Pastel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
