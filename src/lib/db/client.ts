import { neon } from "@neondatabase/serverless";
import { ensureDatabaseSchema } from "./migrate";

/**
 * Pequeño contenedor para la función sql.  Si la variable de entorno
 * DATABASE_URL no está definida, se crea una función ficticia que
 * simplemente devuelve un arreglo vacío.  Esto evita que la aplicación
 * arroje errores en entornos de desarrollo sin base de datos y permite
 * que las API sigan funcionando utilizando datos en memoria u otras
 * alternativas.
 */
let sql: any;

if (!process.env.DATABASE_URL) {
  // Avisamos al desarrollador y usamos una función dummy
  console.warn(
    "DATABASE_URL no está definida. Se usará una función sql dummy que retorna un arreglo vacío."
  );
  sql = async () => [];
} else {
  // Inicializar el cliente de Neon y asegurar el esquema
  void ensureDatabaseSchema();
  sql = neon(process.env.DATABASE_URL);
}

export { sql };
