import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  // Si no hay DATABASE_URL, retorna estado de sin base de datos
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        status: "no_database",
        message: "DATABASE_URL no configurada",
      },
      { status: 503 },
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
  });

  let client; // release de manera segura en finally

  try {
    client = await pool.connect();

    const serverInfo = await client.query(
      "SELECT NOW() AS current_time, version(), current_user, current_database()",
    );

    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );

    return NextResponse.json({
      ok: true,
      status: "connected",
      message: "Conexión con base de datos Neon verificada",
      details: {
        currentTime: serverInfo.rows[0].current_time,
        version: serverInfo.rows[0].version,
        currentUser: serverInfo.rows[0].current_user,
        database: serverInfo.rows[0].current_database,
        tables: {
          count: tables.rowCount,
          names: tables.rows.map((row) => row.table_name),
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        ok: false,
        status: "connection_error",
        message: `Error al conectar: ${message}`,
      },
      { status: 503 },
    );
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}
