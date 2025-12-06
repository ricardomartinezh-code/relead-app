import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { updateLinkPageDesign } from "@/lib/db/linkPages";
import { getLinkPageWithContent } from "@/lib/db/linkPageFull";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;
  const page = await getLinkPageWithContent(id);

  if (!page || page.userId !== user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { internalName, slug, publicTitle, publicDescription, design } = body;

    const rows = await sql/*sql*/`
      SELECT user_id FROM link_pages WHERE id = ${id}
    `;
    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    await sql/*sql*/`
      UPDATE link_pages
      SET
        internal_name = COALESCE(${internalName}, internal_name),
        slug = COALESCE(${slug}, slug),
        public_title = COALESCE(${publicTitle}, public_title),
        public_description = COALESCE(${publicDescription}, public_description),
        updated_at = now()
      WHERE id = ${id}
    `;

    let updated;
    if (design) {
      updated = await updateLinkPageDesign(id, design);
    } else {
      const updatedRows = await sql/*sql*/`
        SELECT * FROM link_pages WHERE id = ${id}
      `;
      const r = updatedRows[0];
      updated = {
        id: r.id,
        userId: r.user_id,
        internalName: r.internal_name,
        slug: r.slug,
        publicTitle: r.public_title,
        publicDescription: r.public_description,
        isDefault: r.is_default,
        isPublished: r.is_published,
        design: r.design,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error("Error actualizando página:", error);
    return NextResponse.json(
      { error: "Error actualizando la página" },
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
      DELETE FROM link_pages
      WHERE id = ${id}
      AND user_id = ${user.id}
      RETURNING id
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando página:", error);
    return NextResponse.json(
      { error: "Error eliminando la página" },
      { status: 500 }
    );
  }
}
