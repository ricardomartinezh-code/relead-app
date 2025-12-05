import { NextResponse } from "next/server";

import { getProfileBySlug, getUserByUsername } from "@/lib/db";
import { USERNAME_RULES_MESSAGE, validateUsernameInput } from "@/lib/username";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const usernameParam = url.searchParams.get("username");

  const validation = validateUsernameInput(usernameParam);
  if (!validation.valid || !validation.normalized) {
    return NextResponse.json(
      {
        available: false,
        message: validation.message ?? USERNAME_RULES_MESSAGE,
      },
      { status: 400 }
    );
  }

  const [existingUser, existingProfile] = await Promise.all([
    getUserByUsername(validation.normalized),
    getProfileBySlug(validation.normalized),
  ]);

  if (existingUser) {
    return NextResponse.json(
      { available: false, message: "El nombre de usuario ya está en uso." },
      { status: 409 }
    );
  }

  if (existingProfile) {
    return NextResponse.json(
      { available: false, message: "Ya existe un perfil con ese slug." },
      { status: 409 }
    );
  }

  return NextResponse.json({ available: true, username: validation.normalized });
}
