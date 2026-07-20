"use server";

import { prisma } from "@/lib/prisma";
import { withAdminAction, withEmployeeAction } from "@/lib/safe-action";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { AttendanceStatus } from "@prisma/client";

export const getAttendanceHistoryAction = withEmployeeAction(async (employeeId: string) => {
  const history = await prisma.attendance.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      date: 'desc'
    },
    take: 30 // Fetch last 30 days
  });

  return history;
});

export const getAttendanceReportAction = async () => {
  const attendances = await prisma.attendance.findMany({
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          department: true,
        },
      },
    },
    orderBy: [
      { date: "desc" },
      { employee: { firstName: "asc" } },
    ],
  });

  // Format data for CSV
  const reportData = attendances.map((record) => {
    return {
      Name: `${record.employee.firstName} ${record.employee.lastName}`,
      Email: record.employee.email,
      Department: record.employee.department || "Unassigned",
      Status: record.status,
      "Needs HR Review": record.needsHrReview ? "Yes" : "No",
      Date: formatInTimeZone(new Date(record.date), "Asia/Kolkata", "yyyy-MM-dd"),
      "Clock In Time": record.clockInTime 
        ? formatInTimeZone(new Date(record.clockInTime), "Asia/Kolkata", "hh:mm a")
        : "Not Clocked In",
      "Clock Out Time": record.clockOutTime
        ? formatInTimeZone(new Date(record.clockOutTime), "Asia/Kolkata", "hh:mm a")
        : "Not Clocked Out",
    };
  });

  return reportData;
};

// Used by HR Dashboard to see flagged records
export const getHrAttendanceReviewAction = async () => {
  const flaggedRecords = await prisma.attendance.findMany({
    where: {
      needsHrReview: true,
    },
    include: {
      employee: true,
    },
    orderBy: {
      date: "desc",
    },
  });
  
  // Stringify dates to prevent serialization errors when passing from Server Action to Client Component
  return flaggedRecords.map(record => ({
    ...record,
    date: record.date.toISOString(),
    clockInTime: record.clockInTime?.toISOString() || null,
    clockOutTime: record.clockOutTime?.toISOString() || null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }));
};

// Internal helper for employee self-service to get their today's record
export const getMyTodayAttendanceAction = async (employeeId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: today,
    },
  });
};

export const markPresentAction = async (employeeId: string) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if they already clocked in
  const existing = await prisma.attendance.findFirst({
    where: { employeeId, date: today },
  });
  if (existing) {
    throw new Error("Already marked present for today.");
  }

  // Get employee to check expected shift start time
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) throw new Error("Employee not found");

  // Determine if late. shiftStartTime is usually "09:00"
  // Convert current time to Asia/Kolkata securely on the backend
  const zonedNow = toZonedTime(now, "Asia/Kolkata");
  const currentHour = zonedNow.getHours();
  const currentMinute = zonedNow.getMinutes();

  let isLate = false;
  if (employee.shiftStartTime) {
    const [expectedHour, expectedMinute] = employee.shiftStartTime.split(":").map(Number);
    if (currentHour > expectedHour || (currentHour === expectedHour && currentMinute > expectedMinute)) {
      isLate = true;
    }
  }

  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      clockInTime: now,
      status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      needsHrReview: isLate,
      hrNotes: isLate ? "System flagged: Clocked in after expected shift start time." : null,
    }
  });
  
  return attendance;
};

export const logoutForDayAction = async (attendanceId: string) => {
  const now = new Date();
  return await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      clockOutTime: now,
    }
  });
};

export const resolveAttendanceDiscrepancyAction = async (attendanceId: string) => {
  return await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      needsHrReview: false,
      hrNotes: "Resolved by HR.",
    }
  });
};

export const getDailyAttendanceAction = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all active employees
  const employees = await prisma.employee.findMany({
    orderBy: { firstName: 'asc' }
  });

  // Get all attendances for today
  const attendances = await prisma.attendance.findMany({
    where: { date: today }
  });

  // Map them together
  const dailyReport = employees.map(emp => {
    const record = attendances.find(a => a.employeeId === emp.id);
    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department || 'Unassigned',
      designation: emp.designation || 'Unassigned',
      status: record ? record.status : 'ABSENT',
      clockInTime: record?.clockInTime ? record.clockInTime.toISOString() : null,
      clockOutTime: record?.clockOutTime ? record.clockOutTime.toISOString() : null,
    };
  });

  return dailyReport;
};
