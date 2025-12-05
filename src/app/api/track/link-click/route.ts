import { recordLinkClick } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { linkId, referrer, userAgent, ip } = body ?? {};
    
    if (!linkId) return NextResponse.json({ error: "linkId requerido" }, { status: 400 });
    
    const click = await recordLinkClick(linkId, referrer, userAgent, ip);
    return NextResponse.json(click, { status: 201 });
  } catch (error) {
    console.error("Error registrando clic:", error);
    return NextResponse.json({ error: "Error al registrar clic" }, { status: 500 });
  }
}
