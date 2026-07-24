const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const logs = await prisma.attendanceLog.findMany({
    include: { employee: { include: { user: true } } }
  });
  console.log(JSON.stringify(logs, null, 2));
}

check().finally(() => prisma.$disconnect());
