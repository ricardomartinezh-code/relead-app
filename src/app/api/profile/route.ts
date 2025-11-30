import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { title, bio, avatarUrl, slug, theme } = body ?? {};

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  if (slug && slug !== user.profile.slug) {
    const exists = await prisma.profile.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: "Slug no disponible" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id: user.profile.id },
    data: { title, bio, avatarUrl, slug, theme },
  });

  return NextResponse.json(updated);
}
