"use client";

import { type FormEvent, useEffect, useState } from "react";
import type {
  LinkPageSummary,
  LinkPageWithContent,
  LinkBlockWithItems,
  LinkItem,
  LinkPageDesign,
} from "@/types/link";
import type { ProfileRecord } from "@/lib/db";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";

interface ApiListPagesResponse {
  pages: LinkPageSummary[];
}

interface ApiPageResponse {
  page: LinkPageWithContent;
}

const isProfileResponse = (
  value: unknown
): value is { profile?: ProfileRecord | null } => {
  return typeof value === "object" && value !== null && "profile" in value;
};

const defaultDesign: LinkPageDesign = {
  backgroundColor: "#020617",
  buttonBg: "#f9fafb",
  buttonText: "#020617",
  textColor: "#f9fafb",
  accentColor: "#6366f1",
  header: {
    template: "classic",
    useProfileAvatar: true,
    useProfileName: true,
    useProfileBio: true,
  },
};

function DesignControls({
  design,
  onChange,
  onSave,
  disabled,
}: {
  design: LinkPageDesign;
  onChange: (design: LinkPageDesign) => void;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Diseño rápido</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Guardar diseño
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Fondo página
          <input
            type="color"
            value={design.backgroundColor || "#020617"}
            onChange={(e) => onChange({ ...design, backgroundColor: e.target.value })}
            className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Fondo botones
          <input
            type="color"
            value={design.buttonBg || "#f9fafb"}
            onChange={(e) => onChange({ ...design, buttonBg: e.target.value })}
            className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-slate-700">
        Plantilla header
        <select
          value={design.header?.template || "classic"}
          onChange={(e) =>
            onChange({
              ...design,
              header: {
                ...design.header,
                template: e.target.value as "classic" | "minimal",
              },
            })
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
        >
          <option value="classic">Clásico</option>
          <option value="minimal">Minimal</option>
        </select>
      </label>

      <div className="mt-1 space-y-1 text-xs text-slate-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={design.header?.useProfileAvatar ?? true}
            onChange={(e) =>
              onChange({
                ...design,
                header: {
                  ...design.header,
                  useProfileAvatar: e.target.checked,
                },
              })
            }
          />
          Usar avatar de perfil
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={design.header?.useProfileName ?? true}
            onChange={(e) =>
              onChange({
                ...design,
                header: {
                  ...design.header,
                  useProfileName: e.target.checked,
                },
              })
            }
          />
          Usar nombre de perfil
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={design.header?.useProfileBio ?? true}
            onChange={(e) =>
              onChange({
                ...design,
                header: {
                  ...design.header,
                  useProfileBio: e.target.checked,
                },
              })
            }
          />
          Usar bio de perfil
        </label>
      </div>
    </div>
  );
}

export default function LinkPagesScreen() {
  const [pages, setPages] = useState<LinkPageSummary[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<LinkPageWithContent | null>(null);
  const [designDraft, setDesignDraft] = useState<LinkPageDesign>(defaultDesign);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designDraft, setDesignDraft] = useState<LinkPageDesign>(defaultDesign);
  const [pageForm, setPageForm] = useState({ internalName: "", slug: "" });
  const [pageSlugEdited, setPageSlugEdited] = useState(false);
  const [pageFormError, setPageFormError] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ title: "", blockType: "links" });
  const [blockCreating, setBlockCreating] = useState(false);
  const [linkDrafts, setLinkDrafts] = useState<
    Record<string, { label: string; url: string }>
  >({});
  const [linkCreating, setLinkCreating] = useState<Record<string, boolean>>({});

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
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const payload = await res.json();
        const profileData: ProfileRecord | null = isProfileResponse(payload)
          ? payload.profile ?? null
          : (payload as ProfileRecord | null);

        setProfile(profileData);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };

    loadProfile();
  }, []);

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

  useEffect(() => {
    if (currentPage) {
      setDesignDraft({
        ...defaultDesign,
        ...(currentPage.design || {}),
        header: {
          ...defaultDesign.header,
          ...(currentPage.design?.header || {}),
        },
      });
    } else {
      setDesignDraft(defaultDesign);
    }
  }, [currentPage]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  const handleCreatePage = async (e?: FormEvent) => {
    e?.preventDefault();
    try {
      setCreating(true);
      setError(null);
      setPageFormError(null);

      const internalName = pageForm.internalName.trim();
      const slugInput = pageForm.slug.trim();
      if (!internalName) {
        setPageFormError("El nombre interno es obligatorio");
        setCreating(false);
        return;
      }

      const generatedSlug = slugify(internalName);
      const slug = slugInput ? slugify(slugInput) : generatedSlug || "pagina";

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
      setPageForm({ internalName: "", slug: "" });
      setPageSlugEdited(false);
    } catch (err: any) {
      setPageFormError(err.message || "Error creando página");
    } finally {
      setCreating(false);
    }
  };

  const handleAddBlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPage) return;
    try {
      setError(null);
      setBlockCreating(true);
      const title = blockForm.title.trim() || null;
      const position = currentPage.blocks.length;

      const res = await fetch("/api/link-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          pageId: currentPage.id,
          blockType: blockForm.blockType,
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
      setBlockForm({ title: "", blockType: blockForm.blockType });
    } catch (err: any) {
      setError(err.message || "Error creando bloque");
    } finally {
      setBlockCreating(false);
    }
  };

  const handleAddLinkToBlock = async (block: LinkBlockWithItems) => {
    if (!currentPage) return;
    try {
      setError(null);
      setLinkCreating((prev) => ({ ...prev, [block.id]: true }));
      const draft = linkDrafts[block.id] || { label: "", url: "" };
      const label = draft.label.trim();
      const url = draft.url.trim() || null;
      if (!label) {
        setLinkCreating((prev) => ({ ...prev, [block.id]: false }));
        return;
      }
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
      setLinkDrafts((prev) => ({ ...prev, [block.id]: { label: "", url: "" } }));
    } catch (err: any) {
      setError(err.message || "Error creando link");
    } finally {
      setLinkCreating((prev) => ({ ...prev, [block.id]: false }));
    }
  };

  const reloadCurrentPage = async () => {
    if (!selectedPageId) return;
    try {
      setLoadingPage(true);
      const res = await fetch(`/api/link-pages/${selectedPageId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error recargando página");
      }
      const data: ApiPageResponse = await res.json();
      setCurrentPage(data.page);
    } catch (err: any) {
      setError(err.message || "Error recargando página");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleMoveBlock = async (
    blockId: string,
    direction: "up" | "down"
  ) => {
    if (!currentPage) return;
    const index = currentPage.blocks.findIndex((b) => b.id === blockId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= currentPage.blocks.length) return;

    const reordered = [...currentPage.blocks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const updatedBlocks = reordered.map((block, idx) => ({ ...block, position: idx }));
    const originalPositions = Object.fromEntries(
      currentPage.blocks.map((block) => [block.id, block.position])
    );
    const changedBlocks = updatedBlocks.filter(
      (block) => block.position !== originalPositions[block.id]
    );

    setCurrentPage((prev) => (prev ? { ...prev, blocks: updatedBlocks } : prev));

    try {
      await Promise.all(
        changedBlocks.map((block) =>
          fetch(`/api/link-blocks/${block.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ position: block.position }),
          })
        )
      );
    } catch (err: any) {
      setError(err.message || "Error reordenando bloques");
      await reloadCurrentPage();
    }
  };

  const handleMoveItem = async (
    block: LinkBlockWithItems,
    itemId: string,
    direction: "up" | "down"
  ) => {
    if (!currentPage || block.items.length === 0) return;
    const index = block.items.findIndex((item) => item.id === itemId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= block.items.length) return;

    const reorderedItems = [...block.items];
    [reorderedItems[index], reorderedItems[targetIndex]] = [
      reorderedItems[targetIndex],
      reorderedItems[index],
    ];
    const updatedItems = reorderedItems.map((item, idx) => ({ ...item, position: idx }));

    setCurrentPage((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === block.id ? { ...b, items: updatedItems } : b
            ),
          }
        : prev
    );

    const originalItemPositions = Object.fromEntries(
      block.items.map((item) => [item.id, item.position])
    );
    const changedItems = updatedItems.filter(
      (item) => item.position !== originalItemPositions[item.id]
    );

    try {
      await Promise.all(
        changedItems.map((item) =>
          fetch(`/api/link-items/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ position: item.position }),
          })
        )
      );
    } catch (err: any) {
      setError(err.message || "Error reordenando links");
      await reloadCurrentPage();
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

  const pageForPreview = currentPage ? { ...currentPage, design: designDraft } : null;

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
      </header>

      <form
        onSubmit={handleCreatePage}
        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1.5fr,1.5fr,auto]"
      >
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Nombre interno
          <input
            type="text"
            value={pageForm.internalName}
            onChange={(e) => {
              const value = e.target.value;
              setPageForm((prev) => ({
                ...prev,
                internalName: value,
                slug: pageSlugEdited ? prev.slug : slugify(value),
              }));
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            placeholder="Principal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Slug
          <input
            type="text"
            value={pageForm.slug}
            onChange={(e) => {
              setPageSlugEdited(true);
              setPageForm((prev) => ({ ...prev, slug: e.target.value }));
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            placeholder="mi-pagina"
          />
        </label>
        <div className="flex items-end justify-end">
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {creating ? "Creando..." : "Crear página"}
          </button>
        </div>
      </form>

      {pageFormError && (
        <p className="text-sm text-red-600">{pageFormError}</p>
      )}

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
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                  page.id === selectedPageId
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page.internalName}
                {page.isDefault && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Default
                  </span>
                )}
              </button>
              {!page.isDefault && (
                <button
                  onClick={() => handleSetDefault(page.id)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                  title="Marcar como página por defecto"
                >
                  Hacer default
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <DesignControls
            design={designDraft}
            disabled={!currentPage}
            onChange={(d) => setDesignDraft(d)}
            onSave={async () => {
              if (!currentPage) return;
              setError(null);
              try {
                const res = await fetch(`/api/link-pages/${currentPage.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json; charset=utf-8",
                  },
                  body: JSON.stringify({
                    design: designDraft,
                  }),
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.error || "Error guardando diseño");
                }
                const data = await res.json();
                const updated = data.page as LinkPageWithContent;
                setCurrentPage((prev) =>
                  prev && prev.id === updated.id ? { ...prev, design: updated.design } : prev
                );
              } catch (err: any) {
                setError(err.message || "Error guardando diseño");
              }
            }}
          />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Bloques de la página
            </h2>
            {currentPage && (
              <form
                onSubmit={handleAddBlock}
                className="flex flex-wrap items-end gap-2"
              >
                <label className="flex flex-col gap-1 text-xs text-slate-700">
                  Título del bloque
                  <input
                    type="text"
                    value={blockForm.title}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-48 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    placeholder="Links principales"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-700">
                  Tipo
                  <select
                    value={blockForm.blockType}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, blockType: e.target.value }))
                    }
                    className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="links">Links</option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={blockCreating}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {blockCreating ? "Añadiendo..." : "+ Añadir bloque"}
                </button>
              </form>
            )}
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

              {currentPage.blocks.map((block, blockIndex) => (
                <div
                  key={block.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {block.blockType}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {block.title || "Bloque sin título"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(block.id, "up")}
                          disabled={blockIndex === 0}
                          className="rounded border border-slate-300 bg-white px-2 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
                          title="Mover arriba"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(block.id, "down")}
                          disabled={blockIndex === currentPage.blocks.length - 1}
                          className="rounded border border-slate-300 bg-white px-2 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
                          title="Mover abajo"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>

                  {block.blockType === "links" && (
                    <ul className="mt-2 space-y-1">
                      {block.items.length === 0 && (
                        <li className="text-xs text-slate-500">
                          Sin links aún.
                        </li>
                      )}
                      {block.items.map((item, itemIndex) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1 text-xs text-slate-800"
                        >
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            {item.url && (
                              <span className="truncate text-[11px] text-slate-400">
                                {item.url}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(block, item.id, "up")}
                              disabled={itemIndex === 0}
                              className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold hover:bg-slate-100 disabled:opacity-40"
                              title="Mover arriba"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(block, item.id, "down")}
                              disabled={itemIndex === block.items.length - 1}
                              className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold hover:bg-slate-100 disabled:opacity-40"
                              title="Mover abajo"
                            >
                              ↓
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {block.blockType === "links" && (
                    <form
                      className="mt-3 flex flex-wrap items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleAddLinkToBlock(block);
                      }}
                    >
                      <label className="flex flex-col gap-1 text-xs text-slate-700">
                        Texto
                        <input
                          type="text"
                          value={linkDrafts[block.id]?.label || ""}
                          onChange={(e) =>
                            setLinkDrafts((prev) => ({
                              ...prev,
                              [block.id]: {
                                label: e.target.value,
                                url: prev[block.id]?.url || "",
                              },
                            }))
                          }
                          className="w-48 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          placeholder="Mi Instagram"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-slate-700">
                        URL
                        <input
                          type="url"
                          value={linkDrafts[block.id]?.url || ""}
                          onChange={(e) =>
                            setLinkDrafts((prev) => ({
                              ...prev,
                              [block.id]: {
                                label: prev[block.id]?.label || "",
                                url: e.target.value,
                              },
                            }))
                          }
                          className="w-64 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          placeholder="https://..."
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={linkCreating[block.id]}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {linkCreating[block.id] ? "Añadiendo..." : "+ Añadir link"}
                      </button>
                    </form>
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
