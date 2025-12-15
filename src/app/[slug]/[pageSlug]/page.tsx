import type { Metadata } from "next";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";
import { getProfileBySlug, recordPageView } from "@/lib/db";
import { getPublicLinkPageByProfileSlugAndPageSlug } from "@/lib/db/linkPagePublic";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://relead.com.mx";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; pageSlug: string };
}): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) return {};

  const canonicalUrl = `${APP_BASE_URL}/${params.slug}/${params.pageSlug}`;
  const title = profile.title ? `${profile.title} | ReLead` : "Página pública | ReLead";
  const description = profile.bio || "Explora mis enlaces y contenido en ReLead.";
  const image = profile.avatarUrl || "/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "ReLead",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicLinkPageBySlug({
  params,
}: {
  params: { slug: string; pageSlug: string };
}) {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) return notFound();

  const page = await getPublicLinkPageByProfileSlugAndPageSlug(
    params.slug,
    params.pageSlug
  );
  if (!page) return notFound();

  const hdrs = headers();
  const referrer = hdrs.get("referer") || undefined;
  const userAgent = hdrs.get("user-agent") || undefined;
  const ip = hdrs.get("x-forwarded-for") || undefined;
  await recordPageView(profile.id, referrer, userAgent, ip);

  return <PublicLinkPage page={page} variant="full" />;
}

