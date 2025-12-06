import Image from "next/image";
import type { LinkBlockWithItems, LinkItem, LinkPageWithContent } from "@/types/link";
import type { PublicLinkPage } from "@/lib/db/linkPagePublic";

interface PublicLinkPageProps {
  page: (LinkPageWithContent | PublicLinkPage | null) & {
    profile?: PublicLinkPage["profile"];
  };
  variant?: "full" | "preview";
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

function renderLinks(block: LinkBlockWithItems) {
  return (
    <div key={block.id} className="space-y-2">
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
          >
            <span className="truncate">{item.label}</span>
            {item.icon && <span className="ml-2 text-base">{item.icon}</span>}
          </a>
        ))}
      </div>
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

  const profile = page.profile;
  const title = page.publicTitle || profile?.username || page.internalName;
  const description = profile?.bio || page.publicDescription || "";
  const avatarUrl = profile?.avatarUrl || null;
  const socialLinks = Array.isArray(profile?.socialLinks) ? profile?.socialLinks : [];

  const header = (
    <div className="flex flex-col items-center gap-3 text-center">
      {avatarUrl ? (
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
      )}
      <div className="space-y-1">
        <p className="text-lg font-semibold text-white">{title}</p>
        {description && <p className="text-sm text-slate-200">{description}</p>}
        {profile?.username && (
          <p className="text-xs font-medium text-slate-300">@{profile.username}</p>
        )}
      </div>
      {socialLinks && socialLinks.length > 0 && (
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
    <div className="space-y-5">
      {page.blocks
        .filter((block) => block.isVisible)
        .map((block) => {
          if (block.blockType === "links") {
            return renderLinks(block);
          }

          return (
            <div
              key={block.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left"
            >
              <p className="text-sm font-semibold text-slate-50">
                {block.title || `Bloque ${block.blockType}`}
              </p>
              {block.subtitle && (
                <p className="mt-1 text-sm text-slate-300">{block.subtitle}</p>
              )}
            </div>
          );
        })}
    </div>
  );

  if (variant === "preview") {
    return (
      <div className="flex h-96 w-52 flex-col rounded-[2.2rem] border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 px-3 py-4">
        <div className="flex-1 space-y-4 overflow-hidden">
          {header}
          <div className="h-[1px] w-full bg-white/5" />
          <div className="scrollbar-thin max-h-36 space-y-3 overflow-y-auto pr-1">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
        {header}
        <div className="space-y-4 rounded-2xl bg-white/5 p-4 shadow-lg shadow-black/30">{content}</div>
        <p className="text-center text-xs text-slate-400">Hecho con ReLead</p>
      </div>
    </main>
  );
}
