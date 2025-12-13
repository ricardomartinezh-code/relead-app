import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listWhatsAppMessages } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const phoneNumberId = url.searchParams.get("phone_number_id") || "";
  const contact = url.searchParams.get("contact") || "";
  const limit = Number(url.searchParams.get("limit") || "50");

  if (!phoneNumberId || !contact) {
    return NextResponse.json(
      { error: "Faltan params: phone_number_id o contact" },
      { status: 400 }
    );
  }

  try {
    const messages = await listWhatsAppMessages({
      userId: user.id,
      phoneNumberId,
      contact,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(200, limit)) : 50,
    });
    return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error listando mensajes:", error);
    return NextResponse.json({ error: "Error listando mensajes" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

