"use client";

import { Link as LinkModel } from "@prisma/client";
import { FormEvent, useEffect, useState } from "react";

export function LinksManager() {
  const [links, setLinks] = useState<LinkModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ label: "", url: "", order: 0, isActive: true });
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdate = async (id: string, changes: Partial<LinkModel>) => {
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

  if (loading) return <p>Cargando links...</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid gap-3 rounded-lg bg-gray-50 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Etiqueta</label>
            <input value={formState.label} onChange={(e) => setFormState({ ...formState, label: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL</label>
            <input value={formState.url} onChange={(e) => setFormState({ ...formState, url: e.target.value })} required />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Orden</label>
            <input
              type="number"
              value={formState.order}
              onChange={(e) => setFormState({ ...formState, order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Activo</span>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Crear link
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="divide-y rounded-lg bg-white shadow">
        {links.map((link) => (
          <div key={link.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">{link.label}</p>
              <p className="text-sm text-gray-600">{link.url}</p>
              <p className="text-xs text-gray-500">Orden: {link.order} · {link.isActive ? "Activo" : "Inactivo"}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                className="rounded-md border px-3 py-2"
                onClick={() => handleUpdate(link.id, { isActive: !link.isActive })}
              >
                {link.isActive ? "Desactivar" : "Activar"}
              </button>
              <button
                className="rounded-md border px-3 py-2"
                onClick={() => handleUpdate(link.id, { order: link.order + 1 })}
              >
                + Orden
              </button>
              <button
                className="rounded-md border px-3 py-2 text-red-600"
                onClick={() => handleDelete(link.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 && <p className="p-4 text-sm text-gray-600">Aún no tienes links.</p>}
      </div>
    </div>
  );
}
