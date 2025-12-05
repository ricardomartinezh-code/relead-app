"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { type LinkRecord } from "@/lib/mockDb";

export function LinksManager() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ label: "", url: "", order: 0, isActive: true });
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });
    if (!res.ok) {
      setError("No se pudo crear el link");
      return;
    }
    setFormState({ label: "", url: "", order: 0, isActive: true });
    fetchLinks();
  };

  const handleUpdate = async (id: string, changes: Partial<LinkRecord>) => {
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const handleEmptyCta = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const inputClassName =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando enlaces...</p>;
  }

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-slate-800">Título del enlace</label>
            <input
              value={formState.label}
              onChange={(e) => setFormState({ ...formState, label: e.target.value })}
              required
              className={inputClassName}
              placeholder="Ej. Video nuevo en YouTube"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-slate-800">URL</label>
            <input
              value={formState.url}
              onChange={(e) => setFormState({ ...formState, url: e.target.value })}
              required
              className={inputClassName}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:items-center">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">Orden</label>
            <input
              type="number"
              value={formState.order}
              onChange={(e) => setFormState({ ...formState, order: Number(e.target.value) })}
              className={inputClassName}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
            />
            Activo
          </label>
          <div className="flex md:justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Crear link
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">Aún no tienes enlaces</h3>
          <p className="max-w-lg text-sm text-slate-600">
            Crea tu primer botón para empezar a compartir tu contenido desde ReLead.
          </p>
          <button
            onClick={handleEmptyCta}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Crear primer enlace
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                <p className="text-xs text-slate-600">{link.url}</p>
                <p className="text-xs text-slate-500">Orden: {link.order} · {link.isActive ? "Activo" : "Inactivo"}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button
                  className="rounded-full border border-slate-300 px-3 py-2 text-slate-800 transition hover:border-slate-400"
                  onClick={() => handleUpdate(link.id, { isActive: !link.isActive })}
                >
                  {link.isActive ? "Desactivar" : "Activar"}
                </button>
                <button
                  className="rounded-full border border-slate-300 px-3 py-2 text-slate-800 transition hover:border-slate-400"
                  onClick={() => handleUpdate(link.id, { order: link.order + 1 })}
                >
                  + Orden
                </button>
                <button
                  className="rounded-full border border-slate-300 px-3 py-2 text-red-600 transition hover:border-red-300"
                  onClick={() => handleDelete(link.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
