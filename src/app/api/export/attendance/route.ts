import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getDaysInMonth, endOfMonth, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (Must be Admin/Manager)
    await requireAuth(["ADMIN", "MANAGER"]);

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    let month = parseInt(searchParams.get("month") || "");
    let year = parseInt(searchParams.get("year") || "");

    const now = toZonedTime(new Date(), 'Asia/Kolkata');
    if (isNaN(month) || isNaN(year)) {
      month = now.getMonth();
      year = now.getFullYear();
    }

    // 3. Define the time bounds for the month in IST, absolute UTC
    // We treat the "local" boundaries of the selected month.
    const monthStartLocal = new Date(year, month, 1, 0, 0, 0, 0);
    const monthEndLocal = endOfMonth(monthStartLocal);
    monthEndLocal.setHours(23, 59, 59, 999);

    const istOffset = 5.5 * 60 * 60 * 1000;
    const startUtc = new Date(monthStartLocal.getTime() - istOffset);
    const endUtc = new Date(monthEndLocal.getTime() - istOffset);

    const totalDaysInMonth = getDaysInMonth(monthStartLocal);

    // 4. Fetch all employees with their attendance logs and approved leaves for this month
    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: true,
        department: true,
        attendanceLogs: {
          where: {
            date: {
              gte: startUtc,
              lte: endUtc
            },
            checkIn: {
              not: null
            }
          }
        },
        leaveRequests: {
          where: {
            status: "APPROVED",
            // Leaves that overlap with this month
            startDate: { lte: endUtc },
            endDate: { gte: startUtc }
          }
        }
      }
    });

    // 5. Process data and apply salary calculation
    const reportData = employees.map(emp => {
      const baseSalary = emp.salary || 0;
      
      const daysPresent = emp.attendanceLogs.length;
      
      // Calculate leave days inside this specific month
      let approvedLeaveDays = 0;
      for (const req of emp.leaveRequests) {
        // Find overlap between the leave request and the month
        const leaveStart = new Date(Math.max(new Date(req.startDate).getTime(), startUtc.getTime()));
        const leaveEnd = new Date(Math.min(new Date(req.endDate).getTime(), endUtc.getTime()));
        
        if (leaveEnd >= leaveStart) {
          const diffTime = Math.abs(leaveEnd.getTime() - leaveStart.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // +1 because if start=Jan 1 and end=Jan 1, it's 1 day of leave.
          approvedLeaveDays += diffDays + 1;
        }
      }

      // Hardcoded Govt Holidays rule: For simplicity, assume standard weekends and govt holidays
      // are counted as paid. So we just subtract the absent days from total days.
      // Or we can explicitly calculate payable days: Present + Approved Leaves + Weekends + Holidays
      // A standard payroll approach for 30-day months: Salary / Total Days * (Present + Leaves)
      // Actually, if an employee didn't apply for leave and didn't show up, they are "Absent".
      // Total Working Days = total days in month
      const daysAbsent = totalDaysInMonth - daysPresent - approvedLeaveDays;
      const payableDays = Math.max(0, totalDaysInMonth - Math.max(0, daysAbsent));
      
      const calculatedPay = (baseSalary / totalDaysInMonth) * payableDays;

      return {
        "Employee ID": emp.id,
        "Name": emp.user.name,
        "Email": emp.user.email,
        "Department": emp.department?.name || "N/A",
        "Role": emp.user.role,
        "Base Salary (Monthly)": `₹${baseSalary.toFixed(2)}`,
        "Total Days In Month": totalDaysInMonth,
        "Days Present": daysPresent,
        "Approved Leave Days": approvedLeaveDays,
        "Unapproved Absences": Math.max(0, daysAbsent),
        "Payable Days": payableDays,
        "Calculated Payable Salary": `₹${calculatedPay.toFixed(2)}`,
      };
    });

    // 6. Convert to CSV
    const csv = Papa.unparse(reportData);

    // 7. Return file response
    const filename = `Attendance_Payroll_Report_${year}_${month + 1}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error("Export error:", error);
    if (error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
