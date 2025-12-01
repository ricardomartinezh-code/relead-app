import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LinkButtons } from "@/components/PublicLinks";

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          {profile.avatarUrl && (
            <Image
              src={profile.avatarUrl}
              alt={profile.title}
              width={96}
              height={96}
              className="mb-4 h-24 w-24 rounded-full border-2 border-white/40 object-cover shadow-lg"
            />
          )}
          <h1 className="text-2xl font-semibold">{profile.title}</h1>
          {profile.bio && <p className="mt-2 text-sm text-white/70">{profile.bio}</p>}
        </div>

        <div className="space-y-3">
          <LinkButtons links={profile.links} />
        </div>
      </div>
    </main>
  );
}
