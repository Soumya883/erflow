import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
  await requireAuth(["MANAGER", "ADMIN"]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employees = await prisma.employeeProfile.findMany({
    include: {
      user: true,
      department: true,
      attendanceLogs: {
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage employee attendance for today.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Clock In</th>
                <th className="px-6 py-4 font-medium">Clock Out</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map(emp => {
                const log = emp.attendanceLogs[0];
                const isPresent = !!log?.checkIn;
                return (
                  <tr key={emp.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{emp.user.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.department?.name || "N/A"}</td>
                    <td className="px-6 py-4">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {log?.checkIn ? new Date(log.checkIn).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {log?.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-medium text-primary hover:underline">
                        Edit Record
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
