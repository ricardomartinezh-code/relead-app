import { sql } from "./client";
import { LinkBlock } from "./linkModels";

function mapLinkBlock(row: any): LinkBlock {
  return {
    id: row.id,
    pageId: row.page_id,
    blockType: row.block_type,
    title: row.title,
    subtitle: row.subtitle,
    position: row.position,
    isVisible: row.is_visible,
    config: row.config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBlocksForPage(pageId: string): Promise<LinkBlock[]> {
  const rows = await sql/*sql*/`
    SELECT *
    FROM link_blocks
    WHERE page_id = ${pageId}
    ORDER BY position ASC
  `;
  return rows.map(mapLinkBlock);
}

export async function createLinkBlock(input: {
  pageId: string;
  blockType: string;
  title?: string | null;
  subtitle?: string | null;
  position: number;
  config?: any;
}): Promise<LinkBlock> {
  const {
    pageId,
    blockType,
    title = null,
    subtitle = null,
    position,
    config = {},
  } = input;

  const rows = await sql/*sql*/`
    INSERT INTO link_blocks (
      page_id,
      block_type,
      title,
      subtitle,
      position,
      config
    )
    VALUES (
      ${pageId},
      ${blockType},
      ${title},
      ${subtitle},
      ${position},
      ${config}::jsonb
    )
    RETURNING *
  `;
  return mapLinkBlock(rows[0]);
}

export async function updateBlockPosition(blockId: string, position: number): Promise<LinkBlock> {
  const rows = await sql/*sql*/`
    UPDATE link_blocks
    SET position = ${position},
        updated_at = now()
    WHERE id = ${blockId}
    RETURNING *
  `;
  if (rows.length === 0) {
    throw new Error("Bloque no encontrado");
  }
  return mapLinkBlock(rows[0]);
}
