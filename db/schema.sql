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
  theme text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Nuevos campos para páginas tipo link-in-bio
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

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

-- Clicks en ítems (para analíticas en páginas personalizadas)
CREATE TABLE IF NOT EXISTS link_item_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES link_items(id) ON DELETE CASCADE,
  referrer text NULL,
  user_agent text NULL,
  ip text NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_link_item_clicks_item_time
  ON link_item_clicks(item_id, created_at);

-- Cuentas de WhatsApp
CREATE TABLE IF NOT EXISTS whats_app_accounts (
  id uuid PRIMARY KEY,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text NULL,
  business_id text NULL,
  label text NULL,
  access_token text NOT NULL,
  expires_in integer NULL
);

-- Para instalaciones previas: asegurar columnas nuevas.
ALTER TABLE IF EXISTS whats_app_accounts
  ADD COLUMN IF NOT EXISTS waba_id text NULL,
  ADD COLUMN IF NOT EXISTS business_id text NULL,
  ADD COLUMN IF NOT EXISTS label text NULL,
  ADD COLUMN IF NOT EXISTS expires_in integer NULL;

ALTER TABLE IF EXISTS whats_app_accounts
  ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_whats_app_accounts_user_id
  ON whats_app_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_whats_app_accounts_waba_id
  ON whats_app_accounts(waba_id);

CREATE INDEX IF NOT EXISTS idx_whats_app_accounts_business_id
  ON whats_app_accounts(business_id);

-- Sesiones de onboarding (Embedded Signup / Coexistence)
CREATE TABLE IF NOT EXISTS whatsapp_onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'started',
  config_id text NULL,
  redirect_uri text NULL,
  phone_number_id text NULL,
  waba_id text NULL,
  business_id text NULL,
  signup_session_id text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  completed_at timestamptz NULL
);

ALTER TABLE IF EXISTS whatsapp_onboarding_sessions
  ADD COLUMN IF NOT EXISTS config_id text NULL,
  ADD COLUMN IF NOT EXISTS redirect_uri text NULL,
  ADD COLUMN IF NOT EXISTS phone_number_id text NULL,
  ADD COLUMN IF NOT EXISTS waba_id text NULL,
  ADD COLUMN IF NOT EXISTS business_id text NULL,
  ADD COLUMN IF NOT EXISTS signup_session_id text NULL,
  ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS consumed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz NULL;

-- Solo una sesión activa por usuario (control de concurrencia).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_whatsapp_onboarding_active_user
  ON whatsapp_onboarding_sessions(user_id)
  WHERE status IN ('started', 'pending');

CREATE INDEX IF NOT EXISTS idx_whatsapp_onboarding_sessions_user_created
  ON whatsapp_onboarding_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_onboarding_sessions_signup_session_id
  ON whatsapp_onboarding_sessions(signup_session_id);

-- Eventos de webhook (logging completo para troubleshooting y auditoría).
CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  object text NULL,
  field text NULL,
  entry_id text NULL,
  business_id text NULL,
  waba_id text NULL,
  phone_number_id text NULL,
  signup_session_id text NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS whatsapp_webhook_events
  ADD COLUMN IF NOT EXISTS object text NULL,
  ADD COLUMN IF NOT EXISTS field text NULL,
  ADD COLUMN IF NOT EXISTS entry_id text NULL,
  ADD COLUMN IF NOT EXISTS business_id text NULL,
  ADD COLUMN IF NOT EXISTS waba_id text NULL,
  ADD COLUMN IF NOT EXISTS phone_number_id text NULL,
  ADD COLUMN IF NOT EXISTS signup_session_id text NULL,
  ADD COLUMN IF NOT EXISTS raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS received_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_user_time
  ON whatsapp_webhook_events(user_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_business_time
  ON whatsapp_webhook_events(business_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_waba_time
  ON whatsapp_webhook_events(waba_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_phone_time
  ON whatsapp_webhook_events(phone_number_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_signup_session_time
  ON whatsapp_webhook_events(signup_session_id, received_at DESC);

-- Mensajes WhatsApp (para UI tipo messenger).
-- Nota: WhatsApp Cloud API requiere webhooks para recepción; este registro
-- funciona como historial persistente (inbound/outbound).
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL,
  contact text NOT NULL,
  direction text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  text_body text NULL,
  template_name text NULL,
  template_language text NULL,
  meta_message_id text NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS whatsapp_messages
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS text_body text NULL,
  ADD COLUMN IF NOT EXISTS template_name text NULL,
  ADD COLUMN IF NOT EXISTS template_language text NULL,
  ADD COLUMN IF NOT EXISTS meta_message_id text NULL,
  ADD COLUMN IF NOT EXISTS raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_phone_contact_time
  ON whatsapp_messages(user_id, phone_number_id, contact, created_at);

COMMIT;

-- NOTAS:
-- 1) Para aplicar este archivo usa: psql "$DATABASE_URL" -f db/schema.sql
-- 2) Si no tienes psql, puedes usar el panel de Neon SQL o conectar con una herramienta GUI (TablePlus, pgAdmin, etc.)
-- 3) Después de crear las tablas, si creas usuarios desde la app, la columna users.profile_id se rellenará automáticamente por el flujo de registro.
