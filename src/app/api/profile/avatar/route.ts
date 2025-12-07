import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateProfile } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { avatarUrl } = body ?? {};

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "URL de avatar inválida" }, { status: 400 });
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser?.profileId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

    const updatedProfile = await updateProfile(dbUser.profileId, { avatarUrl });

    return NextResponse.json(updatedProfile ?? { success: true });
  } catch (error) {
    console.error("Error guardando avatar:", error);
    return NextResponse.json({ error: "Error guardando avatar" }, { status: 500 });
  }
}
