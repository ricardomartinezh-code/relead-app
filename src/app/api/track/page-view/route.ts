import { findProfileBySlug, recordPageView } from "@/lib/mockDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, referrer, userAgent, ip } = body ?? {};
  if (!slug) return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
  const profile = findProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  const view = recordPageView({
    profileId: profile.id,
    referrer,
    userAgent,
    ip,
  });
  return NextResponse.json(view, { status: 201 });
}
