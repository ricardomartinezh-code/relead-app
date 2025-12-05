import { getSession } from "@/lib/auth";
import { createLink, getLinksForProfile, getUserWithProfileByEmail } from "@/lib/mockDb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = getUserWithProfileByEmail(session.user.email);
  if (!user?.profile) return NextResponse.json([]);
  const links = getLinksForProfile(user.profile.id);
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = getUserWithProfileByEmail(session.user.email);
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const body = await req.json();
  const { label, url, order = 0, isActive = true } = body ?? {};
  const link = createLink({
    label,
    url,
    order,
    isActive,
    profileId: user.profile.id,
  });
  return NextResponse.json(link, { status: 201 });
}
