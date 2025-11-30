import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body ?? {};
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
  }
  const passwordHash = await hash(password, 10);
  const baseSlug = (email as string).split("@")[0];
  const slug = await generateUniqueSlug(baseSlug);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      profile: {
        create: {
          slug,
          title: name || slug,
        },
      },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
