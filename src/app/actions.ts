// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }

    const sql = neon(databaseUrl);
    // Minimal sanity query so this action is usable as a health check/example.
    const [result] = await sql`SELECT 1 AS ok`;
    return result;
}
