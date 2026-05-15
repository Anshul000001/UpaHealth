import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma client backed by the node-postgres driver adapter.
 *
 * Pool sizing notes (Supabase):
 *  - DATABASE_URL should point to the **transaction pooler on port 6543**
 *    (Supavisor) with `?pgbouncer=true&connection_limit=1`.
 *  - The pg `Pool.max` is kept small so multiple Next.js workers / HMR reloads
 *    in dev cannot exhaust Supabase's session limit (default 15 in session mode).
 */
function getPrismaClient(): PrismaClient {
  if (global.__prisma) return global.__prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const poolMax = Number(process.env.PG_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 5 : 3));

  const adapter = new PrismaPg({
    connectionString,
    max: poolMax,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  const client = new PrismaClient({ adapter });

  // Cache across HMR reloads in dev so we don't leak pools.
  if (process.env.NODE_ENV !== "production") {
    global.__prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
