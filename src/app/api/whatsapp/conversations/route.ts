import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listWhatsAppConversations } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const phoneNumberId = url.searchParams.get("phone_number_id") || "";
  if (!phoneNumberId) {
    return NextResponse.json({ error: "Falta phone_number_id" }, { status: 400 });
  }

  try {
    const conversations = await listWhatsAppConversations({ userId: user.id, phoneNumberId });
    return NextResponse.json({ conversations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error listando conversaciones:", error);
    return NextResponse.json({ error: "Error listando conversaciones" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

