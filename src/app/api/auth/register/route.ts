import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese correo." },
        { status: 400 }
      );
    }

    const hashed = await hash(password, 10);
    const baseSlug = (email as string).split("@")[0];
    const slug = await generateUniqueSlug(baseSlug);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        profile: {
          create: {
            slug,
            title: name || slug,
          },
        },
      },
    });

    return NextResponse.json({ message: "Cuenta creada correctamente." });
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
