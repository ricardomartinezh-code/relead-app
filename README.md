# ReLead

ReLead es un servicio de "link in bio" construido con Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL y NextAuth.

## Requisitos
- Node.js 18+
- PostgreSQL accesible vía `DATABASE_URL`

## Variables de entorno
Copia `.env.example` a `.env` y completa los valores:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Scripts útiles
- `npm install`
- `npm run dev`
- `npx prisma generate`
- `npx prisma migrate dev --name init`
- `npm run build`

## Estructura principal
- `src/app` – rutas de App Router (landing, auth, dashboard, páginas públicas, APIs).
- `prisma/schema.prisma` – modelos y definiciones de la base de datos.
- `src/lib` – helpers de Prisma y NextAuth.
- `src/components` – UI reutilizable (layout, formularios, listas de links).

## Flujos clave
- Registro en `/auth/register` (crea usuario, hash de contraseña y perfil con slug único).
- Login con NextAuth Credentials en `/auth/login`.
- Dashboard protegido en `/dashboard` para métricas y gestión de perfil/links.
- Página pública en `/{slug}` con tracking de visitas y clics.
