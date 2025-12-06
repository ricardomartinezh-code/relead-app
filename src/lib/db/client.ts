import { neon } from "@neondatabase/serverless";
import { ensureDatabaseSchema } from "./migrate";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

void ensureDatabaseSchema();

export const sql = neon(process.env.DATABASE_URL);
