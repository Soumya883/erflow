import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ExportAttendanceButton } from "@/components/attendance/ExportAttendanceButton";
import { getDaysInMonth, endOfMonth, startOfMonth, isWeekend } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AttendanceMatrix } from "@/components/attendance/AttendanceMatrix";
import { SyncToGoogleSheetsButton } from "@/components/attendance/SyncToGoogleSheetsButton";

export const dynamic = "force-dynamic";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  await requireAuth(["MANAGER", "ADMIN"]);

  const now = toZonedTime(new Date(), 'Asia/Kolkata');
  
  const params = await searchParams;
  let month = parseInt(params.month || "");
  let year = parseInt(params.year || "");

  if (isNaN(month) || isNaN(year)) {
    month = now.getMonth();
    year = now.getFullYear();
  }

  // Calculate local IST boundaries for the selected month
  const monthStartLocal = new Date(year, month, 1, 0, 0, 0, 0);
  const monthEndLocal = endOfMonth(monthStartLocal);
  monthEndLocal.setHours(23, 59, 59, 999);

  const istOffset = 5.5 * 60 * 60 * 1000;
  const startUtc = new Date(monthStartLocal.getTime() - istOffset);
  const endUtc = new Date(monthEndLocal.getTime() - istOffset);

  const totalDays = getDaysInMonth(monthStartLocal);

  const employees = await prisma.employeeProfile.findMany({
    include: {
      user: true,
      department: true,
      attendanceLogs: {
        where: {
          date: {
            gte: startUtc,
            lte: endUtc
          }
        }
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: endUtc },
          endDate: { gte: startUtc }
        }
      }
    },
    orderBy: { user: { name: "asc" } }
  });

  // Pre-calculate Matrix Data
  const matrixData = employees.map(emp => {
    const days = [];
    
    for (let day = 1; day <= totalDays; day++) {
      const currentDateLocal = new Date(year, month, day, 12, 0, 0);
      // Only Sunday (0) is a holiday. Saturday (6) is a working day.
      const isWknd = currentDateLocal.getDay() === 0;
      
      // Find log
      // date in DB is UTC, but it represents the local day because of how we store it.
      // Easiest way is to match by getDate() if we convert db date back to IST, but we can just use the bounds.
      const dayStart = new Date(year, month, day, 0, 0, 0, 0);
      const dayEnd = new Date(year, month, day, 23, 59, 59, 999);
      const dStartUtc = new Date(dayStart.getTime() - istOffset);
      const dEndUtc = new Date(dayEnd.getTime() - istOffset);

      const log = emp.attendanceLogs.find(l => {
        const t = l.date.getTime();
        return t >= dStartUtc.getTime() && t <= dEndUtc.getTime();
      });

      // Find Leave
      const isOnLeave = emp.leaveRequests.some(l => {
        return dStartUtc <= l.endDate && dEndUtc >= l.startDate;
      });

      let status = "ABSENT";
      if (log?.checkIn) status = "PRESENT";
      else if (isOnLeave) status = "LEAVE";
      else if (isWknd) status = "WEEKEND";
      
      // Future days shouldn't be marked as Absent yet
      if (!log?.checkIn && !isOnLeave && !isWknd && currentDateLocal.getTime() > now.getTime()) {
        status = "PENDING";
      }

      days.push({
        day,
        status,
        checkIn: log?.checkIn ? log.checkIn.toISOString() : null,
        checkOut: log?.checkOut ? log.checkOut.toISOString() : null,
        logId: log?.id || null,
        employeeId: emp.id
      });
    }

    // Calculate summary for salary
    const presentDays = days.filter(d => d.status === "PRESENT").length;
    const leaveDays = days.filter(d => d.status === "LEAVE").length;
    
    // Formula used in CSV: Total Days - Absences (where absence is not present and not leave)
    const daysAbsent = totalDays - presentDays - leaveDays;
    const payableDays = Math.max(0, totalDays - Math.max(0, daysAbsent));
    const baseSalary = emp.salary || 0;
    const calculatedSalary = (baseSalary / totalDays) * payableDays;

    return {
      id: emp.id,
      name: emp.user.name,
      department: emp.department?.name || "N/A",
      baseSalary,
      payableDays,
      calculatedSalary,
      days
    };
  });

  // Navigation Links
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const monthName = monthStartLocal.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Matrix</h1>
          <p className="text-muted-foreground mt-1">
            Monthly spreadsheet view of all employee attendance.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
            <Link 
              href={`/attendance?month=${prevMonth}&year=${prevYear}`}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-[120px] text-center text-sm font-semibold">
              {monthName} {year}
            </span>
            <Link 
              href={`/attendance?month=${nextMonth}&year=${nextYear}`}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <SyncToGoogleSheetsButton matrixData={matrixData} totalDays={totalDays} month={month} year={year} />
            <ExportAttendanceButton matrixData={matrixData} totalDays={totalDays} month={month} year={year} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AttendanceMatrix 
          matrixData={matrixData} 
          totalDays={totalDays}
          month={month}
          year={year}
        />
      </div>
    </div>
  );
}
