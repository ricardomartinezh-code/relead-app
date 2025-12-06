import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { createLinkBlock } from "@/lib/db/linkBlocks";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pageId, blockType, title, subtitle, position, config } = body;

    if (!pageId || !blockType || position === undefined) {
      return NextResponse.json(
        { error: "pageId, blockType y position son obligatorios" },
        { status: 400 }
      );
    }

    const pageRows = await sql/*sql*/`
      SELECT user_id FROM link_pages WHERE id = ${pageId}
    `;
    if (!pageRows.length || pageRows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    }

    const block = await createLinkBlock({
      pageId,
      blockType,
      title,
      subtitle,
      position,
      config,
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error("Error creando bloque:", error);
    return NextResponse.json(
      { error: "Error creando el bloque" },
      { status: 500 }
    );
  }
}
