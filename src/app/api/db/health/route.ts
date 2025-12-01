import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      message: "Prisma conectado correctamente a la base de datos.",
    });
  } catch (error: any) {
    console.error("DB health check error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Error al conectar con la base de datos.",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
