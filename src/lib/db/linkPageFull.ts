import { sql } from "./client";
import { LinkPage, LinkBlock, LinkItem } from "./linkModels";

export interface LinkPageWithContent extends LinkPage {
  blocks: (LinkBlock & { items: LinkItem[] })[];
}

export async function getLinkPageWithContent(pageId: string): Promise<LinkPageWithContent | null> {
  const rows = await sql/*sql*/`
    SELECT
      p.*,
      b.id AS block_id,
      b.block_type,
      b.title AS block_title,
      b.subtitle AS block_subtitle,
      b.position AS block_position,
      b.is_visible AS block_is_visible,
      b.config AS block_config,
      b.created_at AS block_created_at,
      b.updated_at AS block_updated_at,
      i.id AS item_id,
      i.position AS item_position,
      i.label AS item_label,
      i.url AS item_url,
      i.icon AS item_icon,
      i.image_url AS item_image_url,
      i.is_active AS item_is_active,
      i.metadata AS item_metadata,
      i.created_at AS item_created_at,
      i.updated_at AS item_updated_at
    FROM link_pages p
    LEFT JOIN link_blocks b ON b.page_id = p.id
    LEFT JOIN link_items i ON i.block_id = b.id
    WHERE p.id = ${pageId}
    ORDER BY b.position ASC, i.position ASC
  `;

  if (rows.length === 0) return null;

  const first = rows[0];

  const page: LinkPageWithContent = {
    id: first.id,
    userId: first.user_id,
    internalName: first.internal_name,
    slug: first.slug,
    publicTitle: first.public_title,
    publicDescription: first.public_description,
    isDefault: first.is_default,
    isPublished: first.is_published,
    design: first.design,
    createdAt: first.created_at,
    updatedAt: first.updated_at,
    blocks: [],
  };

  const blocksMap = new Map<string, LinkPageWithContent["blocks"][number]>();

  for (const row of rows) {
    if (!row.block_id) continue;

    let block = blocksMap.get(row.block_id);
    if (!block) {
      block = {
        id: row.block_id,
        pageId: row.id,
        blockType: row.block_type,
        title: row.block_title,
        subtitle: row.block_subtitle,
        position: row.block_position,
        isVisible: row.block_is_visible,
        config: row.block_config,
        createdAt: row.block_created_at,
        updatedAt: row.block_updated_at,
        items: [],
      };
      blocksMap.set(row.block_id, block);
      page.blocks.push(block);
    }

    if (row.item_id) {
      block.items.push({
        id: row.item_id,
        blockId: row.block_id,
        position: row.item_position,
        label: row.item_label,
        url: row.item_url,
        icon: row.item_icon,
        imageUrl: row.item_image_url,
        isActive: row.item_is_active,
        metadata: row.item_metadata,
        createdAt: row.item_created_at,
        updatedAt: row.item_updated_at,
      });
    }
  }

  return page;
}
