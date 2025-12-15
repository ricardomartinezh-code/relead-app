import { sql } from "./client";
import { LinkBlock, LinkItem, LinkPage } from "./linkModels";

export interface PublicLinkPage extends LinkPage {
  profile: {
    username: string | null;
    name?: string | null;
    bio: string | null;
    avatarUrl: string | null;
    socialLinks: any;
    settings?: any;
  };
  blocks: (LinkBlock & { items: LinkItem[] })[];
}

export type PublicLinkPageNavItem = {
  slug: string;
  label: string;
  isDefault: boolean;
};

export async function getPublicLinkPageNavByUserId(
  userId: string
): Promise<PublicLinkPageNavItem[]> {
  if (!userId) return [];

  const rows = await sql/*sql*/`
    SELECT
      slug,
      COALESCE(public_title, internal_name) AS label,
      is_default
    FROM link_pages
    WHERE user_id = ${userId}
      AND is_published = true
    ORDER BY is_default DESC, updated_at DESC
  `;

  return rows.map((r: any) => ({
    slug: String(r.slug),
    label: String(r.label || r.slug),
    isDefault: Boolean(r.is_default),
  }));
}

export async function getPublicLinkPageByUsernameAndSlug(
  username: string,
  slug: string
): Promise<PublicLinkPage | null> {
  const normalizedUsername = username?.trim();
  const normalizedSlug = slug?.trim();

  if (!normalizedUsername || !normalizedSlug) return null;

  const rows = await sql/*sql*/`
    SELECT
      lp.*,
      pr.username AS profile_username,
      pr.bio AS profile_bio,
      pr.avatar_url AS profile_avatar_url,
      pr.social_links AS profile_social_links,
      pr.settings AS profile_settings,
      u.name AS user_name,
      lb.id AS block_id,
      lb.block_type,
      lb.title AS block_title,
      lb.subtitle AS block_subtitle,
      lb.position AS block_position,
      lb.is_visible AS block_is_visible,
      lb.config AS block_config,
      lb.created_at AS block_created_at,
      lb.updated_at AS block_updated_at,
      li.id AS item_id,
      li.position AS item_position,
      li.label AS item_label,
      li.url AS item_url,
      li.icon AS item_icon,
      li.image_url AS item_image_url,
      li.is_active AS item_is_active,
      li.metadata AS item_metadata,
      li.created_at AS item_created_at,
      li.updated_at AS item_updated_at
    FROM profiles pr
    JOIN link_pages lp ON lp.user_id = pr.user_id
    LEFT JOIN users u ON u.id = pr.user_id
    LEFT JOIN link_blocks lb ON lb.page_id = lp.id
    LEFT JOIN link_items li ON li.block_id = lb.id
    WHERE pr.username = ${normalizedUsername}
      AND lp.slug = ${normalizedSlug}
      AND lp.is_published = true
    ORDER BY lb.position ASC, li.position ASC
  `;

  if (rows.length === 0) return null;

  const first = rows[0];

  const page: PublicLinkPage = {
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
    profile: {
      username: first.profile_username ?? null,
      name: first.user_name ?? null,
      bio: first.profile_bio ?? null,
      avatarUrl: first.profile_avatar_url ?? null,
      socialLinks: first.profile_social_links ?? [],
      settings: first.profile_settings ?? {},
    },
    blocks: [],
  };

  const blocksMap = new Map<string, PublicLinkPage["blocks"][number]>();

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

export async function getPublicLinkPageByProfileSlugAndPageSlug(
  profileSlug: string,
  pageSlug: string
): Promise<PublicLinkPage | null> {
  const normalizedProfileSlug = profileSlug?.trim();
  const normalizedPageSlug = pageSlug?.trim();
  if (!normalizedProfileSlug || !normalizedPageSlug) return null;

  const rows = await sql/*sql*/`
    SELECT
      lp.*,
      pr.username AS profile_username,
      pr.bio AS profile_bio,
      pr.avatar_url AS profile_avatar_url,
      pr.social_links AS profile_social_links,
      pr.settings AS profile_settings,
      u.name AS user_name,
      lb.id AS block_id,
      lb.block_type,
      lb.title AS block_title,
      lb.subtitle AS block_subtitle,
      lb.position AS block_position,
      lb.is_visible AS block_is_visible,
      lb.config AS block_config,
      lb.created_at AS block_created_at,
      lb.updated_at AS block_updated_at,
      li.id AS item_id,
      li.position AS item_position,
      li.label AS item_label,
      li.url AS item_url,
      li.icon AS item_icon,
      li.image_url AS item_image_url,
      li.is_active AS item_is_active,
      li.metadata AS item_metadata,
      li.created_at AS item_created_at,
      li.updated_at AS item_updated_at
    FROM profiles pr
    JOIN link_pages lp ON lp.user_id = pr.user_id
    LEFT JOIN users u ON u.id = pr.user_id
    LEFT JOIN link_blocks lb ON lb.page_id = lp.id
    LEFT JOIN link_items li ON li.block_id = lb.id
    WHERE pr.slug = ${normalizedProfileSlug}
      AND lp.slug = ${normalizedPageSlug}
      AND lp.is_published = true
    ORDER BY lb.position ASC, li.position ASC
  `;

  if (rows.length === 0) return null;

  const first = rows[0];

  const page: PublicLinkPage = {
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
    profile: {
      username: first.profile_username ?? null,
      name: first.user_name ?? null,
      bio: first.profile_bio ?? null,
      avatarUrl: first.profile_avatar_url ?? null,
      socialLinks: first.profile_social_links ?? [],
      settings: first.profile_settings ?? {},
    },
    blocks: [],
  };

  const blocksMap = new Map<string, PublicLinkPage["blocks"][number]>();

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

  page.blocks.sort((a, b) => a.position - b.position);
  page.blocks.forEach((block) => block.items.sort((a, b) => a.position - b.position));

  return page;
}

export async function getDefaultPublicLinkPageByUserId(
  userId: string
): Promise<PublicLinkPage | null> {
  if (!userId) return null;

  const rows = await sql/*sql*/`
    SELECT
      lp.*,
      pr.username AS profile_username,
      pr.bio AS profile_bio,
      pr.avatar_url AS profile_avatar_url,
      pr.social_links AS profile_social_links,
      pr.settings AS profile_settings,
      u.name AS user_name,
      lb.id AS block_id,
      lb.block_type,
      lb.title AS block_title,
      lb.subtitle AS block_subtitle,
      lb.position AS block_position,
      lb.is_visible AS block_is_visible,
      lb.config AS block_config,
      lb.created_at AS block_created_at,
      lb.updated_at AS block_updated_at,
      li.id AS item_id,
      li.position AS item_position,
      li.label AS item_label,
      li.url AS item_url,
      li.icon AS item_icon,
      li.image_url AS item_image_url,
      li.is_active AS item_is_active,
      li.metadata AS item_metadata,
      li.created_at AS item_created_at,
      li.updated_at AS item_updated_at
    FROM link_pages lp
    JOIN profiles pr ON pr.user_id = lp.user_id
    LEFT JOIN users u ON u.id = pr.user_id
    LEFT JOIN link_blocks lb ON lb.page_id = lp.id
    LEFT JOIN link_items li ON li.block_id = lb.id
    WHERE lp.user_id = ${userId}
      AND lp.is_published = true
    ORDER BY lp.is_default DESC, lp.updated_at DESC, lb.position ASC, li.position ASC
  `;

  if (rows.length === 0) return null;

  const first = rows[0];

  const page: PublicLinkPage = {
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
    profile: {
      username: first.profile_username ?? null,
      name: first.user_name ?? null,
      bio: first.profile_bio ?? null,
      avatarUrl: first.profile_avatar_url ?? null,
      socialLinks: first.profile_social_links ?? [],
      settings: first.profile_settings ?? {},
    },
    blocks: [],
  };

  const blocksMap = new Map<string, PublicLinkPage["blocks"][number]>();

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

  // Ordenar bloques y items por posición por seguridad
  page.blocks.sort((a, b) => a.position - b.position);
  page.blocks.forEach((block) => block.items.sort((a, b) => a.position - b.position));

  return page;
}
