import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getActiveWhatsAppOnboardingSessionByUserId } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const session = await getActiveWhatsAppOnboardingSessionByUserId(user.id);
    return NextResponse.json({
      session: session
        ? {
            id: session.id,
            state: session.state,
            status: session.status,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error consultando onboarding:", error);
    return NextResponse.json({ error: "No se pudo obtener estado" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

