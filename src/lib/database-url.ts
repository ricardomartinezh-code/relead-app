const databaseUrlEnvKeys = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
] as const;

type DatabaseUrlEnvKey = (typeof databaseUrlEnvKeys)[number];

/**
 * Reads the connection string from the first available environment variable
 * and normalizes it to `process.env.DATABASE_URL` so Prisma CLI/Client always
 * has access to it.
 */
export function resolveDatabaseUrl(): string {
  const databaseUrl = getFirstDefinedUrl(databaseUrlEnvKeys);

  if (!databaseUrl) {
    throw new Error(
      `Missing database connection string. Set one of: ${databaseUrlEnvKeys.join(", ")}`
    );
  }

  // Ensure Prisma always finds DATABASE_URL even if the platform uses a different name.
  process.env.DATABASE_URL = databaseUrl;

  return databaseUrl;
}

function getFirstDefinedUrl(keys: readonly DatabaseUrlEnvKey[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];

    if (value) {
      return value;
    }
  }

  return undefined;
}
