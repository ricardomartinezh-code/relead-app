import { generateUniqueSlug as dbGenerateUniqueSlug } from "./db";
export async function generateUniqueSlug(base: string) {
  return dbGenerateUniqueSlug(base);
}
