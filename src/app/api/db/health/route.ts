import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Aplicación en modo sin base de datos usando datos en memoria.",
  });
}
