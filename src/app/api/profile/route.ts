import { getSession } from "@/lib/auth";
import { getUserWithProfileByEmail, updateProfile } from "@/lib/mockDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { title, bio, avatarUrl, slug, theme } = body ?? {};

  const user = getUserWithProfileByEmail(session.user.email);
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  const updated = updateProfile({
    profileId: user.profile.id,
    title,
    bio,
    avatarUrl,
    slug,
    theme,
  });

  if (updated === "slug-taken") {
    return NextResponse.json({ error: "Slug no disponible" }, { status: 400 });
  }

  return NextResponse.json(updated);
}
