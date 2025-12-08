#!/usr/bin/env node

/**
 * Checklist automatizado para garantizar que el código desplegado en producción
 * refleja los últimos cambios y que el entorno está listo para servirlos.
 * Pasos que ejecuta:
 * 1) Verifica variables de entorno críticas.
 * 2) Comprueba conexión a la base de datos y lista tablas públicas.
 * 3) Aplica migraciones idempotentes de db/schema.sql.
 * 4) Construye la app en modo producción (npm run build).
 */

const { spawnSync } = require("child_process");
const { Pool } = require("pg");
require("dotenv").config();

const requiredEnv = [
  // Auth (Clerk)
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_FRONTEND_API",
  "CLERK_API_URL",
  "CLERK_JWKS_URL",

  // DB (Neon)
  "DATABASE_URL",

  // Cloudinary
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",

  // Meta / WhatsApp (server)
  "META_APP_ID",
  "META_APP_SECRET",
  "META_REDIRECT_URI",

  // Meta / WhatsApp (client)
  "NEXT_PUBLIC_META_APP_ID",
  "NEXT_PUBLIC_META_REDIRECT_URI",
  "NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA",
  "NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA",
];

function assertEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Faltan variables de entorno obligatorias:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nDefine las variables anteriores y vuelve a ejecutar el validador.");
    process.exit(1);
  }

  console.log("✅ Variables de entorno críticas presentes.\n");
}

async function checkDatabase() {
  console.log("🔍 Verificando conexión con la base de datos...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    const client = await pool.connect();
    const version = await client.query("SELECT version();");
    console.log(`   Servidor: ${version.rows[0].version}`);

    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );

    if (tables.rows.length === 0) {
      console.warn("   ⚠️  No se encontraron tablas públicas (la base podría estar vacía).");
    } else {
      console.log("   Tablas públicas detectadas:");
      tables.rows.forEach((row) => console.log(`     - ${row.table_name}`));
    }

    console.log("✅ Conexión a la base de datos verificada.\n");
    client.release();
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    console.error("   Revisa DATABASE_URL y la disponibilidad del servidor.");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function runMigrations() {
  console.log("🚀 Ejecutando migraciones idempotentes (db/schema.sql)...");
  const result = spawnSync("node", ["scripts/run-migrations.js"], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error("❌ Las migraciones fallaron. Revisa los logs anteriores.");
    process.exit(result.status ?? 1);
  }
  console.log("✅ Migraciones aplicadas o ya vigentes.\n");
}

function buildProduction() {
  console.log("🏗️  Construyendo la aplicación en modo producción...");
  const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  if (result.status !== 0) {
    console.error("❌ El build de producción falló. Revisa los errores arriba.");
    process.exit(result.status ?? 1);
  }
  console.log("✅ Build de producción completado.\n");
}

async function main() {
  console.log("🧪 Iniciando validación de producción...");
  assertEnv();
  await checkDatabase();
  runMigrations();
  buildProduction();
  console.log("🎉 Entorno validado. Los cambios listos para desplegar y reflejarse en producción.");
}

main();
