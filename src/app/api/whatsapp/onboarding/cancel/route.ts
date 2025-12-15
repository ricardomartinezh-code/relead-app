import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { cancelActiveWhatsAppOnboardingSessions } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await cancelActiveWhatsAppOnboardingSessions(user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "wa_es_state",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

