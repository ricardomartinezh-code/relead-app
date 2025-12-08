import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";

interface ProfileResponse {
  id: string;
  userId: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: any;
  settings: any;
  name?: string | null;
}

function mapProfile(row: any): ProfileResponse {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    socialLinks: row.social_links ?? [],
    settings: row.settings ?? {},
    name: row.name ?? null,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const rows = await sql/*sql*/`
      SELECT p.*, u.name
      FROM profiles p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ${user.id}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const profile = mapProfile(rows[0]);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { username, bio, avatarUrl, socialLinks, settings } = body ?? {};

    const currentRows = await sql/*sql*/`
      SELECT * FROM profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    if (!currentRows.length) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const current = currentRows[0];

    const nextUsername = username ?? current.username;
    const nextBio = bio ?? current.bio;
    const nextAvatarUrl = avatarUrl ?? current.avatar_url;
    const nextSocialLinks = socialLinks ?? current.social_links ?? [];
    const nextSettings = settings ?? current.settings ?? {};

    const updatedRows = await sql/*sql*/`
      UPDATE profiles
      SET
        username = ${nextUsername},
        bio = ${nextBio},
        avatar_url = ${nextAvatarUrl},
        social_links = ${nextSocialLinks}::jsonb,
        settings = ${nextSettings}::jsonb,
        updated_at = now()
      WHERE id = ${current.id}
      RETURNING *, (SELECT name FROM users WHERE id = user_id) AS name
    `;

    const updatedProfile = mapProfile(updatedRows[0]);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;
