import { recordLinkClick } from "@/lib/mockDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { linkId, referrer, userAgent, ip } = body ?? {};
  if (!linkId) return NextResponse.json({ error: "linkId requerido" }, { status: 400 });
  const click = recordLinkClick({ linkId, referrer, userAgent, ip });
  if (!click) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
  return NextResponse.json(click, { status: 201 });
}
