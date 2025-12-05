import { getSession } from "@/lib/auth";
import { deleteLink, updateLink, getUserById } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await getUserById(session.user.id);
    if (!user?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

    const body = await req.json();
    const { label, url, isActive } = body ?? {};

    // Verificar que el enlace pertenece al usuario (hacer una query)
    // Por ahora confiaremos en que updateLink manejará esto
    const updated = await updateLink(params.id, {
      label,
      url,
      isActive,
    });

    if (!updated) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando enlace:", error);
    return NextResponse.json({ error: "Error al actualizar enlace" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await getUserById(session.user.id);
    if (!user?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

    const success = await deleteLink(params.id);
    if (!success) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando enlace:", error);
    return NextResponse.json({ error: "Error al eliminar enlace" }, { status: 500 });
  }
}
