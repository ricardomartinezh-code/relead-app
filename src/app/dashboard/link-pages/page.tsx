"use client";

import { getPublicLink } from "@/lib/urls";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { cn } from "@/components/lib/utils";
import type {
  LinkPageSummary,
  LinkPageWithContent,
  LinkBlockWithItems,
  LinkItem,
  LinkPageDesign,
} from "@/types/link";
import type { ProfileRecord } from "@/lib/db";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronDown, Link2, Plus, RefreshCcw, Star, Trash2, UploadCloud } from "lucide-react";
import { CollapsiblePanel } from "@/components/ui/collapsible-panel";

interface ApiListPagesResponse {
  pages: LinkPageSummary[];
}

interface ApiPageResponse {
  page: LinkPageWithContent;
}

// Estructura para representar un enlace social. Cada entrada cuenta con
// un tipo (instagram, tiktok, x, youtube o custom) y una URL asociada.
interface SocialLink {
  type: string;
  url: string;
  imageUrl?: string | null;
}

const isProfileResponse = (
  value: unknown
): value is { profile?: ProfileRecord | null } => {
  return typeof value === "object" && value !== null && "profile" in value;
};

const defaultDesign: LinkPageDesign = {
  background: {
    type: "solid",
    solidColor: "#020617",
    gradientFrom: "#020617",
    gradientTo: "#0f172a",
    gradientAngle: 180,
    imageOpacity: 0.25,
    overlayColor: "#020617",
    overlayOpacity: 0.6,
  },
  buttonBg: "#f9fafb",
  buttonText: "#020617",
  textColor: "#f9fafb",
  accentColor: "#6366f1",
  header: {
    template: "classic",
    useProfileAvatar: true,
    useProfileName: true,
    useProfileBio: true,
    showSocialLinks: true,
  },
  typography: {
    headingSize: "md",
    bodySize: "sm",
    fontFamily: "system",
  },
};

const defaultBlockConfigs: Record<string, any> = {
  links: {
    layout: "classic",
  },
  text: {
    content: "",
    align: "center",
    size: "md",
    fontFamily: "system",
    tone: "default",
    style: {
      variant: "default",
      corner: "md",
      emphasis: "normal",
    },
  },
  image: {
    imageUrl: "",
    images: [],
    alt: "",
    display: "grid",
    size: "md",
    shape: "rounded",
    aspect: "auto",
    style: {
      variant: "default",
      corner: "xl",
      emphasis: "normal",
    },
  },
  social: {
    source: "profile",
    style: "icons",
  },
  separator: {
    variant: "line",
    label: null,
    thickness: 1,
    lineStyle: "solid",
  },
};

function DesignControls({
  design,
  onChange,
  onSave,
  onBackgroundImageUpload,
  disabled,
}: {
  design: LinkPageDesign;
  onChange: (design: LinkPageDesign) => void;
  onSave: () => void;
  onBackgroundImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const background = design.background || {};
  const typography = design.typography || {};

  const updateBackground = (partial: Partial<NonNullable<LinkPageDesign["background"]>>) =>
    onChange({
      ...design,
      background: { ...background, ...partial },
    });

  const updateTypography = (
    partial: Partial<NonNullable<LinkPageDesign["typography"]>>
  ) =>
    onChange({
      ...design,
      typography: { ...typography, ...partial },
    });

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Diseño rápido</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          Guardar diseño
        </button>
      </div>

      <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
        <p className="text-xs font-semibold text-slate-800">Fondo</p>
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Tipo de fondo
          <select
            value={background.type || "solid"}
            onChange={(e) => updateBackground({ type: e.target.value as any })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
          >
            <option value="solid">Sólido</option>
            <option value="gradient">Degradado</option>
            <option value="image">Imagen</option>
          </select>
        </label>

        {(!background.type || background.type === "solid") && (
          <label className="flex flex-col gap-1 text-xs text-slate-700">
            Color sólido
            <input
              type="color"
              value={background.solidColor || "#020617"}
              onChange={(e) => updateBackground({ solidColor: e.target.value })}
              className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
            />
          </label>
        )}

        {background.type === "gradient" && (
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
            <label className="flex flex-col gap-1">
              Desde
              <input
                type="color"
                value={background.gradientFrom || "#020617"}
                onChange={(e) => updateBackground({ gradientFrom: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              Hasta
              <input
                type="color"
                value={background.gradientTo || "#0f172a"}
                onChange={(e) => updateBackground({ gradientTo: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              Ángulo
              <input
                type="number"
                value={background.gradientAngle ?? 180}
                onChange={(e) => updateBackground({ gradientAngle: Number(e.target.value) })}
                className="rounded-md border border-slate-300 px-2 py-1"
              />
            </label>
          </div>
        )}

        {background.type === "image" && (
          <div className="space-y-2 text-xs text-slate-700">
            <label className="flex flex-col gap-1">
              URL de la imagen
              <input
                type="text"
                value={background.imageUrl || ""}
                onChange={(e) => updateBackground({ imageUrl: e.target.value })}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                placeholder="https://..."
              />
            </label>
            <label className="flex flex-col gap-1">
              Subir imagen
              <input
                type="file"
                accept="image/*"
                onChange={onBackgroundImageUpload}
                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1">
              Opacidad imagen (0-1)
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={background.imageOpacity ?? 0.25}
                onChange={(e) => updateBackground({ imageOpacity: Number(e.target.value) })}
                className="rounded-md border border-slate-300 px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              Color overlay
              <input
                type="color"
                value={background.overlayColor || "#020617"}
                onChange={(e) => updateBackground({ overlayColor: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              Opacidad overlay (0-1)
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={background.overlayOpacity ?? 0.6}
                onChange={(e) => updateBackground({ overlayOpacity: Number(e.target.value) })}
                className="rounded-md border border-slate-300 px-2 py-1"
              />
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Fondo botones
          <input
            type="color"
            value={design.buttonBg || "#f9fafb"}
            onChange={(e) => onChange({ ...design, buttonBg: e.target.value })}
            className="h-8 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Texto botones
          <input
            type="color"
            value={design.buttonText || "#020617"}
            onChange={(e) => onChange({ ...design, buttonText: e.target.value })}
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
          className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
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

      <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
        <p className="text-xs font-semibold text-slate-800">Tipografía</p>
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Tamaño títulos
          <select
            value={typography.headingSize || "md"}
            onChange={(e) => updateTypography({ headingSize: e.target.value as any })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
          >
            <option value="sm">Pequeño</option>
            <option value="md">Medio</option>
            <option value="lg">Grande</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Tamaño cuerpo
          <select
            value={typography.bodySize || "sm"}
            onChange={(e) => updateTypography({ bodySize: e.target.value as any })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
          >
            <option value="sm">Pequeño</option>
            <option value="md">Medio</option>
            <option value="lg">Grande</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          Familia tipográfica
          <select
            value={typography.fontFamily || "system"}
            onChange={(e) => updateTypography({ fontFamily: e.target.value as any })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
          >
            <option value="system">Sistema</option>
            <option value="sans">Sans</option>
            <option value="dm_sans">DM Sans</option>
            <option value="poppins">Poppins</option>
            <option value="space_grotesk">Space Grotesk</option>
            <option value="serif">Serif</option>
            <option value="mono">Mono</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default function LinkPagesScreen() {
  const [pages, setPages] = useState<LinkPageSummary[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<LinkPageWithContent | null>(null);
  const [designDraft, setDesignDraft] = useState<LinkPageDesign>(defaultDesign);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState({ internalName: "", slug: "" });
  const [pageSlugEdited, setPageSlugEdited] = useState(false);
  const [pageFormError, setPageFormError] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ title: "", blockType: "text" });
  const [blockCreating, setBlockCreating] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [imageDropActiveBlockId, setImageDropActiveBlockId] = useState<string | null>(null);
  const [imageReplaceTarget, setImageReplaceTarget] = useState<{ blockId: string; index: number } | null>(null);
  const imageReplaceInputRef = useRef<HTMLInputElement | null>(null);
  const imageAddInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [selectedImageIndexByBlock, setSelectedImageIndexByBlock] = useState<Record<string, number>>({});
  // Drafts for new link items keyed by block id.  In addition to label and URL,
  // a draft can contain optional iconType (e.g. "instagram", "twitter", "custom"),
  // a specific icon key (for default icons) and an imageUrl for custom uploads.
  const [linkDrafts, setLinkDrafts] = useState<
    Record<
      string,
      {
        label: string;
        url: string;
        iconType?: string;
        icon?: string | null;
        imageUrl?: string | null;
      }
    >
  >({});
  const [linkCreating, setLinkCreating] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<ProfileRecord | null>(null);

  // Estado para la gestión de enlaces sociales. Permite cargar, editar,
  // añadir y eliminar redes sociales del perfil desde la sección de páginas.
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [socialIconUploading, setSocialIconUploading] = useState<Record<number, boolean>>({});
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const SOCIAL_OPTIONS = [
    "instagram",
    "tiktok",
    "x",
    "youtube",
    "facebook",
    "linkedin",
    "whatsapp",
    "telegram",
    "spotify",
    "apple_music",
    "snapchat",
    "twitch",
    "discord",
    "pinterest",
    "threads",
    "soundcloud",
    "github",
    "website",
    "email",
    "custom",
  ];

  // Cargar redes sociales del perfil al montar el componente.
  useEffect(() => {
    const fetchSocial = async () => {
      try {
        setSocialLoading(true);
        setSocialError(null);
        const res = await fetch("/api/profile");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo cargar el perfil");
        }
        const data = await res.json();
        setSocialLinks(
          Array.isArray(data.socialLinks)
            ? data.socialLinks.map((l: any) => ({
                type: l.type || "custom",
                url: l.url || "",
                imageUrl: l.imageUrl || null,
              }))
            : []
        );
      } catch (err: any) {
        setSocialError(err.message || "Error al cargar redes sociales");
      } finally {
        setSocialLoading(false);
      }
    };
    fetchSocial();
  }, []);

  /**
   * Añade una nueva red social vacía al listado.
   */
  const handleAddSocial = () => {
    setSocialError(null);
    setSocialMessage(null);
    if (socialLinks.length >= 5) {
      setSocialError("Máximo 5 redes por el espacio en la cabecera.");
      return;
    }
    setSocialLinks((prev) => [...prev, { type: "custom", url: "" }]);
  };

  /**
   * Elimina la red social en la posición indicada.
   */
  const handleRemoveSocial = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Actualiza un campo específico (tipo o url) de una red social concreta.
   */
  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSocialImageUpload = async (index: number, file: File) => {
    try {
      setSocialIconUploading((prev) => ({ ...prev, [index]: true }));
      setSocialError(null);
      const url = await uploadImageFile(file);
      setSocialLinks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], imageUrl: url };
        return next;
      });
    } catch (err: any) {
      setSocialError(err.message || "Error subiendo imagen");
    } finally {
      setSocialIconUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  /**
   * Envía las redes sociales actualizadas al backend para persistir los cambios.
   */
  const handleSaveSocial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSocialSaving(true);
      setSocialError(null);
      setSocialMessage(null);

      const payloadLinks = socialLinks
        .slice(0, 5)
        .map((link) => ({
          type: (link.type || "custom").trim() || "custom",
          url: (link.url || "").trim(),
          imageUrl: link.imageUrl || null,
        }))
        .filter((link) => Boolean(link.url));

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ socialLinks: payloadLinks }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar las redes sociales");
      }
      await res.json().catch(() => ({}));
      setSocialLinks(payloadLinks);
      setSocialMessage("Redes sociales actualizadas");
    } catch (err: any) {
      setSocialError(err.message || "Error guardando redes sociales");
    } finally {
      setSocialSaving(false);
    }
  };

  async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/image", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "No se pudo subir la imagen");
    }
    return data.url as string;
  }

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
        if (!initialized && !selectedPageId && data.pages.length > 0) {
          const defaultPage = data.pages.find((p) => p.isDefault) || data.pages[0];
          setSelectedPageId(defaultPage.id);
        }
        if (!initialized) setInitialized(true);
      } catch (err: any) {
        setError(err.message || "Error cargando páginas");
      } finally {
        setLoadingPages(false);
      }
    };

    loadPages();
  }, [selectedPageId, initialized]);

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
        background: {
          ...defaultDesign.background,
          ...(currentPage.design?.background || {}),
        },
        typography: {
          ...defaultDesign.typography,
          ...(currentPage.design?.typography || {}),
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

      if (pages.length >= 5) {
        setPageFormError("Límite de 5 páginas alcanzado. Elimina alguna antes de crear otra.");
        setCreating(false);
        return;
      }

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
          config: defaultBlockConfigs[blockForm.blockType] || {},
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

  const updateBlockConfigLocal = (
    blockId: string,
    updater: (config: any) => any
  ) => {
    setCurrentPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === blockId
            ? { ...block, config: updater(block.config || {}) }
            : block
        ),
      };
    });
  };

  const handleSaveBlockConfig = async (blockId: string, config: any) => {
    try {
      await fetch(`/api/link-blocks/${blockId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ config }),
      });
    } catch (err: any) {
      setError(err.message || "Error guardando bloque");
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
      // Determine icon and imageUrl based on the draft's iconType.  If the user selected
      // a built‑in icon (e.g. instagram, x, tiktok) then set `icon` accordingly and leave
      // imageUrl null.  If the user uploaded a custom image, use the imageUrl and clear
      // the icon.  Otherwise both remain null.
      let icon: string | null = null;
      let imageUrl: string | null = null;
      if (draft.iconType === "emoji" && draft.icon) {
        icon = draft.icon;
      } else if (draft.iconType && draft.iconType !== "" && draft.iconType !== "custom") {
        icon = draft.iconType;
      }
      if (draft.iconType === "custom" && draft.imageUrl) {
        imageUrl = draft.imageUrl;
      }
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
          icon,
          imageUrl,
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
      setLinkDrafts((prev) => ({
        ...prev,
        [block.id]: { label: "", url: "", iconType: undefined, icon: undefined, imageUrl: undefined },
      }));
    } catch (err: any) {
      setError(err.message || "Error creando link");
    } finally {
      setLinkCreating((prev) => ({ ...prev, [block.id]: false }));
    }
  };

  /**
   * Carga un archivo de imagen para un ícono personalizado.  Cuando se
   * selecciona un archivo, se envía al endpoint de subida de imágenes
   * (/api/upload/image), que a su vez sube la imagen a Cloudinary y
   * devuelve la URL segura.  El resultado se almacena en el draft del
   * bloque correspondiente con iconType "custom" y se borra el valor
   * de icon por defecto.
   */
  const handleIconUpload = async (
    e: any,
    blockId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      setLinkDrafts((prev) => {
        const prevDraft = prev[blockId] || { label: "", url: "" };
        return {
          ...prev,
          [blockId]: {
            ...prevDraft,
            iconType: "custom",
            imageUrl: url,
            icon: undefined,
          },
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackgroundImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      setDesignDraft((prev) => ({
        ...prev,
        background: { ...(prev.background || {}), type: "image", imageUrl: url },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockImageUpload = async (e: any, blockId: string) => {
    const files = Array.from((e?.target?.files as FileList | undefined) ?? []);
    if (files.length === 0) return;

    await handleBlockImageFilesUpload(blockId, files);

    try {
      if (e?.target) e.target.value = "";
    } catch {
      // ignore
    }
  };

  const handleBlockImageFilesUpload = async (blockId: string, files: File[]) => {
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        uploadedUrls.push(await uploadImageFile(file));
      }

      updateBlockConfigLocal(blockId, (config) => {
        const existingItems = normalizeImageItems(config);
        const newItems = uploadedUrls.map((url) => ({ url, linkUrl: null }));
        const nextItems = [...existingItems, ...newItems].filter((i) => Boolean(i?.url));
        return {
          ...config,
          images: nextItems,
          imageUrl: nextItems[0]?.url || "",
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  type ImageItem = { url: string; linkUrl?: string | null };

  const normalizeImageItems = (config: any): ImageItem[] => {
    const rawImages = Array.isArray(config?.images) ? (config.images as any[]) : [];
    const itemsFromArray: ImageItem[] = rawImages
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") return { url: entry, linkUrl: null };
        if (typeof entry === "object" && entry !== null) {
          const url = entry.url ?? entry.imageUrl ?? entry.src;
          if (!url) return null;
          return {
            url: String(url),
            linkUrl: entry.linkUrl ? String(entry.linkUrl) : null,
          };
        }
        return null;
      })
      .filter(Boolean) as ImageItem[];

    if (itemsFromArray.length > 0) return itemsFromArray;

    if (config?.imageUrl) {
      return [{ url: String(config.imageUrl), linkUrl: null }];
    }
    return [];
  };

  const getBlockImages = (config: any): string[] => {
    return normalizeImageItems(config).map((i) => i.url).filter(Boolean);
  };



  const handleRemoveBlockImage = (blockId: string, index: number, currentCount: number) => {
    const currentSelected = selectedImageIndexByBlock[blockId] ?? 0;
    const nextCount = Math.max(0, currentCount - 1);
    const nextSelected = Math.max(0, Math.min(Math.max(0, nextCount - 1), currentSelected));
    setSelectedImageIndexByBlock((prev) => ({ ...prev, [blockId]: nextSelected }));

    updateBlockConfigLocal(blockId, (config) => {
      const items = normalizeImageItems(config).filter((_, i) => i !== index);
      return { ...config, images: items, imageUrl: items[0]?.url || "" };
    });
  };

  const handleMakePrimaryBlockImage = (blockId: string, index: number) => {
    setSelectedImageIndexByBlock((prev) => ({ ...prev, [blockId]: 0 }));
    updateBlockConfigLocal(blockId, (config) => {
      const items = normalizeImageItems(config);
      if (index <= 0 || index >= items.length) return config;
      const selected = items[index];
      const next = [selected, ...items.filter((_, i) => i !== index)];
      return { ...config, images: next, imageUrl: next[0]?.url || "" };
    });
  };

  const handleReplaceBlockImage = async (blockId: string, index: number, file: File) => {
    const url = await uploadImageFile(file);
    updateBlockConfigLocal(blockId, (config) => {
      const items = normalizeImageItems(config);
      const next = [...items];
      const prev = next[index];
      next[index] = { url, linkUrl: prev?.linkUrl ?? null };
      return { ...config, images: next, imageUrl: next[0]?.url || "" };
    });
  };

  const handleSetImageLinkUrl = (blockId: string, index: number, linkUrl: string) => {
    updateBlockConfigLocal(blockId, (config) => {
      const items = normalizeImageItems(config);
      if (!items[index]) return config;
      const next = [...items];
      next[index] = { ...next[index], linkUrl: linkUrl.trim() || null };
      return { ...config, images: next, imageUrl: next[0]?.url || "" };
    });
  };

  const openAddImagesPicker = (blockId: string) => {
    const input = imageAddInputRefs.current[blockId];
    input?.click();
  };

  const openReplaceImagePicker = (blockId: string, index: number) => {
    setImageReplaceTarget({ blockId, index });
    imageReplaceInputRef.current?.click();
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

  const handleDeleteLinkItem = async (blockId: string, itemId: string) => {
    if (!currentPage) return;
    const confirmed = window.confirm("¿Eliminar este link? Esta acción es permanente.");
    if (!confirmed) return;

    setCurrentPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, items: b.items.filter((it) => it.id !== itemId) } : b
        ),
      };
    });

    try {
      const res = await fetch(`/api/link-items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el link");
      }
    } catch (err: any) {
      setError(err.message || "Error eliminando el link");
      await reloadCurrentPage();
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!currentPage) return;
    const confirmed = window.confirm("¿Eliminar este bloque? No se puede deshacer.");
    if (!confirmed) return;

    try {
      setError(null);
      setCurrentPage((prev) =>
        prev ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) } : prev
      );
      await fetch(`/api/link-blocks/${blockId}`, { method: "DELETE" });
      await reloadCurrentPage();
    } catch (err: any) {
      setError(err.message || "Error eliminando bloque");
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

  const handleDeletePage = async (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    if (pages.length <= 1) {
      setError("No puedes eliminar tu única página. Crea otra antes de borrar esta.");
      return;
    }
    const confirmed = window.confirm(
      `¿Eliminar la página "${page.internalName}"? Esta acción es permanente.`
    );
    if (!confirmed) return;

    try {
      setError(null);
      await fetch(`/api/link-pages/${pageId}`, { method: "DELETE" });
      setPages((prev) => prev.filter((p) => p.id !== pageId));

      setSelectedPageId((prev) => {
        if (prev !== pageId) return prev;
        const remaining = pages.filter((p) => p.id !== pageId);
        return remaining[0]?.id ?? null;
      });
      setCurrentPage((prev) => (prev?.id === pageId ? null : prev));
      setDesignDraft(defaultDesign);
    } catch (err: any) {
      setError(err.message || "Error eliminando página");
    }
  };

  const previewProfile = profile
    ? {
        username: null,
        name: profile.title ?? null,
        bio: profile.bio ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        socialLinks,
        settings: {},
      }
    : undefined;

  const pageForPreview = currentPage
    ? {
        ...currentPage,
        design: designDraft,
        ...(previewProfile ? { profile: previewProfile } : {}),
      }
    : null;

  return (
    <DashboardLayout>
      <input
        ref={imageReplaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (!file || !imageReplaceTarget) return;
          const target = imageReplaceTarget;
          void (async () => {
            try {
              await handleReplaceBlockImage(target.blockId, target.index, file);
            } finally {
              setImageReplaceTarget(null);
              e.currentTarget.value = "";
            }
          })();
        }}
      />
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Páginas
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea y edita tus páginas tipo link-in-bio.
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Cambiamos el título para reflejar la lista de páginas existentes */}
            <p className="text-sm font-semibold text-slate-900">Tus páginas</p>
            <p className="text-xs text-slate-600">
              Selecciona una página para editar o elimina alguna. Usa el formulario de abajo para crear una nueva.
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {loadingPages ? (
            <p className="text-sm text-slate-500">Cargando páginas…</p>
          ) : pages.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no tienes páginas. Crea la primera.
            </p>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => {
                const publicUrl = getPublicLink(page.slug);

                return (
                  <div
                    key={page.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {page.internalName}
                        </span>
                        {page.isDefault && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        {/* mostramos la URL pública completa */}
                        <span>{publicUrl}</span>
                        {page.isPublished && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            Publicado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPageId(page.id)}
                      >
                        Abrir en el editor
                      </Button>

                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href={publicUrl} target="_blank">
                          Ver página pública
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* aquí sigue tu <form onSubmit={handleCreatePage} ...> tal y como ya lo tienes */}
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
        {/* Campo para especificar la URL pública de la página.  Muestra el dominio fijo
            rlead.xyz como prefijo y permite al usuario editar solo el slug. */}
        <label className="flex flex-col gap-1 text-xs text-slate-700">
          URL
          <div className="flex items-center gap-1">
            <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm text-slate-600">
              rlead.xyz/
            </span>
            <input
              type="text"
              value={pageForm.slug}
              onChange={(e) => {
                setPageSlugEdited(true);
                setPageForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              placeholder="tu-enlace"
            />
          </div>
        </label>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={creating} className="w-full">
            {creating ? "Creando..." : "Crear página"}
          </Button>
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

      {/*
        La lista de páginas en formato de chips solo se muestra cuando existen páginas.
        Si no hay páginas no repetimos el mensaje “Aún no tienes páginas” aquí para
        evitar duplicados (ya se muestra arriba en Accesos rápidos).
      */}
      {pages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {loadingPages ? (
            <span className="text-sm text-slate-500">Cargando páginas…</span>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedPageId(page.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                    page.id === selectedPageId
                      ? "border-slate-900 bg-slate-900/10 text-slate-900"
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
                <button
                  onClick={() => handleDeletePage(page.id)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                  title="Eliminar página"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <DesignControls
            design={designDraft}
            disabled={!currentPage}
            onChange={(d) => setDesignDraft(d)}
            onBackgroundImageUpload={handleBackgroundImageUpload}
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
                    className="w-40 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="text">Texto</option>
                    <option value="image">Imagen</option>
                    <option value="separator">Separador</option>
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

          <CollapsiblePanel
            title="Redes sociales"
            description="Se muestran en tu página pública con su icono (máximo 5)."
            defaultOpen
            className="bg-slate-50"
            right={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSocial}
                disabled={socialLoading}
              >
                + Añadir
              </Button>
            }
          >
            {socialLoading ? (
              <p className="text-sm text-slate-500">Cargando redes…</p>
            ) : (
              <form onSubmit={handleSaveSocial} className="space-y-3">
                {socialError && <div className="text-sm text-red-600">{socialError}</div>}
                {socialMessage && <div className="text-sm text-emerald-600">{socialMessage}</div>}

                {socialLinks.length === 0 ? (
                  <p className="text-sm text-slate-500">Aún no tienes redes añadidas.</p>
                ) : (
                  <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                      <div
                        key={`${link.type}-${index}`}
                        className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-12 md:items-center"
                      >
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Red
                          </label>
                          <select
                            value={link.type}
                            onChange={(e) => handleSocialChange(index, "type", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          >
                            {SOCIAL_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-6">
                          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Link del perfil
                          </label>
                          <div className="mt-1 flex items-center gap-2 rounded-lg border-2 border-indigo-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                            <Link2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                              placeholder="https://instagram.com/tu_usuario"
                              className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Ícono (opcional)
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                              {link.imageUrl ? (
                                <Image
                                  src={link.imageUrl}
                                  alt={`${link.type} icon`}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400">
                                  AUTO
                                </span>
                              )}
                            </div>
                            <input
                              id={`social-icon-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.currentTarget.files?.[0];
                                if (!file) return;
                                void handleSocialImageUpload(index, file);
                                e.currentTarget.value = "";
                              }}
                              className="hidden"
                            />
                            <Button
                              asChild
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={Boolean(socialIconUploading[index])}
                              className="shrink-0"
                            >
                              <label
                                htmlFor={`social-icon-${index}`}
                                title="Subir ícono"
                                aria-label="Subir ícono"
                                className="cursor-pointer"
                              >
                                <UploadCloud className="h-4 w-4" />
                              </label>
                            </Button>
                            {socialIconUploading[index] ? (
                              <span className="text-xs text-slate-500">Subiendo…</span>
                            ) : link.imageUrl ? (
                              <button
                                type="button"
                                onClick={() => handleSocialChange(index, "imageUrl", "")}
                                className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 hover:bg-slate-100"
                                title="Quitar icono"
                              >
                                Quitar
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-2 flex justify-end md:justify-start">
                            <button
                              type="button"
                              onClick={() => handleRemoveSocial(index)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={socialSaving}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                  >
                    {socialSaving ? "Guardando..." : "Guardar redes"}
                  </button>
                </div>
              </form>
            )}
          </CollapsiblePanel>

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

              {currentPage.blocks.map((block, blockIndex) => {
                const blockConfig = block.config || {};
                const isExpanded = expandedBlocks[block.id] ?? true;

                return (
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
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBlocks((prev) => ({
                              ...prev,
                              [block.id]: !(prev[block.id] ?? true),
                            }))
                          }
                          className="rounded border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
                          title={isExpanded ? "Ocultar opciones" : "Mostrar opciones"}
                          aria-expanded={isExpanded}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-300 ease-out",
                              isExpanded ? "rotate-180" : "rotate-0"
                            )}
                            aria-hidden="true"
                          />
                        </button>
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
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                          title="Eliminar bloque"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      )}
                    >
                      <div className="overflow-hidden">
                        <div
                          className={cn(
                            "pt-3 transition-[opacity,transform] duration-200 ease-out",
                            isExpanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                          )}
                        >
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
                              <button
                                type="button"
                                onClick={() => void handleDeleteLinkItem(block.id, item.id)}
                                className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                                title="Eliminar link"
                              >
                                ✕
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {block.blockType === "text" && (
                      <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <label className="flex flex-col gap-1">
                          Contenido
                          <textarea
                            value={blockConfig.content || ""}
                            onChange={(e) =>
                              updateBlockConfigLocal(block.id, (config) => ({
                                ...config,
                                content: e.target.value,
                              }))
                            }
                            className="min-h-[80px] rounded-md border border-slate-300 px-2 py-1 text-sm"
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          <label className="flex flex-col gap-1">
                            Alineación
                            <select
                              value={blockConfig.align || "center"}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  align: e.target.value,
                                }))
                              }
                              className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                            >
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Tamaño
                            <select
                              value={blockConfig.size || "md"}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  size: e.target.value,
                                }))
                              }
                              className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                            >
                              <option value="sm">Pequeño</option>
                              <option value="md">Medio</option>
                              <option value="lg">Grande</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Fuente
                            <select
                              value={blockConfig.fontFamily || "system"}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  fontFamily: e.target.value,
                                }))
                              }
                              className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                            >
                              <option value="system">Sistema</option>
                              <option value="sans">Sans</option>
                              <option value="dm_sans">DM Sans</option>
                              <option value="poppins">Poppins</option>
                              <option value="space_grotesk">Space Grotesk</option>
                              <option value="serif">Serif</option>
                              <option value="mono">Mono</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Tono
                            <select
                              value={blockConfig.tone || "default"}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  tone: e.target.value,
                                }))
                              }
                              className="rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                            >
                              <option value="default">Predeterminado</option>
                              <option value="muted">Suave</option>
                              <option value="highlight">Resaltado</option>
                            </select>
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            onClick={() => handleSaveBlockConfig(block.id, blockConfig)}
                          >
                            Guardar bloque
                          </button>
                        </div>
                      </div>
                    )}

                    {block.blockType === "image" && (() => {
                      const items = normalizeImageItems(blockConfig);
                      const images = items.map((i) => i.url);
                      const isDropActive = imageDropActiveBlockId === block.id;
                      const shape = String(blockConfig.shape || "rounded");
                      const shapeClass =
                        shape === "pill"
                          ? "rounded-full"
                          : shape === "square"
                          ? "rounded-none"
                          : "rounded-xl";

                      const aspect = String(blockConfig.aspect || "auto");
                      const aspectClass =
                        aspect === "16:9"
                          ? "aspect-[16/9]"
                          : aspect === "1:1"
                          ? "aspect-square"
                          : "aspect-[4/3]";

                      const size = String(blockConfig.size || "md");
                      const tileHeightClass =
                        size === "sm" ? "min-h-[92px]" : size === "lg" ? "min-h-[160px]" : "min-h-[128px]";
                      const display = String(blockConfig.display || "grid");

                      const cardBase =
                        "group relative overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:shadow-md";

                      const selectedIndex = selectedImageIndexByBlock[block.id] ?? 0;
                      const selectedItem = items[selectedIndex] || null;

                      return (
                        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                          <input
                            ref={(el) => {
                              imageAddInputRefs.current[block.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => void handleBlockImageUpload(e as any, block.id)}
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Imágenes
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                Sube, reemplaza o elimina una imagen específica
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openAddImagesPicker(block.id)}
                              className="gap-2"
                            >
                              <UploadCloud className="h-4 w-4" />
                              Subir
                            </Button>
                          </div>

                          <div
                            className={cn(
                              "rounded-2xl border-2 border-dashed bg-slate-50 p-3 transition",
                              isDropActive ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:border-slate-300"
                            )}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setImageDropActiveBlockId(block.id);
                            }}
                            onDragLeave={() => {
                              setImageDropActiveBlockId((prev) => (prev === block.id ? null : prev));
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setImageDropActiveBlockId(null);
                              const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
                                f.type.startsWith("image/")
                              );
                              if (dropped.length) void handleBlockImageFilesUpload(block.id, dropped);
                            }}
                          >
                            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                                <UploadCloud className="h-5 w-5 text-slate-700" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  Arrastra tus imágenes aquí
                                </p>
                                <p className="text-xs text-slate-600">
                                  O usa el botón “Subir” para elegir archivos.
                                </p>
                              </div>
                            </div>

                            {images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {items.map((item, idx) => (
                                  <div
                                    key={`${block.id}-img-${idx}`}
                                    className={cn(
                                      cardBase,
                                      shapeClass,
                                      "cursor-pointer",
                                      selectedIndex === idx ? "ring-2 ring-emerald-500" : "ring-0"
                                    )}
                                    onClick={() =>
                                      setSelectedImageIndexByBlock((prev) => ({
                                        ...prev,
                                        [block.id]: idx,
                                      }))
                                    }
                                  >
                                    <div className={cn("relative w-full", aspectClass, tileHeightClass)}>
                                      <Image
                                        src={item.url}
                                        alt={blockConfig.alt || `Imagen ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>

                                    {idx === 0 && (
                                      <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-900 shadow">
                                        Portada
                                      </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/55 via-black/0 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMakePrimaryBlockImage(block.id, idx);
                                        }}
                                        className="rounded-md bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
                                        title="Poner como portada"
                                      >
                                        <Star className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openReplaceImagePicker(block.id, idx);
                                        }}
                                        className="rounded-md bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
                                        title="Reemplazar imagen"
                                      >
                                        <RefreshCcw className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveBlockImage(block.id, idx, items.length);
                                        }}
                                        className="rounded-md bg-white/90 p-2 text-red-700 shadow hover:bg-white"
                                        title="Eliminar imagen"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => openAddImagesPicker(block.id)}
                                  className={cn(
                                    "flex min-h-[110px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                  )}
                                  title="Agregar más imágenes"
                                >
                                  <Plus className="h-4 w-4" />
                                  Agregar
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid gap-3">
                            <CollapsiblePanel
                              title="Link de la imagen seleccionada"
                              description={
                                selectedItem
                                  ? `Imagen ${selectedIndex + 1} ${selectedIndex === 0 ? "(portada)" : ""} · Si lo dejas vacío, no redirecciona.`
                                  : "Selecciona una miniatura para editar su link."
                              }
                              className="bg-slate-50 shadow-none"
                              headerClassName="px-3 py-2"
                              contentClassName="px-3 pb-3"
                              defaultOpen
                            >
                              <input
                                type="url"
                                value={(selectedItem?.linkUrl as string) || ""}
                                onChange={(e) =>
                                  handleSetImageLinkUrl(block.id, selectedIndex, e.target.value)
                                }
                                disabled={!selectedItem}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-slate-400 disabled:opacity-60 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="https://..."
                              />
                            </CollapsiblePanel>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-700">Layout</p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              {[
                                { value: "grid", label: "Grid" },
                                { value: "carousel", label: "Carrusel" },
                                { value: "mosaic", label: "Mosaico" },
                                { value: "filmstrip", label: "Filmstrip" },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    updateBlockConfigLocal(block.id, (config) => ({
                                      ...config,
                                      display: opt.value,
                                    }))
                                  }
                                  className={cn(
                                    "relative overflow-hidden rounded-2xl border p-3 text-left shadow-sm transition hover:shadow-md",
                                    display === opt.value
                                      ? "border-slate-900 bg-slate-900 text-white"
                                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                                  )}
                                >
                                  <div className="text-sm font-semibold">{opt.label}</div>
                                  <div className={cn("mt-2 grid gap-1", opt.value === "carousel" ? "grid-cols-3" : "grid-cols-2")}>
                                    {Array.from({ length: opt.value === "filmstrip" ? 3 : 4 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "h-7 rounded-md",
                                          display === opt.value ? "bg-white/20" : "bg-slate-200"
                                        )}
                                        style={{
                                          opacity: opt.value === "mosaic" && i === 0 ? 1 : 0.9,
                                          gridColumn:
                                            opt.value === "mosaic" && i === 0 ? "span 2 / span 2" : undefined,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">Tamaño</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { value: "sm", label: "S" },
                                  { value: "md", label: "M" },
                                  { value: "lg", label: "L" },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      updateBlockConfigLocal(block.id, (config) => ({
                                        ...config,
                                        size: opt.value,
                                      }))
                                    }
                                    className={cn(
                                      "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
                                      size === opt.value
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">Recorte</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { value: "auto", label: "Auto" },
                                  { value: "1:1", label: "1:1" },
                                  { value: "16:9", label: "16:9" },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      updateBlockConfigLocal(block.id, (config) => ({
                                        ...config,
                                        aspect: opt.value,
                                      }))
                                    }
                                    className={cn(
                                      "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
                                      aspect === opt.value
                                        ? "border-emerald-700 bg-emerald-600 text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">Bordes</p>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {[
                                  { value: "rounded", label: "Redondo" },
                                  { value: "pill", label: "Píldora" },
                                  { value: "square", label: "Cuadrado" },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      updateBlockConfigLocal(block.id, (config) => ({
                                        ...config,
                                        shape: opt.value,
                                      }))
                                    }
                                    className={cn(
                                      "rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition",
                                      shape === opt.value
                                        ? "border-indigo-700 bg-indigo-600 text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">Accesibilidad</p>
                              <label className="flex flex-col gap-1 text-xs text-slate-700">
                                Texto alternativo
                                <input
                                  type="text"
                                  value={blockConfig.alt || ""}
                                  onChange={(e) =>
                                    updateBlockConfigLocal(block.id, (config) => ({
                                      ...config,
                                      alt: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                  placeholder="Describe la imagen (opcional)"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                              onClick={() => handleSaveBlockConfig(block.id, blockConfig)}
                            >
                              Guardar bloque
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {block.blockType === "social" && (
                      <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <label className="flex flex-col gap-1">
                          Estilo
                          <select
                            value={blockConfig.style || "icons"}
                            onChange={(e) =>
                              updateBlockConfigLocal(block.id, (config) => ({
                                ...config,
                                style: e.target.value,
                              }))
                            }
                            className="rounded-md border border-slate-300 px-2 py-1"
                          >
                            <option value="icons">Iconos</option>
                            <option value="chips">Chips</option>
                          </select>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Las redes se toman de la configuración de redes sociales en esta sección.
                        </p>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            onClick={() => handleSaveBlockConfig(block.id, blockConfig)}
                          >
                            Guardar bloque
                          </button>
                        </div>
                      </div>
                    )}

                    {block.blockType === "separator" && (
                      <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <label className="flex flex-col gap-1">
                          Variante
                          <select
                            value={blockConfig.variant || "line"}
                            onChange={(e) =>
                              updateBlockConfigLocal(block.id, (config) => ({
                                ...config,
                                variant: e.target.value,
                              }))
                            }
                            className="rounded-md border border-slate-300 px-2 py-1"
                          >
                            <option value="line">Línea</option>
                            <option value="space">Espacio</option>
                          </select>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1">
                            Grosor (px)
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={Number(blockConfig.thickness ?? 1)}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  thickness: Number(e.target.value || 1),
                                }))
                              }
                              disabled={(blockConfig.variant || "line") === "space"}
                              className="rounded-md border border-slate-300 px-2 py-1"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            Tipo de línea
                            <select
                              value={blockConfig.lineStyle || "solid"}
                              onChange={(e) =>
                                updateBlockConfigLocal(block.id, (config) => ({
                                  ...config,
                                  lineStyle: e.target.value,
                                }))
                              }
                              disabled={(blockConfig.variant || "line") === "space"}
                              className="rounded-md border border-slate-300 px-2 py-1"
                            >
                              <option value="solid">Sólida</option>
                              <option value="dashed">Discontinua</option>
                              <option value="dotted">Punteada</option>
                              <option value="double">Doble</option>
                            </select>
                          </label>
                        </div>
                        <label className="flex flex-col gap-1">
                          Etiqueta (opcional)
                          <input
                            type="text"
                            value={blockConfig.label || ""}
                            onChange={(e) =>
                              updateBlockConfigLocal(block.id, (config) => ({
                                ...config,
                                label: e.target.value,
                              }))
                            }
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            placeholder="Título"
                          />
                        </label>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            onClick={() => handleSaveBlockConfig(block.id, blockConfig)}
                          >
                            Guardar bloque
                          </button>
                        </div>
                      </div>
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
                                  ...prev[block.id],
                                  label: e.target.value,
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
                                  ...prev[block.id],
                                  url: e.target.value,
                                },
                              }))
                            }
                            className="w-64 rounded-md border border-slate-300 px-2 py-1 text-sm"
                            placeholder="https://..."
                          />
                        </label>
                        {/* Selección de icono para el enlace */}
                        <label className="flex flex-col gap-1 text-xs text-slate-700">
                          Icono
                          <select
                            value={linkDrafts[block.id]?.iconType || ""}
                            onChange={(e) =>
                              setLinkDrafts((prev) => ({
                                ...prev,
                                [block.id]: {
                                  ...prev[block.id],
                                  iconType: e.target.value,
                                },
                              }))
                            }
                            className="w-40 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
                          >
                            <option value="">Ninguno</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="x">X/Twitter</option>
                            <option value="youtube">YouTube</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="facebook">Facebook</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="telegram">Telegram</option>
                            <option value="spotify">Spotify</option>
                            <option value="apple_music">Apple Music</option>
                            <option value="snapchat">Snapchat</option>
                            <option value="twitch">Twitch</option>
                            <option value="discord">Discord</option>
                            <option value="pinterest">Pinterest</option>
                            <option value="threads">Threads</option>
                            <option value="soundcloud">SoundCloud</option>
                            <option value="github">GitHub</option>
                            <option value="website">Website</option>
                            <option value="email">Email</option>
                            <option value="emoji">Emoji…</option>
                            <option value="custom">Personalizado…</option>
                          </select>
                        </label>
                        {linkDrafts[block.id]?.iconType === "emoji" && (
                          <input
                            type="text"
                            value={linkDrafts[block.id]?.icon || ""}
                            onChange={(e) =>
                              setLinkDrafts((prev) => ({
                                ...prev,
                                [block.id]: {
                                  ...prev[block.id],
                                  icon: e.target.value,
                                },
                              }))
                            }
                            className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                            placeholder="🙂"
                          />
                        )}
                        {/* Campo de carga solo cuando el usuario selecciona un icono personalizado */}
                        {linkDrafts[block.id]?.iconType === "custom" && (
                          <div className="flex items-center gap-2">
                            <input
                              id={`link-icon-${block.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleIconUpload(e as any, block.id)}
                              className="hidden"
                            />
                            <Button asChild type="button" variant="outline" size="icon">
                              <label
                                htmlFor={`link-icon-${block.id}`}
                                title="Subir ícono"
                                aria-label="Subir ícono"
                                className="cursor-pointer"
                              >
                                <UploadCloud className="h-4 w-4" />
                              </label>
                            </Button>
                            <span className="text-xs text-slate-500">
                              Subir PNG/JPG
                            </span>
                          </div>
                        )}
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vista previa de la página */}
        <div className="space-y-3 rounded-2xl border border-border bg-slate-950 p-3 text-slate-50 shadow-sm shadow-black/20">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Vista previa</h2>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  previewDevice === "mobile"
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                Móvil
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  previewDevice === "desktop"
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                Escritorio
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            {previewDevice === "mobile" ? (
              <div className="h-[720px] w-[min(390px,100%)]">
                <PublicLinkPage page={pageForPreview} variant="embed" />
              </div>
            ) : (
              <div className="h-[720px] w-[min(1100px,100%)]">
                <PublicLinkPage page={pageForPreview} variant="embed" />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
