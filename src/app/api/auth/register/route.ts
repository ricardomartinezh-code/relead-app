import { NextResponse } from "next/server";

import { createUserWithProfile } from "@/lib/mockDb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const baseSlug = (email as string).split("@")[0];
    await createUserWithProfile({
      name: name || baseSlug,
      email,
      password,
      slugBase: baseSlug,
    });

    return NextResponse.json({ message: "Cuenta creada correctamente." });
  } catch (error) {
    console.error("Register error:", error);

    if ((error as Error)?.message?.includes("El email ya está registrado")) {
      return NextResponse.json({ message: "Ya existe una cuenta con ese correo." }, { status: 400 });
    }

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
