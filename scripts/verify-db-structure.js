#!/usr/bin/env node

/**
 * Valida que la estructura de la base de datos en Neon cumpla con el esquema esperado.
 * - Requiere DATABASE_URL (se carga desde .env si está disponible).
 * - Revisa existencia de tablas y columnas clave.
 * - Falla con exit code 1 si falta algo crítico.
 */

const { Pool } = require("pg");
try {
  require("dotenv").config();
} catch {
  // opcional si dotenv no está instalado
}

const requiredEnv = ["DATABASE_URL"];
const expectedSchema = {
  users: ["id", "email", "username", "name", "password", "profile_id", "is_active", "created_at"],
  profiles: [
    "id",
    "user_id",
    "title",
    "bio",
    "avatar_url",
    "slug",
    "theme",
    "username",
    "social_links",
    "settings",
  ],
  links: ["id", "profile_id", "label", "url", "order_index", "is_active"],
  page_views: ["id", "profile_id", "referrer", "user_agent", "ip", "created_at"],
  link_clicks: ["id", "link_id", "referrer", "user_agent", "ip", "created_at"],
  link_pages: [
    "id",
    "user_id",
    "internal_name",
    "slug",
    "public_title",
    "public_description",
    "is_default",
    "is_published",
    "design",
    "created_at",
    "updated_at",
  ],
  link_blocks: [
    "id",
    "page_id",
    "block_type",
    "title",
    "subtitle",
    "position",
    "is_visible",
    "config",
    "created_at",
    "updated_at",
  ],
  link_items: [
    "id",
    "block_id",
    "position",
    "label",
    "url",
    "icon",
    "image_url",
    "is_active",
    "metadata",
    "created_at",
    "updated_at",
  ],
  whats_app_accounts: ["id", "phone_number_id", "waba_id", "label", "access_token", "expires_in"],
  Profile: ["id", "user_id", "title", "bio", "avatar_url", "slug", "theme"], // vista de compatibilidad
};

function assertEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("❌ Faltan variables de entorno:", missing.join(", "));
    process.exit(1);
  }
}

async function fetchColumns(pool, tableName) {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position;`,
    [tableName]
  );
  return result.rows.map((row) => row.column_name);
}

async function main() {
  assertEnv();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    statement_timeout: 10_000,
  });

  const missing = [];

  try {
    const client = await pool.connect();
    console.log("🔍 Verificando estructura de tablas en la base de datos...");

    for (const [table, expectedCols] of Object.entries(expectedSchema)) {
      const actualCols = await fetchColumns(client, table);

      if (actualCols.length === 0) {
        missing.push({ table, reason: "Tabla o vista no existe" });
        continue;
      }

      const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
      if (missingCols.length > 0) {
        missing.push({ table, reason: `Faltan columnas: ${missingCols.join(", ")}` });
      } else {
        console.log(`✅ ${table}: OK (${actualCols.length} columnas)`);
      }
    }

    if (missing.length > 0) {
      console.error("\n❌ Estructura incompleta:");
      missing.forEach((item) => console.error(` - ${item.table}: ${item.reason}`));
      process.exit(1);
    }

    console.log("\n🎉 Estructura verificada: todas las tablas/vistas clave están OK.");
  } catch (err) {
    console.error("❌ Error verificando la estructura:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
