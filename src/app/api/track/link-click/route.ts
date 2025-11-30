import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { linkId, referrer, userAgent, ip } = body ?? {};
  if (!linkId) return NextResponse.json({ error: "linkId requerido" }, { status: 400 });
  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
  const click = await prisma.linkClick.create({
    data: {
      linkId,
      referrer,
      userAgent,
      ip,
    },
  });
  return NextResponse.json(click, { status: 201 });
}
