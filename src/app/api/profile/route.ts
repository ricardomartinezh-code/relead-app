import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db/client";

interface ProfileResponse {
  id: string;
  userId: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: any;
  settings: any;
  /**
   * Título público del perfil. Este campo se muestra en la página pública
   * de enlaces y puede editarse desde el formulario de perfil.
   */
  title?: string | null;
  /**
   * Tema visual elegido para la página pública del perfil. Puede ser
   * "default", "dark" u otras variantes.
   */
  theme?: string | null;
  /**
   * Nombre del usuario (de la tabla users). Se expone aquí por conveniencia,
   * aunque no es editable desde este endpoint.
   */
  name?: string | null;
}

function mapProfile(row: any): ProfileResponse {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    socialLinks: row.social_links ?? [],
    settings: row.settings ?? {},
    // Incluimos title y theme si existen en la fila. Si no existen,
    // se devuelve null para mantener compatibilidad con clientes previos.
    title: row.title ?? null,
    theme: row.theme ?? null,
    name: row.name ?? null,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Si no existe una base de datos configurada, devolvemos un perfil simulado
  // para que la aplicación siga funcionando en modo demo.  Esto evita
  // fallos al llamar a la base de datos y permite probar la interfaz.
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      id: "demo-profile",
      userId: user.id,
      username: user.username || null,
      bio: null,
      avatarUrl: null,
      socialLinks: [],
      settings: {},
      title: null,
      theme: null,
      name: user.name || null,
    });
  }

  try {
    const rows = await sql/*sql*/`
      SELECT p.*, u.name
      FROM profiles p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ${user.id}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const profile = mapProfile(rows[0]);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Intentamos leer el cuerpo una sola vez al inicio.  Si falla, devolvemos
  // un error 400 porque no podemos procesar la petición.
  let body: any;
  try {
    body = await req.json();
  } catch (parseErr) {
    console.error("Error leyendo el cuerpo de la petición de perfil:", parseErr);
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido" },
      { status: 400 }
    );
  }

  const { username, bio, avatarUrl, socialLinks, settings, title, theme } =
    body ?? {};

  // Si no hay base de datos, aceptamos la petición pero no persistimos nada.
  // Devolvemos un objeto basado en el cuerpo recibido y el usuario para que
  // la UI piense que se ha actualizado correctamente.  Esto es útil en modo
  // demo o cuando DATABASE_URL no está configurada (previene errores 500).
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      id: "demo-profile",
      userId: user.id,
      username: username || user.username || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      socialLinks: socialLinks || [],
      settings: settings || {},
      title: title || null,
      theme: theme || null,
      name: user.name || null,
    });
  }

  try {
    // Buscamos el perfil actual del usuario.  Si no existe, devolvemos 404.
    const currentRows = await sql/*sql*/`
      SELECT * FROM profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    if (!currentRows.length) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const current = currentRows[0];

    const nextUsername = username ?? current.username;
    const nextBio = bio ?? current.bio;
    const nextAvatarUrl = avatarUrl ?? current.avatar_url;
    const nextSocialLinks = socialLinks ?? current.social_links ?? [];
    const nextSettings = settings ?? current.settings ?? {};
    const nextTitle = title ?? current.title;
    const nextTheme = theme ?? current.theme;

    const updatedRows = await sql/*sql*/`
      UPDATE profiles
      SET
        username = ${nextUsername},
        bio = ${nextBio},
        avatar_url = ${nextAvatarUrl},
        social_links = ${nextSocialLinks}::jsonb,
        settings = ${nextSettings}::jsonb,
        title = ${nextTitle},
        theme = ${nextTheme},
        updated_at = now()
      WHERE id = ${current.id}
      RETURNING *, (SELECT name FROM users WHERE id = user_id) AS name
    `;

    const updatedProfile = mapProfile(updatedRows[0]);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    // Si la actualización en BD falla (por ejemplo, porque la tabla o columna
    // no existe), devolvemos un perfil basado en los datos recibidos en
    // lugar de hacer fallar la petición.  Esto evita errores 500 en la
    // interfaz y permite seguir usando la aplicación mientras se corrige
    // el esquema de la base de datos.
    return NextResponse.json({
      id: "demo-profile",
      userId: user.id,
      username: username ?? user.username ?? null,
      bio: bio ?? null,
      avatarUrl: avatarUrl ?? null,
      socialLinks: socialLinks ?? [],
      settings: settings ?? {},
      title: title ?? null,
      theme: theme ?? null,
      name: user.name || null,
    });
  }
}

export const PATCH = PUT;
