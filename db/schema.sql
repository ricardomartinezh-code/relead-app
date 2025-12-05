-- SQL schema para ReLead app (Postgres)
-- Crea tablas necesarias: users, profiles, links, page_views, link_clicks, whats_app_accounts

BEGIN;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  profile_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
