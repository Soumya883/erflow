import { prisma } from './src/lib/prisma';

async function main() {
  console.log("Testing auth logic...");
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'employee@sushvine.com' },
      include: { employeeProfile: true }
    });
    console.log("User:", user?.email);
    console.log("Password matches:", user?.passwordHash === 'password');
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
