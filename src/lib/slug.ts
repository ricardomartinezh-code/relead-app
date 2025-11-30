import { prisma } from "./prisma";

export async function generateUniqueSlug(base: string) {
  const cleaned = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = cleaned || "user";
  let suffix = 0;
  while (true) {
    const existing = await prisma.profile.findUnique({ where: { slug } });
    if (!existing) return slug;
    suffix += 1;
    slug = `${cleaned || "user"}-${suffix}`;
  }
}
