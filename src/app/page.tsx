import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Clock 
} from "lucide-react";
import { ClockInOutButton } from "@/components/dashboard/ClockInOutButton";
import { RequestLeaveModal } from "@/components/dashboard/RequestLeaveModal";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch summary data
  const [employeeCount, projectCount, taskCount, myPendingTasks, todaysAttendance, myActiveTasks] = await Promise.all([
    prisma.employeeProfile.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.task.count({ where: { status: "TODO" } }),
    profile ? prisma.task.count({ 
      where: { 
        assigneeId: profile.id,
        status: { in: ["TODO", "IN_PROGRESS"] }
      } 
    }) : 0,
    profile ? prisma.attendanceLog.findFirst({
      where: {
        employeeId: profile.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    }) : null,
    profile ? prisma.task.findMany({
      where: { assigneeId: profile.id, status: { not: "DONE" } },
      take: 5,
      orderBy: { dueDate: "asc" }
    }) : []
  ]);

  const hasClockedIn = !!todaysAttendance?.checkIn;
  const hasClockedOut = !!todaysAttendance?.checkOut;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of what's happening today.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Employees</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-bold">{employeeCount}</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Projects</h3>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-bold">{projectCount}</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Company To-Dos</h3>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-bold">{taskCount}</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary text-primary-foreground p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium text-primary-foreground/80">My Pending Tasks</h3>
            <div className="p-2 bg-white/20 text-white rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-bold">{myPendingTasks}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My Assigned Tasks</h2>
          {myActiveTasks.length > 0 ? (
            <ul className="space-y-3">
              {myActiveTasks.map(task => (
                <li key={task.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-background">
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${task.status === "TODO" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <p>You have no pending tasks right now.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <RequestLeaveModal />
            <ClockInOutButton hasClockedIn={hasClockedIn} hasClockedOut={hasClockedOut} />
            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <>
                <Link href="/attendance" className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                  Manage Attendance
                </Link>
                <Link href="/leave" className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                  Review Leaves
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
