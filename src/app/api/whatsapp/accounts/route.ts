import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listWhatsAppAccountsByUserId } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const accounts = await listWhatsAppAccountsByUserId(user.id);
    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        phoneNumberId: a.phoneNumberId,
        wabaId: a.wabaId ?? null,
        businessId: a.businessId ?? null,
        label: a.label ?? null,
        expiresIn: a.expiresIn ?? null,
      })),
    });
  } catch (error) {
    console.error("Error listando cuentas de WhatsApp:", error);
    return NextResponse.json({ error: "Error listando cuentas" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
