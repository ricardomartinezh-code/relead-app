import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";

/**
 * API handler para operaciones sobre la cuenta del usuario autenticado.
 * De momento únicamente soportamos el método DELETE para desactivar la cuenta.
 */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // En lugar de eliminar físicamente al usuario, marcamos su cuenta como inactiva.
    // Esto preserva la integridad referencial en la base de datos y permite un
    // potencial soporte de restauración en el futuro.
    await sql/*sql*/`
      UPDATE users
      SET is_active = false, updated_at = now()
      WHERE id = ${user.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    return NextResponse.json(
      { error: "Error eliminando cuenta" },
      { status: 500 }
    );
  }
}

// Para compatibilidad, tratamos PATCH como alias de DELETE en este endpoint.
export const PATCH = DELETE;