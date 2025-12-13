import { Pool, PoolClient } from "pg";
import { compare, hashSync } from "bcrypt";
import { randomUUID } from "crypto";
import { ensureDatabaseSchema } from "./db/migrate";
import { normalizeUsername } from "./username";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL no está definida. Configúrala antes de iniciar el servidor.");
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Tipos de datos
export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password?: string | null;
  profileId?: string;
  username?: string;
  clerkId?: string | null;
  created_at?: Date;
  is_active?: boolean;
};

export type ProfileRecord = {
  id: string;
  userId: string;
  title: string;
  bio?: string | null;
  avatarUrl?: string | null;
  slug: string;
  theme: "default" | "dark" | "pastel";
};

export type LinkRecord = {
  id: string;
  profileId: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

export type PageViewRecord = {
  id: string;
  profileId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
};

export type LinkClickRecord = {
  id: string;
  linkId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
};

export type LinkItemClickRecord = {
  id: string;
  itemId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
};

export type WhatsAppAccountRecord = {
  id: string;
  userId?: string | null;
  phoneNumberId: string;
  wabaId?: string;
  label?: string | null;
  accessToken: string;
  expiresIn?: number | null;
};

// Configurar pool de conexión
const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 10_000,
  statement_timeout: 5_000,
});

void ensureDatabaseSchema();

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

/**
 * Garantiza vistas de compatibilidad esperadas por clientes Prisma heredados.
 * Vercel registró errores buscando la tabla/VIEW "Profile", así que creamos
 * la vista si no existe.
 */
async function ensureCompatibilityViews() {
  if (!process.env.DATABASE_URL) return;

  try {
    await pool.query(`
      CREATE OR REPLACE VIEW "Profile" AS
      SELECT id, user_id, title, bio, avatar_url, slug, theme
      FROM profiles;
    `);
  } catch (error) {
    console.error("No se pudo crear la vista de compatibilidad 'Profile':", error);
  }
}

// Ejecutar la creación de vistas de compatibilidad al cargar el módulo
ensureCompatibilityViews();

/**
 * Obtener un usuario por email
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const result = await pool.query(
      "SELECT id, email, name, password, profile_id AS \"profileId\", username, clerk_id AS \"clerkId\" FROM users WHERE email = $1 AND is_active = true",
      [normalizedEmail]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo usuario por email:", error);
    throw error;
  }
}

/**
 * Obtener un usuario por nombre de usuario
 */
export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const result = await pool.query(
      "SELECT id, email, name, password, profile_id AS \"profileId\", username, clerk_id AS \"clerkId\" FROM users WHERE username = $1 AND is_active = true",
      [normalizedUsername]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo usuario por username:", error);
    throw error;
  }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(id: string): Promise<UserRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, email, name, password, profile_id AS \"profileId\", username, clerk_id AS \"clerkId\" FROM users WHERE id = $1 AND is_active = true",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo usuario por ID:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string): Promise<UserRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, email, name, password, profile_id AS \"profileId\", username, clerk_id AS \"clerkId\" FROM users WHERE clerk_id = $1 AND is_active = true",
      [clerkId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo usuario por clerk_id:", error);
    throw error;
  }
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(
  email: string,
  name: string,
  password: string,
  username?: string,
  slug?: string,
  clerkId?: string
): Promise<UserRecord & { slug: string; username: string }> {
  const normalizedEmail = normalizeEmail(email);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userId = randomUUID();
    const profileId = randomUUID();
    const slugToUse = slug || (await generateUniqueSlug(username || name));
    const hashedPassword = hashSync(password, 10);
    const usernameToUse = (username || email).trim().toLowerCase();

    // Crear usuario
    const userResult = await client.query(
      `INSERT INTO users (id, email, name, password, username, profile_id, clerk_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP)
       RETURNING id, email, name, profile_id AS "profileId", clerk_id AS "clerkId"`,
      [userId, normalizedEmail, name, hashedPassword, usernameToUse, profileId, clerkId ?? null]
    );

    // Crear perfil básico
    await client.query(
      `INSERT INTO profiles (id, user_id, title, slug, theme)
       VALUES ($1, $2, $3, $4, 'default')
       ON CONFLICT (id) DO NOTHING`,
      [profileId, userId, name, slugToUse]
    );

    await client.query("COMMIT");

    return {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      name: userResult.rows[0].name,
      profileId: userResult.rows[0].profileId,
      username: usernameToUse,
      slug: slugToUse,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando usuario:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verificar credenciales (email + contraseña)
 */
export async function verifyCredentials(email: string, password: string): Promise<UserRecord | null> {
  try {
    const user = await getUserByEmail(email);
    if (!user || !user.password) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error verificando credenciales:", error);
    throw error;
  }
}

export async function ensureUserForClerk({
  clerkUserId,
  email,
  name,
  username,
}: {
  clerkUserId: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
}): Promise<UserRecord> {
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const normalizedUsername =
    username && username.trim()
      ? normalizeUsername(username)
      : normalizedEmail
        ? normalizeUsername(normalizedEmail.split("@")[0] ?? "")
        : null;

  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN");

    let user: UserRecord | null = null;

    const byClerk = await client.query(
      `SELECT id, email, name, password, profile_id AS "profileId", username, clerk_id AS "clerkId"
       FROM users WHERE clerk_id = $1 AND is_active = true LIMIT 1`,
      [clerkUserId]
    );
    user = byClerk.rows[0] ?? null;

    if (!user && normalizedEmail) {
      const byEmail = await client.query(
        `SELECT id, email, name, password, profile_id AS "profileId", username, clerk_id AS "clerkId"
         FROM users WHERE email = $1 AND is_active = true LIMIT 1`,
        [normalizedEmail]
      );

      const existingUser = byEmail.rows[0] as UserRecord | undefined;
      if (existingUser) {
        user = existingUser;
        await client.query(
          `UPDATE users SET clerk_id = $1, password = NULL WHERE id = $2`,
          [clerkUserId, existingUser.id]
        );
        user.clerkId = clerkUserId;
        user.password = null;
      }
    }

    if (!user) {
      const userId = randomUUID();
      const profileId = randomUUID();
      const fallbackEmail = normalizedEmail ?? `${clerkUserId}@clerk.local`;
      const baseUsername =
        normalizedUsername || (normalizedEmail ? normalizedEmail.split("@")[0] : `user-${clerkUserId.slice(-6)}`);
      const uniqueSlug = await generateUniqueSlug(baseUsername || `user-${clerkUserId.slice(-6)}`);
      const usernameToUse = baseUsername || uniqueSlug;
      const displayName = name || normalizedEmail || usernameToUse;

      const created = await client.query(
        `INSERT INTO users (id, email, name, password, username, profile_id, clerk_id, is_active, created_at)
         VALUES ($1, $2, $3, NULL, $4, $5, $6, true, CURRENT_TIMESTAMP)
         RETURNING id, email, name, password, profile_id AS "profileId", username, clerk_id AS "clerkId"`,
        [userId, fallbackEmail, displayName, usernameToUse, profileId, clerkUserId]
      );

      await client.query(
        `INSERT INTO profiles (id, user_id, title, slug, theme)
         VALUES ($1, $2, $3, $4, 'default')
         ON CONFLICT (id) DO NOTHING`,
        [profileId, userId, displayName, uniqueSlug]
      );

      user = created.rows[0];
    }

    if (!user) {
  throw new Error("ensureUserForClerk: user is null after creation logic");
    }
    
    let profileId = user.profileId;
    if (!profileId) {
      profileId = randomUUID();
      const baseSlug =
        user.username ||
        normalizedUsername ||
        (normalizedEmail ? normalizedEmail.split("@")[0] : `user-${clerkUserId.slice(-6)}`);
      const slug = await generateUniqueSlug(baseSlug || `user-${clerkUserId.slice(-6)}`);

      await client.query(
        `INSERT INTO profiles (id, user_id, title, slug, theme)
         VALUES ($1, $2, $3, $4, 'default')
         ON CONFLICT (id) DO NOTHING`,
        [profileId, user.id, user.name ?? name ?? "Perfil", slug]
      );

      await client.query(`UPDATE users SET profile_id = $1 WHERE id = $2`, [profileId, user.id]);
      user.profileId = profileId;
    }

    await client.query("COMMIT");
    return { ...user, profileId, clerkId: user.clerkId ?? clerkUserId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error asegurando usuario Clerk:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtener perfil por ID
 */
export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, user_id AS \"userId\", title, bio, avatar_url AS \"avatarUrl\", slug, theme FROM profiles WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    throw error;
  }
}

/**
 * Obtener perfil por slug
 */
export async function getProfileBySlug(slug: string): Promise<ProfileRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, user_id AS \"userId\", title, bio, avatar_url AS \"avatarUrl\", slug, theme FROM profiles WHERE slug = $1",
      [slug]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo perfil por slug:", error);
    throw error;
  }
}

/**
 * Actualizar perfil
 */
export async function updateProfile(
  id: string,
  updates: Partial<ProfileRecord>
): Promise<ProfileRecord | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(updates.bio);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatarUrl);
    }
    if (updates.theme) {
      fields.push(`theme = $${paramCount++}`);
      values.push(updates.theme);
    }

    if (fields.length === 0) return getProfileById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE profiles SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, user_id AS "userId", title, bio, avatar_url AS "avatarUrl", slug, theme`,
      values
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    throw error;
  }
}

/**
 * Obtener enlaces de un perfil
 */
export async function getLinksByProfileId(profileId: string): Promise<LinkRecord[]> {
  try {
    const result = await pool.query(
      "SELECT id, profile_id AS \"profileId\", label, url, order_index AS \"order\", is_active AS \"isActive\" FROM links WHERE profile_id = $1 ORDER BY order_index ASC",
      [profileId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo enlaces:", error);
    throw error;
  }
}

/**
 * Crear un nuevo enlace
 */
export async function createLink(
  profileId: string,
  label: string,
  url: string
): Promise<LinkRecord> {
  try {
    const id = randomUUID();
    const order = await pool.query(
      "SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM links WHERE profile_id = $1",
      [profileId]
    );
    const nextOrder = order.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO links (id, profile_id, label, url, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, profile_id AS "profileId", label, url, order_index AS "order", is_active AS "isActive"`,
      [id, profileId, label, url, nextOrder]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creando enlace:", error);
    throw error;
  }
}

/**
 * Actualizar un enlace
 */
export async function updateLink(
  id: string,
  updates: Partial<LinkRecord>
): Promise<LinkRecord | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.label) {
      fields.push(`label = $${paramCount++}`);
      values.push(updates.label);
    }
    if (updates.url) {
      fields.push(`url = $${paramCount++}`);
      values.push(updates.url);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE links SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, profile_id AS "profileId", label, url, order_index AS "order", is_active AS "isActive"`,
      values
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error actualizando enlace:", error);
    throw error;
  }
}

/**
 * Eliminar un enlace
 */
export async function deleteLink(id: string): Promise<boolean> {
  try {
    const result = await pool.query("DELETE FROM links WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error("Error eliminando enlace:", error);
    throw error;
  }
}

/**
 * Registrar vista de página
 */
export async function recordPageView(
  profileId: string,
  referrer?: string | null,
  userAgent?: string | null,
  ip?: string | null
): Promise<PageViewRecord> {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO page_views (id, profile_id, referrer, user_agent, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, profile_id AS "profileId", referrer, user_agent AS "userAgent", ip, created_at AS "createdAt"`,
      [id, profileId, referrer || null, userAgent || null, ip || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error registrando vista de página:", error);
    throw error;
  }
}

/**
 * Registrar clic en enlace
 */
export async function recordLinkClick(
  linkId: string,
  referrer?: string | null,
  userAgent?: string | null,
  ip?: string | null
): Promise<LinkClickRecord> {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO link_clicks (id, link_id, referrer, user_agent, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, link_id AS "linkId", referrer, user_agent AS "userAgent", ip, created_at AS "createdAt"`,
      [id, linkId, referrer || null, userAgent || null, ip || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error registrando clic en enlace:", error);
    throw error;
  }
}

/**
 * Registrar clic en ítem (páginas personalizadas)
 */
export async function recordLinkItemClick(
  itemId: string,
  referrer?: string | null,
  userAgent?: string | null,
  ip?: string | null
): Promise<LinkItemClickRecord> {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO link_item_clicks (id, item_id, referrer, user_agent, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, item_id AS "itemId", referrer, user_agent AS "userAgent", ip, created_at AS "createdAt"`,
      [id, itemId, referrer || null, userAgent || null, ip || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error registrando clic de ítem:", error);
    throw error;
  }
}

/**
 * Obtener cuenta de WhatsApp por ID de número telefónico
 */
export async function findWhatsAppAccountByPhoneNumberId(
  phoneNumberId: string
): Promise<WhatsAppAccountRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, user_id AS \"userId\", phone_number_id AS \"phoneNumberId\", waba_id AS \"wabaId\", label, access_token AS \"accessToken\", expires_in AS \"expiresIn\" FROM whats_app_accounts WHERE phone_number_id = $1 LIMIT 1",
      [phoneNumberId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo cuenta de WhatsApp:", error);
    throw error;
  }
}

export async function findWhatsAppAccountByPhoneNumberIdForUser(
  userId: string,
  phoneNumberId: string
): Promise<WhatsAppAccountRecord | null> {
  try {
    const result = await pool.query(
      "SELECT id, user_id AS \"userId\", phone_number_id AS \"phoneNumberId\", waba_id AS \"wabaId\", label, access_token AS \"accessToken\", expires_in AS \"expiresIn\" FROM whats_app_accounts WHERE user_id = $1 AND phone_number_id = $2 LIMIT 1",
      [userId, phoneNumberId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error obteniendo cuenta de WhatsApp (por usuario):", error);
    throw error;
  }
}

export async function listWhatsAppAccountsByUserId(
  userId: string
): Promise<WhatsAppAccountRecord[]> {
  try {
    const result = await pool.query(
      "SELECT id, user_id AS \"userId\", phone_number_id AS \"phoneNumberId\", waba_id AS \"wabaId\", label, access_token AS \"accessToken\", expires_in AS \"expiresIn\" FROM whats_app_accounts WHERE user_id = $1 ORDER BY phone_number_id ASC",
      [userId]
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error listando cuentas de WhatsApp:", error);
    throw error;
  }
}

/**
 * Crear o actualizar una cuenta de WhatsApp
 */
export async function upsertWhatsAppAccount(
  phoneNumberId: string,
  wabaId: string,
  accessToken: string,
  label?: string | null,
  expiresIn?: number | null
): Promise<WhatsAppAccountRecord> {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO whats_app_accounts (id, phone_number_id, waba_id, label, access_token, expires_in)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (phone_number_id) DO UPDATE
       SET access_token = $5, expires_in = $6, waba_id = $3, label = $4
       RETURNING id, user_id AS "userId", phone_number_id AS "phoneNumberId", waba_id AS "wabaId", label, access_token AS "accessToken", expires_in AS "expiresIn"`,
      [id, phoneNumberId, wabaId, label || null, accessToken, expiresIn || null]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error actualizando cuenta de WhatsApp:", error);
    throw error;
  }
}

export async function upsertWhatsAppAccountForUser(
  userId: string,
  phoneNumberId: string,
  wabaId: string,
  accessToken: string,
  label?: string | null,
  expiresIn?: number | null
): Promise<WhatsAppAccountRecord> {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO whats_app_accounts (id, user_id, phone_number_id, waba_id, label, access_token, expires_in)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (phone_number_id) DO UPDATE
       SET user_id = $2, access_token = $6, expires_in = $7, waba_id = $4, label = $5
       WHERE whats_app_accounts.user_id IS NULL OR whats_app_accounts.user_id = $2
       RETURNING id, user_id AS "userId", phone_number_id AS "phoneNumberId", waba_id AS "wabaId", label, access_token AS "accessToken", expires_in AS "expiresIn"`,
      [id, userId, phoneNumberId, wabaId, label || null, accessToken, expiresIn || null]
    );
    if (!result.rows[0]) {
      throw new Error("La cuenta ya está asociada a otro usuario.");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error actualizando cuenta de WhatsApp (por usuario):", error);
    throw error;
  }
}

export type WhatsAppMessageDirection = "inbound" | "outbound";

export type WhatsAppMessageRecord = {
  id: string;
  userId: string;
  phoneNumberId: string;
  contact: string;
  direction: WhatsAppMessageDirection;
  messageType: string;
  textBody?: string | null;
  templateName?: string | null;
  templateLanguage?: string | null;
  metaMessageId?: string | null;
  raw: any;
  createdAt: Date;
};

export async function recordWhatsAppMessage(params: {
  userId: string;
  phoneNumberId: string;
  contact: string;
  direction: WhatsAppMessageDirection;
  messageType?: string;
  textBody?: string | null;
  templateName?: string | null;
  templateLanguage?: string | null;
  metaMessageId?: string | null;
  raw?: any;
}): Promise<WhatsAppMessageRecord> {
  const {
    userId,
    phoneNumberId,
    contact,
    direction,
    messageType = "text",
    textBody = null,
    templateName = null,
    templateLanguage = null,
    metaMessageId = null,
    raw = {},
  } = params;

  const id = randomUUID();
  const result = await pool.query(
    `INSERT INTO whatsapp_messages
     (id, user_id, phone_number_id, contact, direction, message_type, text_body, template_name, template_language, meta_message_id, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING
       id,
       user_id AS "userId",
       phone_number_id AS "phoneNumberId",
       contact,
       direction,
       message_type AS "messageType",
       text_body AS "textBody",
       template_name AS "templateName",
       template_language AS "templateLanguage",
       meta_message_id AS "metaMessageId",
       raw,
       created_at AS "createdAt"`,
    [
      id,
      userId,
      phoneNumberId,
      contact,
      direction,
      messageType,
      textBody,
      templateName,
      templateLanguage,
      metaMessageId,
      raw,
    ]
  );
  return result.rows[0];
}

export async function listWhatsAppConversations(params: {
  userId: string;
  phoneNumberId: string;
}): Promise<Array<{ contact: string; lastMessageAt: Date; lastText: string | null }>> {
  const { userId, phoneNumberId } = params;
  const result = await pool.query(
    `
    SELECT
      contact,
      MAX(created_at) AS "lastMessageAt",
      (ARRAY_AGG(text_body ORDER BY created_at DESC))[1] AS "lastText"
    FROM whatsapp_messages
    WHERE user_id = $1 AND phone_number_id = $2
    GROUP BY contact
    ORDER BY MAX(created_at) DESC
    LIMIT 50
    `,
    [userId, phoneNumberId]
  );
  return result.rows || [];
}

export async function listWhatsAppMessages(params: {
  userId: string;
  phoneNumberId: string;
  contact: string;
  limit?: number;
}): Promise<WhatsAppMessageRecord[]> {
  const { userId, phoneNumberId, contact, limit = 50 } = params;
  const result = await pool.query(
    `
    SELECT
      id,
      user_id AS "userId",
      phone_number_id AS "phoneNumberId",
      contact,
      direction,
      message_type AS "messageType",
      text_body AS "textBody",
      template_name AS "templateName",
      template_language AS "templateLanguage",
      meta_message_id AS "metaMessageId",
      raw,
      created_at AS "createdAt"
    FROM whatsapp_messages
    WHERE user_id = $1 AND phone_number_id = $2 AND contact = $3
    ORDER BY created_at DESC
    LIMIT $4
    `,
    [userId, phoneNumberId, contact, limit]
  );
  return (result.rows || []).reverse();
}

/**
 * Generar un slug único basado en un nombre base
 */
export async function generateUniqueSlug(base: string): Promise<string> {
  try {
    const slug = base.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    // Verificar si el slug ya existe
    const result = await pool.query(
      "SELECT id FROM profiles WHERE slug = $1 LIMIT 1",
      [slug]
    );

    if (result.rows.length === 0) {
      return slug;
    }

    // Si existe, agregar números hasta encontrar uno único
    let counter = 1;
    while (true) {
      const newSlug = `${slug}-${counter}`;
      const checkResult = await pool.query(
        "SELECT id FROM profiles WHERE slug = $1 LIMIT 1",
        [newSlug]
      );
      if (checkResult.rows.length === 0) {
        return newSlug;
      }
      counter++;
    }
  } catch (error) {
    console.error("Error generando slug único:", error);
    throw error;
  }
}

/**
 * Cerrar conexión del pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
