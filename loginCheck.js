const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to DB...");
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'employee@sushvine.com' }
    });
    
    if (!user) {
      console.log("User not found!");
      return;
    }
    
    console.log("User found:", user.email);
    console.log("Password hash in DB:", user.passwordHash);
    console.log("Password matches 'password'?", user.passwordHash === 'password');
    
  } catch (err) {
    console.error("Database connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
