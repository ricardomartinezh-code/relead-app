import type { Metadata } from "next";
import { LinkButtons } from "@/components/PublicLinks";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";
import {
  getProfileBySlug,
  getLinksByProfileId,
  recordPageView,
} from "@/lib/db";
import { getDefaultPublicLinkPageByUserId } from "@/lib/db/linkPagePublic";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

function getInitials(text: string) {
  const parts = text.split(" ").filter(Boolean);
  if (parts.length === 0) return "RL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://relead.com.mx";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug);

  const canonicalUrl = `${APP_BASE_URL}/${params.slug}`;

  if (!profile) {
    return {
      title: "Perfil no encontrado | ReLead",
      description: "El perfil solicitado no existe o ha sido desactivado.",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "website",
        title: "Perfil no encontrado | ReLead",
        description: "El perfil solicitado no existe o ha sido desactivado.",
        url: canonicalUrl,
        siteName: "ReLead",
      },
      twitter: {
        card: "summary",
        title: "Perfil no encontrado | ReLead",
        description: "El perfil solicitado no existe o ha sido desactivado.",
      },
    };
  }

  const title = profile.title
    ? `${profile.title} | ReLead`
    : "Perfil público | ReLead";
  const description =
    profile.bio || "Explora todos mis enlaces, redes y contenido en ReLead.";
  const image = profile.avatarUrl || "/og-default.png";

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalUrl,
      siteName: "ReLead",
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) return notFound();

  const defaultLinkPage = await getDefaultPublicLinkPageByUserId(
    profile.userId,
  );

  const links = await getLinksByProfileId(profile.id);
  const activeLinks = links.filter((l) => l.isActive);

  const hdrs = headers();
  const referrer = hdrs.get("referer") || undefined;
  const userAgent = hdrs.get("user-agent") || undefined;
  const ip = hdrs.get("x-forwarded-for") || undefined;
  await recordPageView(profile.id, referrer, userAgent, ip);

  const initials = getInitials(profile.title || "ReLead");

  if (defaultLinkPage) {
    return <PublicLinkPage page={defaultLinkPage} variant="full" />;
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.title}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border-2 border-white/30 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-xl font-semibold text-slate-100 shadow-lg">
              {initials}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{profile.title}</h1>
            {profile.bio && (
              <p className="text-sm text-slate-300">{profile.bio}</p>
            )}
          </div>
        </div>

        <LinkButtons links={activeLinks} />

        <p className="mt-6 text-center text-xs text-slate-500">
          Hecho con ReLead · relead.com.mx
        </p>
      </div>
    </main>
  );
}
