-- SQL schema para ReLead app (Postgres)
-- Crea tablas necesarias: users, profiles, links, page_views, link_clicks, whats_app_accounts

BEGIN;

-- Extensión para UUID aleatorios
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  name text NOT NULL,
  password text NULL,
  clerk_id text UNIQUE,
  profile_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ajustes para Clerk: permitir password nulo y vincular clerk_id
ALTER TABLE IF EXISTS users
  ALTER COLUMN password DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS clerk_id text UNIQUE;

-- Tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  bio text NULL,
  avatar_url text NULL,
  slug text NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'default'
);

-- Nuevos campos para páginas tipo link-in-bio
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Compatibilidad para clientes (p.ej. Prisma) que buscan una tabla "Profile"
-- en mayúscula. Creamos una vista que expone las mismas columnas para evitar
-- errores de tabla inexistente sin duplicar datos.
CREATE OR REPLACE VIEW "Profile" AS
SELECT
  id,
  user_id,
  title,
  bio,
  avatar_url,
  slug,
  theme
FROM profiles;

-- Si quieres que users.profile_id haga FK opcional, puedes agregar la constraint:
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS profile_id uuid;
-- No añadimos FK para evitar dependencia circular al crear usuario+perfil en la misma transacción.

-- Tabla de enlaces
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

-- Vistas de página
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referrer text NULL,
  user_agent text NULL,
  ip text NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Clics en enlaces
CREATE TABLE IF NOT EXISTS link_clicks (
  id uuid PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  referrer text NULL,
  user_agent text NULL,
  ip text NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Páginas de enlaces personalizadas
CREATE TABLE IF NOT EXISTS link_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- nombre interno que se ve en el editor
  internal_name text NOT NULL,

  -- slug para la URL pública, único por usuario
  slug text NOT NULL,

  -- textos visibles (opcionales) en la página pública
  public_title text,
  public_description text,

  is_default boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,

  -- configuración visual de la página (tema, header, colores, tipografía, navegación, etc.)
  design jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT link_pages_user_slug_unique UNIQUE (user_id, slug)
);

-- Bloques dentro de la página
CREATE TABLE IF NOT EXISTS link_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES link_pages(id) ON DELETE CASCADE,

  -- tipo de bloque: 'links', 'text', 'image', 'button', 'separator', 'social', etc.
  block_type text NOT NULL,

  title text,
  subtitle text,

  -- posición vertical dentro de la página
  position integer NOT NULL,

  is_visible boolean NOT NULL DEFAULT true,

  -- configuración específica del bloque (layout, tamaño, estilos, etc.)
  config jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_blocks_page_position
  ON link_blocks(page_id, position);

-- Items de contenido dentro de un bloque
CREATE TABLE IF NOT EXISTS link_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES link_blocks(id) ON DELETE CASCADE,

  -- orden dentro del bloque
  position integer NOT NULL,

  -- texto principal del ítem (ej. nombre del link)
  label text NOT NULL,

  -- URL asociada (para bloques tipo links, buttons, etc.)
  url text,

  -- icono o emoji opcional
  icon text,

  -- mini imagen opcional para el ítem
  image_url text,

  is_active boolean NOT NULL DEFAULT true,

  -- configuración opcional por ítem (destacado, badge, comportamiento…)
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_items_block_position
  ON link_items(block_id, position);

-- Cuentas de WhatsApp
CREATE TABLE IF NOT EXISTS whats_app_accounts (
  id uuid PRIMARY KEY,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text NULL,
  label text NULL,
  access_token text NOT NULL,
  expires_in integer NULL
);

COMMIT;

-- NOTAS:
-- 1) Para aplicar este archivo usa: psql "$DATABASE_URL" -f db/schema.sql
-- 2) Si no tienes psql, puedes usar el panel de Neon SQL o conectar con una herramienta GUI (TablePlus, pgAdmin, etc.)
-- 3) Después de crear las tablas, si creas usuarios desde la app, la columna users.profile_id se rellenará automáticamente por el flujo de registro.
