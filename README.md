# ReLead

ReLead es un servicio de "link in bio" construido con Next.js 14 (App Router), TypeScript, Tailwind CSS y NextAuth.

## Requisitos
- Node.js 18+

## Variables de entorno
Copia `.env.example` a `.env` y completa los valores:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Scripts útiles
- `npm install`
- `npm run dev`
- `npm run build`

## Estructura principal
- `src/app` – rutas de App Router (landing, auth, dashboard, páginas públicas, APIs).
- `src/lib` – helpers para autenticación y datos en memoria.
- `src/components` – UI reutilizable (layout, formularios, listas de links).

## Flujos clave
- Registro en `/auth/register` (crea usuario en memoria, hash de contraseña y perfil con slug único).
- Login con NextAuth Credentials en `/auth/login`.
- Dashboard protegido en `/dashboard` para métricas y gestión de perfil/links.
- Página pública en `/{slug}` con tracking de visitas y clics.
