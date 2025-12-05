import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  // Si no hay DATABASE_URL, retorna estado de sin base de datos
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: false,
      status: "no_database",
      message: "DATABASE_URL no configurada",
    }, { status: 503 });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Intentar conexión con timeout de 5 segundos
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    const connectionPromise = pool.query("SELECT NOW()");
    await Promise.race([connectionPromise, timeoutPromise]);

    await pool.end();

    return NextResponse.json({
      ok: true,
      status: "connected",
      message: "Conexión con base de datos exitosa",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({
      ok: false,
      status: "connection_error",
      message: `Error al conectar: ${message}`,
    }, { status: 503 });
  }
}
