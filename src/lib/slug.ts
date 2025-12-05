import { generateUniqueSlugFromState } from "./mockDb";

export async function generateUniqueSlug(base: string) {
  return generateUniqueSlugFromState(base);
}
