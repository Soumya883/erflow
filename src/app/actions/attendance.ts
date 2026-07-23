"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getIstTodayBounds } from "@/lib/utils";

export async function clockIn() {
  const user = await requireAuth();

  // Find the employee profile
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  // Get today's bounds in IST
  const { startOfToday, endOfToday } = getIstTodayBounds();

  // Check if they already clocked in today
  const existingLog = await prisma.attendanceLog.findFirst({
    where: {
      employeeId: profile.id,
      date: {
        gte: startOfToday,
        lt: endOfToday
      }
    }
  });

  if (existingLog) {
    throw new Error("Already clocked in today");
  }

  await prisma.attendanceLog.create({
    data: {
      employeeId: profile.id,
      date: new Date(),
      checkIn: new Date(),
    }
  });

  revalidatePath("/");
  revalidatePath("/attendance");
}

export async function clockOut() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const { startOfToday, endOfToday } = getIstTodayBounds();

  const existingLog = await prisma.attendanceLog.findFirst({
    where: {
      employeeId: profile.id,
      date: {
        gte: startOfToday,
        lt: endOfToday
      }
    }
  });

  if (!existingLog) {
    throw new Error("You have not clocked in today");
  }

  if (existingLog.checkOut) {
    throw new Error("Already clocked out today");
  }

  await prisma.attendanceLog.update({
    where: { id: existingLog.id },
    data: {
      checkOut: new Date()
    }
  });

  revalidatePath("/");
  revalidatePath("/attendance");
}

export async function updateAttendanceRecord(
  employeeId: string, 
  logId: string | undefined, 
  data: { checkIn?: string, checkOut?: string, status?: string },
  dateForNewLog?: string
) {
  await requireAuth(["MANAGER", "ADMIN"]);
  
  const logDate = dateForNewLog ? new Date(dateForNewLog) : getIstTodayBounds().startOfToday;

  // Handle LEAVE status
  if (data.status === "LEAVE") {
    // Delete attendance log if exists
    if (logId) {
      await prisma.attendanceLog.delete({ where: { id: logId } });
    }
    // Create an approved leave request for this single day
    await prisma.leaveRequest.create({
      data: {
        employeeId,
        type: "ADMIN_OVERRIDE",
        startDate: logDate,
        endDate: logDate,
        status: "APPROVED",
        reason: "Manually marked as leave by Admin/HR"
      }
    });
    revalidatePath("/attendance");
    return;
  }

  // Handle ABSENT status
  if (data.status === "ABSENT") {
    // Delete log if exists
    if (logId) {
      await prisma.attendanceLog.delete({ where: { id: logId } });
    }
    // Delete any overlapping leave requests just in case
    await prisma.leaveRequest.deleteMany({
      where: {
        employeeId,
        startDate: { lte: logDate },
        endDate: { gte: logDate }
      }
    });
    revalidatePath("/attendance");
    return;
  }

  // Handle PRESENT / WORKING_DAY
  // (We proceed to create/update the attendance log)
  const updates: any = {};
  if (data.checkIn) {
    updates.checkIn = new Date(data.checkIn);
  } else {
    // If marking as Present but no time provided, default to 9 AM
    updates.checkIn = new Date(logDate.getTime() + 9 * 60 * 60 * 1000);
  }
  
  if (data.checkOut) {
    updates.checkOut = new Date(data.checkOut);
  } else {
    // Default to 5 PM
    updates.checkOut = new Date(logDate.getTime() + 17 * 60 * 60 * 1000);
  }

  if (logId) {
    await prisma.attendanceLog.update({
      where: { id: logId },
      data: updates
    });
  } else {
    await prisma.attendanceLog.create({
      data: {
        employeeId: employeeId,
        date: logDate,
        checkIn: updates.checkIn,
        checkOut: updates.checkOut
      }
    });
  }

  revalidatePath("/attendance");
}

export async function updateSalary(employeeId: string, salary: number) {
  await requireAuth(["MANAGER", "ADMIN"]);
  await prisma.employeeProfile.update({
    where: { id: employeeId },
    data: { salary }
  });
  revalidatePath("/attendance");
}

export async function syncToGoogleSheets(webhookUrl: string, payload: any) {
  await requireAuth(["MANAGER", "ADMIN"]);
  
  if (!webhookUrl || !webhookUrl.startsWith("https://script.google.com/")) {
    throw new Error("Invalid Webhook URL");
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const resultText = await res.text();
    
    if (!res.ok) {
      throw new Error(`Google Apps Script HTTP Error: ${res.status} - ${resultText}`);
    }

    let json;
    try {
      json = JSON.parse(resultText);
    } catch (parseError) {
      // If it's not JSON, it might be an HTML error page from Google
      throw new Error(`Invalid response from Apps Script (Not JSON): ${resultText.substring(0, 100)}`);
    }

    if (json.status !== "success") {
      throw new Error(`Apps Script Failed: ${json.message || resultText}`);
    }

    return { success: true };
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}

export async function importAttendanceCSV(rows: string[][]) {
  await requireAuth(["MANAGER", "ADMIN"]);
  
  try {
    if (!rows || rows.length < 2) return { success: true, message: "No data to sync" };

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Parse headers to find Date columns
    const dateColumns: { index: number, date: Date }[] = [];
    
    for (let i = 4; i < headers.length; i++) {
      const headerStr = String(headers[i]);
      let dateObj: Date | null = null;
      
      // Expected format D/M/YYYY
      const parts = headerStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        dateObj = new Date(Date.UTC(year, month, day, 0, 0, 0));
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        dateColumns.push({ index: i, date: dateObj });
      }
    }

    if (dateColumns.length === 0) {
      throw new Error("Could not find any valid date columns (expected format: DD/MM/YYYY).");
    }

    // Process each row
    const employees = await prisma.employeeProfile.findMany({
      include: { user: true }
    });

    for (const row of dataRows) {
      const empName = String(row[0] || "").trim();
      const emp = employees.find(e => e.user.name.toLowerCase() === empName.toLowerCase());
      if (!emp) continue; // Skip unknown employees

      for (const col of dateColumns) {
        const cellValue = String(row[col.index] || "").trim();
        if (!cellValue) continue;
        
        // Date range for this specific day
        const dayStart = new Date(col.date);
        const dayEnd = new Date(col.date.getTime() + 24 * 60 * 60 * 1000 - 1);

        // Find existing log
        const existingLog = await prisma.attendanceLog.findFirst({
          where: {
            employeeId: emp.id,
            date: { gte: dayStart, lte: dayEnd }
          }
        });

        const isMarkedPresent = cellValue.startsWith("P") || cellValue === "PRESENT";
        const isMarkedAbsent = cellValue === "A" || cellValue === "ABSENT";

        if (isMarkedPresent && !existingLog) {
          // Create log (9 AM - 5 PM)
          const checkIn = new Date(col.date.getTime() + 9 * 60 * 60 * 1000); 
          const checkOut = new Date(col.date.getTime() + 17 * 60 * 60 * 1000);
          
          await prisma.attendanceLog.create({
            data: {
              employeeId: emp.id,
              date: col.date,
              checkIn: checkIn,
              checkOut: checkOut
            }
          });
        } else if (isMarkedAbsent && existingLog) {
          // Delete log
          await prisma.attendanceLog.delete({
            where: { id: existingLog.id }
          });
        }
      }
    }

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { error: `Import Failed: ${error.message}` };
  }
}

export async function pullFromGoogleSheets(webhookUrl: string) {
  await requireAuth(["MANAGER", "ADMIN"]);
  
  if (!webhookUrl || !webhookUrl.startsWith("https://script.google.com/")) {
    throw new Error("Invalid Webhook URL");
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "GET",
      redirect: "follow",
    });

    const resultText = await res.text();
    if (!res.ok) throw new Error(`Google Apps Script HTTP Error: ${res.status} - ${resultText}`);

    let json;
    try {
      json = JSON.parse(resultText);
    } catch (e) {
      throw new Error(`Invalid response from Apps Script (Not JSON): ${resultText.substring(0, 100)}`);
    }

    if (json.status !== "success" || !json.data) {
      throw new Error(`Apps Script Failed: ${json.message || "No data returned"}`);
    }

    const rows = json.data;
    if (rows.length < 2) return { success: true, message: "No data to sync" };

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const dateColumns: { index: number, date: Date }[] = [];
    
    for (let i = 4; i < headers.length; i++) {
      const headerStr = String(headers[i]);
      let dateObj: Date | null = null;
      
      if (headerStr.match(/^\d{4}-\d{2}-\d{2}T/)) {
        dateObj = new Date(headerStr);
      } else {
        const parts = headerStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          dateObj = new Date(Date.UTC(year, month, day, 0, 0, 0));
        }
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        dateColumns.push({ index: i, date: dateObj });
      }
    }

    if (dateColumns.length === 0) {
      throw new Error("Could not find any date columns in the sheet. Has the format changed?");
    }

    const employees = await prisma.employeeProfile.findMany({
      include: { user: true }
    });

    for (const row of dataRows) {
      const empName = String(row[0]).trim();
      const emp = employees.find(e => e.user.name.toLowerCase() === empName.toLowerCase());
      if (!emp) continue; 

      for (const col of dateColumns) {
        const cellValue = String(row[col.index] || "").trim();
        
        const dayStart = new Date(col.date);
        const dayEnd = new Date(col.date.getTime() + 24 * 60 * 60 * 1000 - 1);

        const existingLog = await prisma.attendanceLog.findFirst({
          where: {
            employeeId: emp.id,
            date: { gte: dayStart, lte: dayEnd }
          }
        });

        const isMarkedPresent = cellValue.startsWith("P") || cellValue === "PRESENT";
        const isMarkedAbsent = cellValue === "A" || cellValue === "ABSENT";

        if (isMarkedPresent && !existingLog) {
          const checkIn = new Date(col.date.getTime() + 9 * 60 * 60 * 1000); 
          const checkOut = new Date(col.date.getTime() + 17 * 60 * 60 * 1000);
          
          await prisma.attendanceLog.create({
            data: {
              employeeId: emp.id,
              date: col.date,
              checkIn: checkIn,
              checkOut: checkOut
            }
          });
        } else if (isMarkedAbsent && existingLog) {
          await prisma.attendanceLog.delete({
            where: { id: existingLog.id }
          });
        }
      }
    }

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    throw new Error(`Two-Way Sync Failed: ${error.message}`);
  }
}

