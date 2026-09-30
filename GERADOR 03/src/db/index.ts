import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Na Netlify, o banco gerenciado (Netlify Database) expõe a conexão em NETLIFY_DB_URL.
// DATABASE_URL continua aceito para desenvolvimento local.
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;

if (!databaseUrl) {
  console.error("Nenhuma conexão de banco configurada (DATABASE_URL ou NETLIFY_DB_URL).");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
