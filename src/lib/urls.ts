const publicDomain =
  process.env.NEXT_PUBLIC_PUBLIC_DOMAIN || "https://rlead.xyz";

/**
 * Devuelve el dominio público normalizado (sin trailing slash).
 */
export function getPublicDomain() {
  return publicDomain.replace(/\/$/, "");
}

/**
 * Devuelve la URL pública completa para el perfil (ruta: /[slug]).
 * Ejemplo: "ricardo" -> "https://rlead.xyz/ricardo"
 */
export function getPublicLink(profileSlug: string) {
  return `${getPublicDomain()}/${profileSlug}`;
}

/**
 * Devuelve la URL pública para una página específica del perfil (ruta: /[slug]/[pageSlug]).
 * Ejemplo: ("ricardo","principal") -> "https://rlead.xyz/ricardo/principal"
 */
export function getPublicLinkPage(profileSlug: string, pageSlug: string) {
  return `${getPublicDomain()}/${profileSlug}/${pageSlug}`;
}
