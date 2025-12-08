import { sql } from "./client";
import { LinkPage } from "./linkModels";

function mapLinkPage(row: any): LinkPage {
  return {
    id: row.id,
    userId: row.user_id,
    internalName: row.internal_name,
    slug: row.slug,
    publicTitle: row.public_title,
    publicDescription: row.public_description,
    isDefault: row.is_default,
    isPublished: row.is_published,
    design: row.design,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserLinkPages(userId: string): Promise<LinkPage[]> {
  const rows = await sql/*sql*/`
    SELECT *
    FROM link_pages
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;
  return rows.map(mapLinkPage);
}

export async function createLinkPage(input: {
  userId: string;
  internalName: string;
  slug: string;
  publicTitle?: string | null;
  publicDescription?: string | null;
  isDefault?: boolean;
}): Promise<LinkPage> {
  const {
    userId,
    internalName,
    slug,
    publicTitle = null,
    publicDescription = null,
    isDefault = false,
  } = input;

  const rows = await sql/*sql*/`
    INSERT INTO link_pages (
      user_id,
      internal_name,
      slug,
      public_title,
      public_description,
      is_default
    )
    VALUES (
      ${userId},
      ${internalName},
      ${slug},
      ${publicTitle},
      ${publicDescription},
      ${isDefault}
    )
    RETURNING *
  `;

  return mapLinkPage(rows[0]);
}

export async function updateLinkPageDesign(pageId: string, design: any): Promise<LinkPage> {
  const rows = await sql/*sql*/`
    UPDATE link_pages
    SET design = ${design}::jsonb,
        updated_at = now()
    WHERE id = ${pageId}
    RETURNING *
  `;
  if (rows.length === 0) {
    throw new Error("Página no encontrada");
  }
  return mapLinkPage(rows[0]);
}
