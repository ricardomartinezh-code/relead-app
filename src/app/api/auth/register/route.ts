import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message: "El registro ahora se realiza con Clerk. Usa el flujo de SignUp de Clerk en /auth/register o /sign-up.",
    },
    { status: 410 }
  );
}
