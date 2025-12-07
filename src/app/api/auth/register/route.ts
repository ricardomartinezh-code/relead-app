import { NextResponse } from "next/server";

import {
  createUser,
  getProfileBySlug,
  getUserByEmail,
  getUserByUsername,
} from "@/lib/db";
import { USERNAME_RULES_MESSAGE, validateUsernameInput } from "@/lib/username";

export async function POST(req: Request) {
  try {
    const { name, email, password, username } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    const usernameValidation = validateUsernameInput(username);
    if (!usernameValidation.valid || !usernameValidation.normalized) {
      return NextResponse.json(
        { message: usernameValidation.message ?? USERNAME_RULES_MESSAGE },
        { status: 400 }
      );
    }

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese correo." },
        { status: 400 }
      );
    }

    const [existingUsername, existingSlug] = await Promise.all([
      getUserByUsername(usernameValidation.normalized),
      getProfileBySlug(usernameValidation.normalized),
    ]);

    if (existingUsername) {
      return NextResponse.json(
        { message: "El nombre de usuario ya está en uso." },
        { status: 400 }
      );
    }

    if (existingSlug) {
      return NextResponse.json(
        {
          message:
            "Ese slug ya está asignado a otro perfil. Elige otro nombre de usuario.",
        },
        { status: 400 }
      );
    }

    const newUser = await createUser(
      normalizedEmail,
      name || normalizedEmail,
      password,
      usernameValidation.normalized,
      usernameValidation.normalized
    );

    return NextResponse.json(
      {
        message: "Cuenta creada correctamente.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        username: newUser.username,
        slug: newUser.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        message: "Error al crear la cuenta.",
        ...(isDev && { devError: (error as Error)?.message ?? String(error) }),
      },
      { status: 500 }
    );
  }
}
