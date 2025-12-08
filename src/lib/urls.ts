const publicDomain =
  process.env.NEXT_PUBLIC_PUBLIC_DOMAIN || "https://rlead.xyz";

/**
 * Devuelve la URL pública completa para un slug de usuario.
 * Ejemplo: "ricardo" -> "https://rlead.xyz/ricardo"
 */
export function getPublicLink(slug: string) {
  return `${publicDomain.replace(/\/$/, "")}/${slug}`;
}
