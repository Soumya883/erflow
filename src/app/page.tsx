import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Clock 
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch some summary data for the dashboard
  const [employeeCount, projectCount, taskCount, myPendingTasks] = await Promise.all([
    prisma.employeeProfile.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.task.count({ where: { status: "TODO" } }),
    prisma.task.count({ 
      where: { 
        assignee: { userId: user.id },
        status: { in: ["TODO", "IN_PROGRESS"] }
      } 
    })
  ]);

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
          <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <p>No new announcements today.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-secondary p-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
              Request Leave
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-secondary p-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
              Clock In
            </button>
            {user.role === 'ADMIN' && (
              <button className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4 text-sm font-medium text-primary hover:bg-primary/20 transition-colors col-span-2">
                Add New Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
