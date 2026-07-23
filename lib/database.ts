import { Pool } from "pg";

const globalForDatabase = globalThis as unknown as {
  dambaAdminPool?: Pool;
};

export function getDatabasePool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas configurée.");
  }

  if (!globalForDatabase.dambaAdminPool) {
    globalForDatabase.dambaAdminPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
    });
  }

  return globalForDatabase.dambaAdminPool;
}
