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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        {profile.avatarUrl && (
          <div className="mb-4 flex justify-center">
            <Image src={profile.avatarUrl} alt={profile.title} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-semibold text-gray-900">{profile.title}</h1>
        {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
        <div className="mt-6 space-y-3">
          <LinkButtons links={profile.links} />
        </div>
      </div>
    </div>
  );
}
