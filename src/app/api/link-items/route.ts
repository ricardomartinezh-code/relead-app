import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { createLinkItem } from "@/lib/db/linkItems";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { blockId, position, label, url, icon, imageUrl, metadata } = body;

    if (!blockId || position === undefined || !label) {
      return NextResponse.json(
        { error: "blockId, position y label son obligatorios" },
        { status: 400 }
      );
    }

    const rows = await sql/*sql*/`
      SELECT b.id, b.page_id, p.user_id
      FROM link_blocks b
      JOIN link_pages p ON p.id = b.page_id
      WHERE b.id = ${blockId}
    `;
    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
    }

    const item = await createLinkItem({
      blockId,
      position,
      label,
      url,
      icon,
      imageUrl,
      metadata,
    });

    await sql/*sql*/`
      UPDATE link_pages
      SET updated_at = now()
      WHERE id = ${rows[0].page_id}
    `;

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creando ítem:", error);
    return NextResponse.json(
      { error: "Error creando el ítem" },
      { status: 500 }
    );
  }
}
