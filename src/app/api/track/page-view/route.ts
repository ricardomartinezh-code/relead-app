import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, referrer, userAgent, ip } = body ?? {};
  if (!slug) return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
  const profile = await prisma.profile.findUnique({ where: { slug } });
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const view = await prisma.pageView.create({
    data: {
      profileId: profile.id,
      referrer,
      userAgent,
      ip,
    },
  });
  return NextResponse.json(view, { status: 201 });
}
