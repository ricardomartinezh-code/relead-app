// scripts/check-neon-schema-ui.ts
//
// This script verifies that the Neon/PostgreSQL database contains all
// tables and columns required by the ReLead application UI.  It
// connects to the database using the `DATABASE_URL` environment
// variable and reads information from `information_schema.columns`.
//
// To run this script locally you need to install the `pg` package
// (`npm install pg`) and set `DATABASE_URL` in your environment.
// Example: npx ts-node scripts/check-neon-schema-ui.ts

import { Client } from "pg";
import "dotenv/config";

// Define the expected schema.  Adjust this object to reflect the
// tables/columns defined in your `db/schema.sql` and the data
// structures used in the UI.  Each table entry contains a boolean
// `required` (whether the table must exist) and a set of columns with
// their expected data type and whether they are required.  If your
// database schema changes, update this accordingly.
const expectedSchema: {
  [tableName: string]: {
    required: boolean;
    columns: {
      [columnName: string]: {
        type: string;
        required: boolean;
      };
    };
  };
} = {
  users: {
    required: true,
    columns: {
      id: { type: "uuid", required: true },
      email: { type: "character varying", required: true },
      username: { type: "character varying", required: true },
      avatar_url: { type: "character varying", required: false },
      theme: { type: "character varying", required: false },
      theme_color: { type: "character varying", required: false },
    },
  },
  profiles: {
    required: true,
    columns: {
      id: { type: "uuid", required: true },
      user_id: { type: "uuid", required: true },
      username: { type: "character varying", required: false },
      bio: { type: "text", required: false },
      avatar_url: { type: "character varying", required: false },
      social_links: { type: "jsonb", required: false },
      settings: { type: "jsonb", required: false },
      title: { type: "character varying", required: false },
      theme: { type: "character varying", required: false },
      created_at: { type: "timestamp with time zone", required: false },
      updated_at: { type: "timestamp with time zone", required: false },
    },
  },
  link_pages: {
    required: true,
    columns: {
      id: { type: "uuid", required: true },
      user_id: { type: "uuid", required: true },
      slug: { type: "character varying", required: true },
      title: { type: "character varying", required: false },
      bio: { type: "text", required: false },
      theme: { type: "character varying", required: false },
      created_at: { type: "timestamp with time zone", required: false },
      updated_at: { type: "timestamp with time zone", required: false },
    },
  },
  link_blocks: {
    required: true,
    columns: {
      id: { type: "uuid", required: true },
      page_id: { type: "uuid", required: true },
      block_type: { type: "character varying", required: true },
      title: { type: "character varying", required: false },
      sort_order: { type: "integer", required: false },
    },
  },
  link_items: {
    required: true,
    columns: {
      id: { type: "uuid", required: true },
      block_id: { type: "uuid", required: true },
      label: { type: "character varying", required: true },
      url: { type: "character varying", required: true },
      icon: { type: "character varying", required: false },
      icon_type: { type: "character varying", required: false },
      image_url: { type: "character varying", required: false },
      created_at: { type: "timestamp with time zone", required: false },
      updated_at: { type: "timestamp with time zone", required: false },
    },
  },
  link_clicks: {
    required: false,
    columns: {
      id: { type: "uuid", required: true },
      link_item_id: { type: "uuid", required: true },
      clicked_at: { type: "timestamp with time zone", required: true },
    },
  },
};

type ColumnInfo = {
  table_name: string;
  column_name: string;
  data_type: string;
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "ERROR: DATABASE_URL no está definida. Este script requiere una conexión a la base de datos de Neon."
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    const res = await client.query<ColumnInfo>(
      `SELECT table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
       ORDER BY table_name, column_name`
    );

    // Build a mapping of table -> column -> type for the existing schema
    const dbMap: Record<string, Record<string, string>> = {};
    for (const row of res.rows) {
      if (!dbMap[row.table_name]) {
        dbMap[row.table_name] = {};
      }
      dbMap[row.table_name][row.column_name] = row.data_type;
    }

    console.log("\n=== Revisión del esquema de la base de datos ===\n");

    // Iterate over expected schema and compare with DB
    for (const [tableName, tableInfo] of Object.entries(expectedSchema)) {
      const existsTable = !!dbMap[tableName];
      if (!existsTable) {
        console.log(
          `${tableName}: ${tableInfo.required ? "MISSING_TABLE (requerida)" : "MISSING_TABLE (opcional)"}`
        );
        continue;
      } else {
        console.log(`${tableName}: OK (tabla existe)`);
      }

      const dbColumns = dbMap[tableName] || {};
      for (const [colName, colInfo] of Object.entries(tableInfo.columns)) {
        const actualType = dbColumns[colName];
        if (!actualType) {
          console.log(
            `  ${colName}: ${colInfo.required ? "MISSING_COLUMN (requerida)" : "MISSING_COLUMN (opcional)"}`
          );
        } else if (actualType !== colInfo.type) {
          console.log(
            `  ${colName}: TYPE_MISMATCH (esperado ${colInfo.type}, actual ${actualType})`
          );
        } else {
          console.log(`  ${colName}: OK`);
        }
      }

      console.log("");
    }

    // Report extra tables not listed in expectedSchema
    const extraTables = Object.keys(dbMap).filter(
      (t) => !expectedSchema[t]
    );
    if (extraTables.length > 0) {
      console.log(
        "Tablas adicionales en la base de datos (no referenciadas en expectedSchema):"
      );
      for (const t of extraTables) {
        console.log(`  - ${t}`);
      }
    }
  } catch (err) {
    console.error("Error al comprobar el esquema de la base de datos:", err);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Error inesperado en el script de comprobación del esquema:", err);
});