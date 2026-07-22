import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { LeaveActionButtons } from "./LeaveActionButtons";

export default async function LeaveManagementPage() {
  await requireAuth(["MANAGER", "ADMIN"]);

  const leaveRequests = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        include: {
          user: true,
          department: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject employee leave requests.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaveRequests.map(req => {
                const startDate = new Date(req.startDate).toLocaleDateString();
                const endDate = new Date(req.endDate).toLocaleDateString();
                
                return (
                  <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.employee.user.name}</div>
                      <div className="text-xs text-muted-foreground">{req.employee.department?.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{req.type}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {startDate} - {endDate}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={req.reason || ""}>
                      {req.reason || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'PENDING' ? (
                        <LeaveActionButtons requestId={req.id} />
                      ) : (
                        <span className="text-muted-foreground text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
