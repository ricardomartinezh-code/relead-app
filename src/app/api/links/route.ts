import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return NextResponse.json([]);
  const links = await prisma.link.findMany({ where: { profileId: user.profile.id }, orderBy: { order: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } });
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const body = await req.json();
  const { label, url, order = 0, isActive = true } = body ?? {};
  const link = await prisma.link.create({
    data: {
      label,
      url,
      order,
      isActive,
      profileId: user.profile.id,
    },
  });
  return NextResponse.json(link, { status: 201 });
}
