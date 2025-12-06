import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type {
  BlockStyleConfig,
  LinkBlockWithItems,
  LinkItem,
  LinkPageDesign,
  LinkPageWithContent,
} from "@/types/link";
import type { PublicLinkPage } from "@/lib/db/linkPagePublic";

interface PublicLinkPageProps {
  page:
    | ((LinkPageWithContent | PublicLinkPage) & { profile?: PublicLinkPage["profile"] })
    | null;
  variant?: "full" | "preview";
}

interface RenderOptions {
  bodySizeClass: string;
  headingSizeClass: string;
  accentColor?: string;
  textColor?: string;
}

const SOCIAL_ICON_MAP: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  x: "🐦",
  youtube: "▶️",
  custom: "🔗",
};

function getAvatarInitials(title?: string | null) {
  if (!title) return "";
  const parts = title.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function buildBlockStyle(style?: BlockStyleConfig) {
  const cornerClass =
    style?.corner === "lg"
      ? "rounded-lg"
      : style?.corner === "xl"
      ? "rounded-xl"
      : style?.corner === "pill"
      ? "rounded-full"
      : "rounded-md";

  const variantClass =
    style?.variant === "soft"
      ? "bg-white/5"
      : style?.variant === "solid"
      ? "bg-white/10"
      : style?.variant === "outline"
      ? "border border-white/20"
      : "";

  return {
    className: [cornerClass, variantClass].filter(Boolean).join(" "),
    style: {
      backgroundColor: style?.bgColor,
      color: style?.textColor,
      borderColor: style?.borderColor,
    } as CSSProperties,
  };
}

function buildBackground(background?: LinkPageDesign["background"]) {
  const style: CSSProperties = {};
  const layers: ReactNode[] = [];

  if (!background?.type || background.type === "solid") {
    style.backgroundColor = background?.solidColor || "#020617";
  } else if (background.type === "gradient") {
    const angle = background.gradientAngle ?? 180;
    const from = background.gradientFrom || "#020617";
    const to = background.gradientTo || "#0f172a";
    style.backgroundImage = `linear-gradient(${angle}deg, ${from}, ${to})`;
  } else if (background.type === "image") {
    style.backgroundColor = background.overlayColor || background.solidColor || "#020617";
    if (background.imageUrl) {
      layers.push(
        <div
          key="image"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${background.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: background.imageOpacity ?? 0.25,
          }}
        />
      );
    }

    layers.push(
      <div
        key="overlay"
        className="absolute inset-0"
        style={{
          backgroundColor: background.overlayColor || "#020617",
          opacity: background.overlayOpacity ?? 0.6,
        }}
      />
    );
  }

  return { style, layers };
}

function renderLinks(
  block: LinkBlockWithItems,
  design: LinkPageDesign | null,
  options: RenderOptions
) {
  const style = (block.config?.style || {}) as BlockStyleConfig;
  const { className, style: inlineStyle } = buildBlockStyle(style);

  return (
    <div
      key={block.id}
      className={["space-y-2", className, options.bodySizeClass]
        .filter(Boolean)
        .join(" ")}
      style={inlineStyle}
    >
      {block.title && (
        <p className="text-sm font-semibold text-slate-100">{block.title}</p>
      )}
      <div className="space-y-2">
        {block.items.map((item: LinkItem) => (
          <a
            key={item.id}
            href={item.url || undefined}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-slate-50 transition hover:translate-y-[1px] hover:bg-white/10"
            style={{
              backgroundColor: design?.buttonBg,
              color: design?.buttonText,
            }}
          >
            <span className="truncate">{item.label}</span>
            {item.icon && <span className="ml-2 text-base">{item.icon}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

function renderTextBlock(
  block: LinkBlockWithItems,
  design: LinkPageDesign | null,
  options: RenderOptions
) {
  const config = block.config || {};
  const style = (config.style || {}) as BlockStyleConfig;
  const { className, style: inlineStyle } = buildBlockStyle(style);
  const tone = config.tone || "default";
  const toneClass =
    tone === "muted"
      ? "text-slate-300"
      : tone === "highlight"
      ? "text-indigo-200"
      : "text-slate-100";
  const alignClass = config.align === "left" ? "text-left" : "text-center";
  const sizeClass =
    config.size === "sm"
      ? "text-sm"
      : config.size === "lg"
      ? "text-lg"
      : "text-base";

  const mergedStyle: CSSProperties = { ...inlineStyle };
  if (tone === "highlight" && options.accentColor) {
    mergedStyle.color = options.accentColor;
  } else if (options.textColor) {
    mergedStyle.color = options.textColor;
  }
  if (tone === "muted") {
    mergedStyle.opacity = 0.8;
  }

  return (
    <div
      key={block.id}
      className={[
        "p-3",
        className,
        alignClass,
        sizeClass,
        toneClass,
        options.bodySizeClass,
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle}
    >
      {config.content || "Bloque de texto vacío"}
    </div>
  );
}

function renderImageBlock(block: LinkBlockWithItems, _design: LinkPageDesign | null) {
  const config = block.config || {};
  const style = (config.style || {}) as BlockStyleConfig;
  const { className, style: inlineStyle } = buildBlockStyle(style);
  const shapeClass =
    config.shape === "pill"
      ? "rounded-full"
      : config.shape === "square"
      ? "rounded-none"
      : "rounded-xl";
  const aspectClass =
    config.aspect === "16:9"
      ? "aspect-[16/9]"
      : config.aspect === "1:1"
      ? "aspect-square"
      : "";

  return (
    <div
      key={block.id}
      className={["overflow-hidden", className].filter(Boolean).join(" ")}
      style={inlineStyle}
    >
      <div className={["relative w-full", aspectClass].filter(Boolean).join(" ")}
           style={!aspectClass ? { minHeight: "160px" } : undefined}>
        {config.imageUrl ? (
          <Image
            src={config.imageUrl}
            alt={config.alt || "Imagen"}
            fill
            className={["object-cover", shapeClass].join(" ")}
          />
        ) : (
          <div className={["flex h-full w-full items-center justify-center bg-white/5", shapeClass].join(" ")}>
            <span className="text-xs text-slate-200">Añade una imagen</span>
          </div>
        )}
      </div>
    </div>
  );
}

function renderSocialBlock(
  block: LinkBlockWithItems,
  profile: PublicLinkPage["profile"] | undefined,
  _design: LinkPageDesign | null
) {
  const config = block.config || {};
  const styleConfig = (config.style || {}) as BlockStyleConfig;
  const { className, style: inlineStyle } = buildBlockStyle(styleConfig);
  const links = Array.isArray(profile?.socialLinks) ? profile?.socialLinks : [];

  return (
    <div
      key={block.id}
      className={["p-2", className].filter(Boolean).join(" ")}
      style={inlineStyle}
    >
      {links.length === 0 && (
        <p className="text-sm text-slate-300">Sin redes configuradas.</p>
      )}

      {config.style === "chips" ? (
        <div className="flex flex-wrap gap-2">
          {links.map((link: any, idx: number) => (
            <a
              key={`${link.type}-${idx}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-50"
            >
              <span>{SOCIAL_ICON_MAP[link.type] || "🔗"}</span>
              <span className="max-w-[150px] truncate">{link.type}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {links.map((link: any, idx: number) => (
            <a
              key={`${link.type}-${idx}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg"
            >
              {SOCIAL_ICON_MAP[link.type] || "🔗"}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function renderSeparatorBlock(
  block: LinkBlockWithItems,
  _design: LinkPageDesign | null,
  options: RenderOptions
) {
  const config = block.config || {};
  const style = (config.style || {}) as BlockStyleConfig;
  const { className, style: inlineStyle } = buildBlockStyle(style);

  if (config.variant === "space") {
    return <div key={block.id} className={["my-4", className].filter(Boolean).join(" ")} style={inlineStyle} />;
  }

  return (
    <div
      key={block.id}
      className={["space-y-2", className].filter(Boolean).join(" ")}
      style={inlineStyle}
    >
      <div className="h-px w-full bg-white/10" />
      {config.label && (
        <p className={["text-center text-xs text-slate-200", options.bodySizeClass]
          .filter(Boolean)
          .join(" ")}
        >
          {config.label}
        </p>
      )}
    </div>
  );
}

export default function PublicLinkPage({ page, variant = "full" }: PublicLinkPageProps) {
  if (!page) {
    if (variant === "preview") {
      return (
        <div className="flex h-96 w-52 items-center justify-center rounded-[2rem] border border-slate-700 bg-slate-900 text-xs text-slate-500">
          Sin página seleccionada
        </div>
      );
    }

    return null;
  }

  const design = (page as any).design as LinkPageDesign | null;
  const typography = design?.typography || {};
  const headingSizeClass =
    typography.headingSize === "sm"
      ? "text-sm"
      : typography.headingSize === "lg"
      ? "text-lg"
      : "text-base";

  const bodySizeClass =
    typography.bodySize === "sm"
      ? "text-xs"
      : typography.bodySize === "lg"
      ? "text-base"
      : "text-sm";

  const fontFamilyClass =
    typography.fontFamily === "sans"
      ? "font-sans"
      : typography.fontFamily === "serif"
      ? "font-serif"
      : typography.fontFamily === "mono"
      ? "font-mono"
      : "";

  const renderOptions: RenderOptions = {
    bodySizeClass,
    headingSizeClass,
    accentColor: design?.accentColor,
    textColor: design?.textColor,
  };

  const { style: backgroundStyle, layers: backgroundLayers } = buildBackground(
    design?.background
  );

  const profile = page.profile;
  const title = page.publicTitle || profile?.username || page.internalName;
  const description = profile?.bio || page.publicDescription || "";
  const avatarUrl = profile?.avatarUrl || null;
  const socialLinks = Array.isArray(profile?.socialLinks) ? profile?.socialLinks : [];
  const headerDesign = design?.header || {};

  const header = (
    <div className={`flex flex-col items-center gap-3 text-center ${fontFamilyClass}`}>
      {headerDesign.useProfileAvatar !== false && (
        avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={title || "Avatar"}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border-2 border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-xl font-semibold text-white">
            {getAvatarInitials(title) || "☆"}
          </div>
        )
      )}
      <div className="space-y-1">
        {headerDesign.useProfileName !== false && (
          <p className={`font-semibold text-white ${headingSizeClass}`}>{title}</p>
        )}
        {headerDesign.useProfileBio !== false && description && (
          <p className={`text-slate-200 ${bodySizeClass}`}>{description}</p>
        )}
        {profile?.username && (
          <p className={`text-xs font-medium text-slate-300 ${bodySizeClass}`}>
            @{profile.username}
          </p>
        )}
      </div>
      {socialLinks && socialLinks.length > 0 && headerDesign.useProfileBio !== false && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {socialLinks.map((link: any, idx: number) => (
            <span
              key={`${link.type}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
            >
              <span>{SOCIAL_ICON_MAP[link.type] || "🔗"}</span>
              <span className="max-w-[150px] truncate">{link.url}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const content = (
    <div className={`space-y-5 ${fontFamilyClass}`}>
      {page.blocks
        .filter((block) => block.isVisible)
        .map((block) => {
          if (block.blockType === "links") return renderLinks(block, design, renderOptions);
          if (block.blockType === "text") return renderTextBlock(block, design, renderOptions);
          if (block.blockType === "image") return renderImageBlock(block, design);
          if (block.blockType === "social")
            return renderSocialBlock(block, profile, design);
          if (block.blockType === "separator")
            return renderSeparatorBlock(block, design, renderOptions);

          const style = (block.config?.style || {}) as BlockStyleConfig;
          const { className, style: inlineStyle } = buildBlockStyle(style);

          return (
            <div
              key={block.id}
              className={[
                "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left",
                className,
              ]
                .filter(Boolean)
                .join(" ")}
              style={inlineStyle}
            >
              <p className={`font-semibold text-slate-50 ${headingSizeClass}`}>
                {block.title || `Bloque ${block.blockType}`}
              </p>
              {block.subtitle && (
                <p className={`mt-1 text-slate-300 ${bodySizeClass}`}>{block.subtitle}</p>
              )}
            </div>
          );
        })}
    </div>
  );

  if (variant === "preview") {
    return (
      <div
        className={`relative flex h-96 w-52 flex-col overflow-hidden rounded-[2.2rem] border border-slate-700 px-3 py-4 ${fontFamilyClass}`}
        style={backgroundStyle}
      >
        {backgroundLayers}
        <div className="relative z-10 flex-1 space-y-4 overflow-hidden" style={{ color: design?.textColor }}>
          {header}
          <div className="h-[1px] w-full bg-white/5" />
          <div className={`scrollbar-thin max-h-36 space-y-3 overflow-y-auto pr-1 ${bodySizeClass}`}>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`relative min-h-screen text-slate-50 ${fontFamilyClass}`}
      style={{ ...backgroundStyle, color: design?.textColor }}
    >
      {backgroundLayers}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
        {header}
        <div className={`space-y-4 rounded-2xl bg-white/5 p-4 shadow-lg shadow-black/30 ${bodySizeClass}`}>
          {content}
        </div>
        <p className="text-center text-xs text-slate-400">Hecho con ReLead</p>
      </div>
    </main>
  );
}
