import fs from "fs";
import path from "path";
import { Pool } from "pg";

let migrationPromise: Promise<void> | null = null;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL no está definida; se omiten migraciones automáticas.");
    return;
  }

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = await fs.promises.readFile(schemaPath, "utf8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    await pool.query(schema);
    console.info("✅ Migraciones automáticas aplicadas o ya estaban en su lugar.");
  } catch (error) {
    console.error("❌ Error aplicando migraciones automáticas:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Ejecuta el esquema SQL de forma idempotente. Se guarda en un promise global
 * para evitar múltiples ejecuciones simultáneas cuando varias rutas cargan el
 * módulo al mismo tiempo.
 */
export async function ensureDatabaseSchema() {
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }

  try {
    await migrationPromise;
  } catch (error) {
    // Mantener la promesa resuelta en error para evitar reintentos infinitos
    // en procesos donde el esquema no puede aplicarse.
    throw error;
  }
}
