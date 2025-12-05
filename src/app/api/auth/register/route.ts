import { NextResponse } from "next/server";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, username } = await req.json();

    if (!email || !password) {
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
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese correo." },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe (si se proporciona)
    if (username) {
      const existingUsername = await getUserByUsername(username);
      if (existingUsername) {
        return NextResponse.json(
          { message: "El nombre de usuario ya está en uso." },
          { status: 400 }
        );
      }
    }

    const newUser = await createUser(email, name || email, password, username);

    return NextResponse.json({
      message: "Cuenta creada correctamente.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
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
