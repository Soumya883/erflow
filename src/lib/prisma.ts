import { PrismaClient } from "@prisma/client";

// Revert to using the standard Prisma engine, which is much more stable on Vercel 
// than using the pg adapter which can cause ETIMEDOUT socket hangs.
// We use the pooler URL because Prisma requires connection pooling on Vercel.
const connectionString = "postgresql://neondb_owner:npg_lPaRVs1kyTr6@ep-summer-pond-au60ur0i-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
