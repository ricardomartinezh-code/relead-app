import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { updateLinkPageDesign } from "@/lib/db/linkPages";
import { getLinkPageWithContent } from "@/lib/db/linkPageFull";

function normalizeSlug(raw: string) {
  return (
    raw
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || null
  );
}

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
    const { internalName, slug, publicTitle, publicDescription, design, isDefault, isPublished } = body;

    const normalizedSlug = slug ? normalizeSlug(slug) : null;
    const normalizedIsPublished =
      typeof isPublished === "boolean" ? isPublished : null;

    const rows = await sql/*sql*/`
      SELECT user_id FROM link_pages WHERE id = ${id}
    `;
    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    if (normalizedSlug) {
      const duplicate = await sql/*sql*/`
        SELECT 1 FROM link_pages WHERE user_id = ${user.id} AND slug = ${normalizedSlug} AND id <> ${id} LIMIT 1
      `;
      if (duplicate.length) {
        return NextResponse.json(
          { error: "Ya existe una página con ese slug para este usuario" },
          { status: 409 }
        );
      }
    }

    await sql/*sql*/`
      UPDATE link_pages
      SET
        internal_name = COALESCE(${internalName}, internal_name),
        slug = COALESCE(${normalizedSlug}, slug),
        public_title = COALESCE(${publicTitle}, public_title),
        public_description = COALESCE(${publicDescription}, public_description),
        is_published = COALESCE(${normalizedIsPublished}, is_published),
        updated_at = now()
      WHERE id = ${id}
    `;

    if (design) {
      await updateLinkPageDesign(id, design);
    }

    if (isDefault === true) {
      await sql/*sql*/`
        UPDATE link_pages SET is_default = false WHERE user_id = ${user.id}
      `;
      await sql/*sql*/`
        UPDATE link_pages SET is_default = true, updated_at = now() WHERE id = ${id}
      `;
    }

    const finalRows = await sql/*sql*/`
      SELECT * FROM link_pages WHERE id = ${id}
    `;
    const finalRow = finalRows[0];
    const finalPage = {
      id: finalRow.id,
      userId: finalRow.user_id,
      internalName: finalRow.internal_name,
      slug: finalRow.slug,
      publicTitle: finalRow.public_title,
      publicDescription: finalRow.public_description,
      isDefault: finalRow.is_default,
      isPublished: finalRow.is_published,
      design: finalRow.design,
      createdAt: finalRow.created_at,
      updatedAt: finalRow.updated_at,
    };

    return NextResponse.json({ page: finalPage });
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
