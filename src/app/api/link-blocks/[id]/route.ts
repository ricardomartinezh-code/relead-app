import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { updateBlockPosition } from "@/lib/db/linkBlocks";

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
    const { title, subtitle, position, isVisible, config } = body;

    const rows = await sql/*sql*/`
      SELECT b.id, p.user_id
      FROM link_blocks b
      JOIN link_pages p ON p.id = b.page_id
      WHERE b.id = ${id}
    `;

    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
    }

    await sql/*sql*/`
      UPDATE link_blocks
      SET
        title = COALESCE(${title}, title),
        subtitle = COALESCE(${subtitle}, subtitle),
        position = COALESCE(${position}, position),
        is_visible = COALESCE(${isVisible}, is_visible),
        config = COALESCE(${config}::jsonb, config),
        updated_at = now()
      WHERE id = ${id}
    `;

    const targetPosition = position ?? rows[0].position;
    const block = await updateBlockPosition(id, targetPosition);

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Error actualizando bloque:", error);
    return NextResponse.json(
      { error: "Error actualizando el bloque" },
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
      DELETE FROM link_blocks
      WHERE id = ${id}
      AND page_id IN (
        SELECT id FROM link_pages WHERE user_id = ${user.id}
      )
      RETURNING id
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando bloque:", error);
    return NextResponse.json(
      { error: "Error eliminando el bloque" },
      { status: 500 }
    );
  }
}
