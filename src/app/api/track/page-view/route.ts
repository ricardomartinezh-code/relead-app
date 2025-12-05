import { getProfileBySlug, recordPageView } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, referrer, userAgent, ip } = body ?? {};
    
    if (!slug) return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
    
    const profile = await getProfileBySlug(slug);
    if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    
    const view = await recordPageView(profile.id, referrer, userAgent, ip);
    return NextResponse.json(view, { status: 201 });
  } catch (error) {
    console.error("Error registrando vista:", error);
    return NextResponse.json({ error: "Error al registrar vista" }, { status: 500 });
  }
}
