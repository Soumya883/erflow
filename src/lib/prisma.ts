import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// The pooler URL is highly recommended for Vercel Serverless with Neon
const connectionString = "postgresql://neondb_owner:npg_lPaRVs1kyTr6@ep-summer-pond-au60ur0i-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
