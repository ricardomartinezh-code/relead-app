import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";

interface RouteParams {
  params: { id: string };
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { position, label, url, icon, imageUrl, isActive, metadata } = body;

    const rows = await sql/*sql*/`
      SELECT i.id, b.page_id, p.user_id
      FROM link_items i
      JOIN link_blocks b ON b.id = i.block_id
      JOIN link_pages p ON p.id = b.page_id
      WHERE i.id = ${id}
    `;
    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
    }

    await sql/*sql*/`
      UPDATE link_items
      SET
        position = COALESCE(${position}, position),
        label = COALESCE(${label}, label),
        url = COALESCE(${url}, url),
        icon = COALESCE(${icon}, icon),
        image_url = COALESCE(${imageUrl}, image_url),
        is_active = COALESCE(${isActive}, is_active),
        metadata = COALESCE(${metadata}::jsonb, metadata),
        updated_at = now()
      WHERE id = ${id}
    `;

    await sql/*sql*/`
      UPDATE link_pages
      SET updated_at = now()
      WHERE id = ${rows[0].page_id}
    `;

    const updatedRows = await sql/*sql*/`
      SELECT * FROM link_items WHERE id = ${id}
    `;

    return NextResponse.json({ item: updatedRows[0] });
  } catch (error) {
    console.error("Error actualizando ítem:", error);
    return NextResponse.json(
      { error: "Error actualizando el ítem" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const rows = await sql/*sql*/`
      DELETE FROM link_items
      WHERE id = ${id}
      AND block_id IN (
        SELECT b.id
        FROM link_blocks b
        JOIN link_pages p ON p.id = b.page_id
        WHERE p.user_id = ${user.id}
      )
      RETURNING id, block_id
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
    }

    const pageRows = await sql/*sql*/`
      SELECT page_id FROM link_blocks WHERE id = ${rows[0].block_id} LIMIT 1
    `;
    if (pageRows.length) {
      await sql/*sql*/`
        UPDATE link_pages SET updated_at = now() WHERE id = ${pageRows[0].page_id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando ítem:", error);
    return NextResponse.json(
      { error: "Error eliminando el ítem" },
      { status: 500 }
    );
  }
}
