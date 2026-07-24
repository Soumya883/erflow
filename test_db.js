const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getIstTodayBounds() {
  const now = new Date();
  
  // Create a Date object representing the current time in IST
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const currentUtc = now.getTime();
  const localIstMillis = currentUtc + istOffset;
  const localIstDate = new Date(localIstMillis);
  
  // Set to start of day in IST (00:00:00.000)
  localIstDate.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC
  const startOfDayIstUtc = new Date(localIstDate.getTime() - istOffset);
  const endOfDayIstUtc = new Date(localIstDate.getTime() - istOffset + 24 * 60 * 60 * 1000);
  
  return { startOfToday: startOfDayIstUtc, endOfToday: endOfDayIstUtc };
}

async function check() {
  const logs = await prisma.attendanceLog.findMany();
  console.log("All Attendance Logs:");
  logs.forEach(l => console.log(l));
  
  const { startOfToday, endOfToday } = getIstTodayBounds();
  console.log("startOfToday:", startOfToday);
  console.log("endOfToday:", endOfToday);
  
  const todayLogs = await prisma.attendanceLog.findMany({
    where: {
      date: {
        gte: startOfToday,
        lt: endOfToday
      }
    }
  });
  console.log("Logs found within bounds:", todayLogs);
}
check().finally(() => prisma.$disconnect());
