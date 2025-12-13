import { recordLinkItemClick } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, referrer, userAgent, ip } = body ?? {};

    if (!itemId) {
      return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
    }

    const click = await recordLinkItemClick(itemId, referrer, userAgent, ip);
    return NextResponse.json(click, { status: 201 });
  } catch (error) {
    console.error("Error registrando clic de ítem:", error);
    return NextResponse.json(
      { error: "Error al registrar clic de ítem" },
      { status: 500 }
    );
  }
}

