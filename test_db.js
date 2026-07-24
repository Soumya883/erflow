const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: { employeeProfile: true }
  });
  console.log(users.map(u => ({ email: u.email, hasProfile: !!u.employeeProfile })));
}
check().finally(() => prisma.$disconnect());
