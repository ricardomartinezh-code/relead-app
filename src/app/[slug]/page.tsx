import { LinkButtons } from "@/components/PublicLinks";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

function getInitials(text: string) {
  const parts = text.split(" ").filter(Boolean);
  if (parts.length === 0) return "RL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: { links: { where: { isActive: true }, orderBy: { order: "asc" } } },
  });
  if (!profile) return notFound();

  const hdrs = headers();
  const referrer = hdrs.get("referer") || undefined;
  const userAgent = hdrs.get("user-agent") || undefined;
  const ip = hdrs.get("x-forwarded-for") || undefined;
  await prisma.pageView.create({ data: { profileId: profile.id, referrer, userAgent, ip } });

  const initials = getInitials(profile.title || "ReLead");

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
            {profile.bio && <p className="text-sm text-slate-300">{profile.bio}</p>}
          </div>
        </div>

        <LinkButtons links={profile.links} />

        <p className="mt-6 text-center text-xs text-slate-500">Hecho con ReLead · relead.com.mx</p>
      </div>
    </main>
  );
}
