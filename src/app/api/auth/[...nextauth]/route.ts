import { NextResponse } from "next/server";

function handler() {
  return NextResponse.json(
    { message: "La autenticación ahora usa Clerk. Usa /sign-in o /auth/login con Clerk." },
    { status: 410 }
  );
}

export { handler as GET, handler as POST };
