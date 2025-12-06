"use client";

import { useEffect, useState } from "react";
import type {
  LinkPageSummary,
  LinkPageWithContent,
  LinkBlockWithItems,
  LinkItem,
} from "@/types/link";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";

interface ApiListPagesResponse {
  pages: LinkPageSummary[];
}

interface ApiPageResponse {
  page: LinkPageWithContent;
}

export default function LinkPagesScreen() {
  const [pages, setPages] = useState<LinkPageSummary[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<LinkPageWithContent | null>(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoadingPages(true);
        setError(null);
        const res = await fetch("/api/link-pages");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error cargando páginas");
        }
        const data: ApiListPagesResponse = await res.json();
        setPages(data.pages || []);
        if (!selectedPageId && data.pages.length > 0) {
          const defaultPage = data.pages.find((p) => p.isDefault) || data.pages[0];
          setSelectedPageId(defaultPage.id);
        }
      } catch (err: any) {
        setError(err.message || "Error cargando páginas");
      } finally {
        setLoadingPages(false);
      }
    };

    loadPages();
  }, [selectedPageId]);

  useEffect(() => {
    const loadPage = async () => {
      if (!selectedPageId) {
        setCurrentPage(null);
        return;
      }
      try {
        setLoadingPage(true);
        setError(null);
        const res = await fetch(`/api/link-pages/${selectedPageId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error cargando página");
        }
        const data: ApiPageResponse = await res.json();
        setCurrentPage(data.page);
      } catch (err: any) {
        setError(err.message || "Error cargando página");
      } finally {
        setLoadingPage(false);
      }
    };

    loadPage();
  }, [selectedPageId]);

  const handleCreatePage = async () => {
    try {
      setCreating(true);
      setError(null);

      const internalName = prompt("Nombre interno de la página (ej. Principal):");
      if (!internalName) {
        setCreating(false);
        return;
      }

      const slugBase = internalName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const slug = slugBase || "pagina";

      const res = await fetch("/api/link-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          internalName,
          slug,
          publicTitle: internalName,
          publicDescription: null,
          isDefault: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error creando página");
      }

      const data = await res.json();
      const newPage: LinkPageSummary = data.page;
      setPages((prev) =>
        newPage.isDefault
          ? [...prev.map((p) => ({ ...p, isDefault: false })), newPage]
          : [...prev, newPage]
      );
      setSelectedPageId(newPage.id);
    } catch (err: any) {
      setError(err.message || "Error creando página");
    } finally {
      setCreating(false);
    }
  };

  const handleAddBlock = async () => {
    if (!currentPage) return;
    try {
      setError(null);
      const title = prompt("Título del bloque (ej. Links principales):") || null;
      const position = currentPage.blocks.length;

      const res = await fetch("/api/link-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          pageId: currentPage.id,
          blockType: "links",
          title,
          subtitle: null,
          position,
          config: {
            layout: "classic",
            size: "L",
            collapsedByDefault: false,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error creando bloque");
      }

      const data = await res.json();
      const newBlock: LinkBlockWithItems = {
        ...data.block,
        items: [],
      };

      setCurrentPage((prev) =>
        prev
          ? {
              ...prev,
              blocks: [...prev.blocks, newBlock],
            }
          : prev
      );
    } catch (err: any) {
      setError(err.message || "Error creando bloque");
    }
  };

  const handleAddLinkToBlock = async (block: LinkBlockWithItems) => {
    if (!currentPage) return;
    try {
      setError(null);
      const label = prompt("Texto del link (ej. Mi Instagram):");
      if (!label) return;

      const url = prompt("URL del link (ej. https://instagram.com/...):") || null;
      const position = block.items.length;

      const res = await fetch("/api/link-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          blockId: block.id,
          position,
          label,
          url,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error creando link");
      }

      const data = await res.json();
      const newItem: LinkItem = data.item;

      setCurrentPage((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) =>
            b.id === block.id ? { ...b, items: [...b.items, newItem] } : b
          ),
        };
      });
    } catch (err: any) {
      setError(err.message || "Error creando link");
    }
  };

  const handleSetDefault = async (pageId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/link-pages/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar la página por defecto");
      }

      const data: ApiPageResponse = await res.json();
      const updatedPage = data.page;
      setPages((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === updatedPage.id }))
      );
      setCurrentPage((prev) =>
        prev && prev.id === updatedPage.id
          ? { ...prev, isDefault: true }
          : prev
      );
    } catch (err: any) {
      setError(err.message || "Error al marcar página por defecto");
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Páginas
          </h1>
          <p className="text-sm text-slate-500">
            Crea y edita tus páginas tipo link-in-bio.
          </p>
        </div>
        <button
          onClick={handleCreatePage}
          disabled={creating}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {creating ? "Creando..." : "Nueva página"}
        </button>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {loadingPages ? (
          <span className="text-sm text-slate-500">Cargando páginas…</span>
        ) : pages.length === 0 ? (
          <span className="text-sm text-slate-500">
            Aún no tienes páginas. Crea la primera.
          </span>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedPageId(page.id)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${
                  page.id === selectedPageId
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page.internalName}
                {page.isDefault && (
                  <span className="text-[11px] font-semibold text-amber-600">★</span>
                )}
              </button>
              {!page.isDefault && (
                <button
                  onClick={() => handleSetDefault(page.id)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                  title="Marcar como página por defecto"
                >
                  Def.
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Bloques de la página
            </h2>
            <button
              onClick={handleAddBlock}
              disabled={!currentPage}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              + Añadir bloque
            </button>
          </div>

          {loadingPage && (
            <p className="text-sm text-slate-500">Cargando página…</p>
          )}

          {!loadingPage && !currentPage && (
            <p className="text-sm text-slate-500">
              Selecciona una página para editar sus bloques.
            </p>
          )}

          {!loadingPage && currentPage && (
            <div className="space-y-2">
              {currentPage.blocks.length === 0 && (
                <p className="text-sm text-slate-500">
                  Esta página no tiene bloques todavía. Empieza añadiendo uno.
                </p>
              )}

              {currentPage.blocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {block.blockType}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {block.title || "Bloque sin título"}
                      </p>
                    </div>
                    {block.blockType === "links" && (
                      <button
                        onClick={() => handleAddLinkToBlock(block)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-white"
                      >
                        + Link
                      </button>
                    )}
                  </div>

                  {block.blockType === "links" && (
                    <ul className="mt-2 space-y-1">
                      {block.items.length === 0 && (
                        <li className="text-xs text-slate-500">
                          Sin links aún.
                        </li>
                      )}
                      {block.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-xs text-slate-800"
                        >
                          <span>{item.label}</span>
                          {item.url && (
                            <span className="truncate text-[11px] text-slate-400">
                              {item.url}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-950 p-3 text-slate-50 shadow-sm">
          <h2 className="text-sm font-semibold">Vista previa</h2>
          <div className="flex justify-center">
            <PublicLinkPage page={currentPage} variant="preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
