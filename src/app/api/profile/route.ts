import { getSession } from "@/lib/auth";
import { getUserById, getProfileById, updateProfile } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await getUserById(session.user.id);
    if (!user?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

    const profile = await getProfileById(user.profileId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, bio, avatarUrl, theme } = body ?? {};

    const user = await getUserById(session.user.id);
    if (!user?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

    const updated = await updateProfile(user.profileId, {
      title,
      bio,
      avatarUrl,
      theme,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
