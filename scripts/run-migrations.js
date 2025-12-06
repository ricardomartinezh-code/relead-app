#!/usr/bin/env node

/**
 * Ejecuta el archivo db/schema.sql contra la base de datos apuntada por
 * DATABASE_URL. Es idempotente gracias a los CREATE IF NOT EXISTS en el schema.
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está definida; abortando migraciones.");
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = await fs.promises.readFile(schemaPath, "utf8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    console.log("🚀 Aplicando migraciones desde db/schema.sql ...");
    await pool.query(schema);
    console.log("✅ Migraciones completadas (o ya estaban aplicadas).");
  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
