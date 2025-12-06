import { sql } from "./client";
import { LinkItem } from "./linkModels";

function mapLinkItem(row: any): LinkItem {
  return {
    id: row.id,
    blockId: row.block_id,
    position: row.position,
    label: row.label,
    url: row.url,
    icon: row.icon,
    imageUrl: row.image_url,
    isActive: row.is_active,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getItemsForBlock(blockId: string): Promise<LinkItem[]> {
  const rows = await sql/*sql*/`
    SELECT *
    FROM link_items
    WHERE block_id = ${blockId}
    ORDER BY position ASC
  `;
  return rows.map(mapLinkItem);
}

export async function createLinkItem(input: {
  blockId: string;
  position: number;
  label: string;
  url?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  metadata?: any;
}): Promise<LinkItem> {
  const {
    blockId,
    position,
    label,
    url = null,
    icon = null,
    imageUrl = null,
    metadata = {},
  } = input;

  const rows = await sql/*sql*/`
    INSERT INTO link_items (
      block_id,
      position,
      label,
      url,
      icon,
      image_url,
      metadata
    )
    VALUES (
      ${blockId},
      ${position},
      ${label},
      ${url},
      ${icon},
      ${imageUrl},
      ${metadata}::jsonb
    )
    RETURNING *
  `;
  return mapLinkItem(rows[0]);
}
