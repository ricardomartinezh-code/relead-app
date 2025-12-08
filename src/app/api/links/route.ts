import { getSession } from "@/lib/auth";
import { createLink, getLinksByProfileId, getUserById } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await getUserById(userId);
    if (!user?.profileId) return NextResponse.json([]);
    const links = await getLinksByProfileId(user.profileId);
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error obteniendo enlaces:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await getUserById(userId);
    if (!user?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    
    const body = await req.json();
    const { label, url } = body ?? {};
    
    if (!label || !url) {
      return NextResponse.json({ error: "Label y URL son obligatorios" }, { status: 400 });
    }

    const link = await createLink(user.profileId, label, url);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creando enlace:", error);
    return NextResponse.json({ error: "Error al crear enlace" }, { status: 500 });
  }
}
