import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";
import { getUserLinkPages, createLinkPage } from "@/lib/db/linkPages";

function normalizeSlug(raw: string) {
  return (
    raw
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "pagina"
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pages = await getUserLinkPages(user.id);
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { internalName, slug, publicTitle, publicDescription, isDefault } = body;

    if (!internalName || !slug) {
      return NextResponse.json(
        { error: "internalName y slug son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedSlug = normalizeSlug(slug);

    const existingSlug = await sql/*sql*/`
      SELECT 1 FROM link_pages WHERE user_id = ${user.id} AND slug = ${normalizedSlug} LIMIT 1
    `;

    if (existingSlug.length) {
      return NextResponse.json(
        { error: "Ya existe una página con ese slug para este usuario" },
        { status: 409 }
      );
    }

    const countRows = await sql/*sql*/`
      SELECT COUNT(*)::int AS count FROM link_pages WHERE user_id = ${user.id}
    `;
    const pageCount = Number(countRows[0]?.count || 0);
    const finalIsDefault = pageCount === 0 ? true : Boolean(isDefault);

    const page = await createLinkPage({
      userId: user.id,
      internalName,
      slug: normalizedSlug,
      publicTitle,
      publicDescription,
      isDefault: finalIsDefault,
    });

    if (finalIsDefault) {
      await sql/*sql*/`
        UPDATE link_pages
        SET is_default = false
        WHERE user_id = ${user.id} AND id <> ${page.id}
      `;
    }

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Error creando link_page:", error);
    return NextResponse.json(
      { error: "Error creando la página" },
      { status: 500 }
    );
  }
}
