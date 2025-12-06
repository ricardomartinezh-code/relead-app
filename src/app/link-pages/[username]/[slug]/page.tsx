import { notFound } from "next/navigation";
import PublicLinkPage from "@/components/link-pages/PublicLinkPage";
import { getPublicLinkPageByUsernameAndSlug } from "@/lib/db/linkPagePublic";

export default async function PublicLinkPageScreen({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const page = await getPublicLinkPageByUsernameAndSlug(
    params.username,
    params.slug
  );

  if (!page) return notFound();

  return <PublicLinkPage page={page} variant="full" />;
}
