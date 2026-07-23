import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Users, FolderKanban, CheckSquare, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  // 1. Key Metrics
  const totalEmployees = await prisma.employeeProfile.count({ where: { status: "ACTIVE" } });
  
  const totalProjects = await prisma.project.count({ where: { status: "ACTIVE" } });
  
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: "DONE" } });

  // 2. Task Completion by Project Data
  const projects = await prisma.project.findMany({
    include: { tasks: true }
  });

  const taskData = projects.map(p => ({
    name: p.name,
    completed: p.tasks.filter(t => t.status === "DONE").length,
    pending: p.tasks.filter(t => t.status !== "DONE").length,
  }));

  // 3. Employee Distribution by Department
  const departments = await prisma.department.findMany({
    include: { employees: true }
  });

  const deptData = departments
    .map(d => ({
      name: d.name,
      value: d.employees.length
    }))
    .filter(d => d.value > 0);

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Company-wide insights and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-2xl font-bold">{totalEmployees}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold">{totalProjects}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
              <h3 className="text-2xl font-bold">{completedTasks}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
              <h3 className="text-2xl font-bold">{totalTasks - completedTasks}</h3>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsCharts taskData={taskData} deptData={deptData} />
    </div>
  );
}
