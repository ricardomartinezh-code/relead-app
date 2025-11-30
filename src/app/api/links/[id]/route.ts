import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getProfileId(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  return user?.profile?.id;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const profileId = await getProfileId(session.user.email);
  if (!profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const body = await req.json();
  const { label, url, order, isActive } = body ?? {};

  const link = await prisma.link.findUnique({ where: { id: params.id } });
  if (!link || link.profileId !== profileId) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

  const updated = await prisma.link.update({
    where: { id: params.id },
    data: { label, url, order, isActive },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const profileId = await getProfileId(session.user.email);
  if (!profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const link = await prisma.link.findUnique({ where: { id: params.id } });
  if (!link || link.profileId !== profileId) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
  await prisma.link.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
