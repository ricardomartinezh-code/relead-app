import { resolveDatabaseUrl } from "./src/lib/database-url";

const defineConfig = <T>(config: T): T => config;

const databaseUrl = resolveDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
