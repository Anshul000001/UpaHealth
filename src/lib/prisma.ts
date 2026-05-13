import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  if (global.__prisma) return global.__prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
