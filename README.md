# ReLead

ReLead es un servicio de "link in bio" construido con Next.js 14 (App Router), TypeScript, Tailwind CSS y NextAuth.

## Requisitos
- Node.js 18+

## Variables de entorno
Copia `.env.example` a `.env` y completa los valores:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_CTWA` (ID de configuración de onboarding con CTWA)
- `NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID_NO_CTWA` (ID de configuración de onboarding sin CTWA)
- `DATABASE_URL` (cadena de conexión a tu base de datos Neon)

## Scripts útiles
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run db:check` – prueba la conexión a Neon desde CLI e imprime tablas públicas.
- `npm run db:migrate` – aplica automáticamente `db/schema.sql` sobre la base de datos de `DATABASE_URL`.

## Estructura principal
- `src/app` – rutas de App Router (landing, auth, dashboard, páginas públicas, APIs).
- `src/lib` – helpers para autenticación y datos en memoria.
- `src/components` – UI reutilizable (layout, formularios, listas de links).

## Verificar la conexión con Neon desde la app
- Endpoint de salud: `GET /api/db/health` devuelve estado `connected` y lista de tablas si `DATABASE_URL` es válido.
- Script CLI: `npm run db:check` usa `test-db-connection.js` para validar la conexión y mostrar información del servidor.

> Nota: la aplicación intenta aplicar `db/schema.sql` automáticamente al iniciar el servidor (y al cargar los módulos de base de datos) usando un proceso idempotente. Esto facilita el desarrollo temprano evitando tener que crear las tablas manualmente.

### ¿Cómo funciona la migración automática?
1. Al importar `src/lib/db/client.ts` (para endpoints serverless) o `src/lib/db.ts` (helpers con `pg`), ambos llaman a `ensureDatabaseSchema()` de `src/lib/db/migrate.ts`.
2. `ensureDatabaseSchema()` lee `db/schema.sql` y lo ejecuta con `pg.Pool` sobre la `DATABASE_URL`. Usa un `Promise` global para evitar reintentos concurrentes cuando varios módulos se cargan a la vez.
3. El SQL es idempotente (usa `CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, etc.), de modo que puede correr repetidamente sin romper datos existentes.
4. Si `DATABASE_URL` no está definida, las migraciones automáticas se omiten y verás un warning en consola. El CLI `npm run db:migrate` es la alternativa manual.

## Flujos clave
- Registro en `/auth/register` (crea usuario en memoria, hash de contraseña y perfil con slug único).
- Login con NextAuth Credentials en `/auth/login`.
- Dashboard protegido en `/dashboard` para métricas y gestión de perfil/links.
- Página pública en `/{slug}` con tracking de visitas y clics.
