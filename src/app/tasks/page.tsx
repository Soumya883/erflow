import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

export default async function TasksPage({ searchParams }: { searchParams: { projectId?: string } }) {
  const user = await requireAuth();
  const isManager = user.role === "ADMIN" || user.role === "MANAGER";

  // Build where clause
  const where: any = {};
  if (searchParams.projectId) {
    where.projectId = searchParams.projectId;
  }
  
  // If not a manager, they can still SEE tasks in the project they are assigned to, or all tasks if it's public.
  // Assuming all tasks are visible to all employees for transparency, but they can only drag their own.
  
  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { include: { user: true } },
      project: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
    where: { status: "ACTIVE" },
    orderBy: { user: { name: "asc" } }
  });

  // Filter tasks if searchParams.projectId is applied
  const activeProject = searchParams.projectId ? projects.find(p => p.id === searchParams.projectId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {activeProject ? `${activeProject.name} Tasks` : "Task Board"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tasks to update their status.
          </p>
        </div>
        <CreateTaskModal 
          isManager={isManager} 
          projects={projects} 
          employees={employees} 
          defaultProjectId={searchParams.projectId}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          initialTasks={tasks} 
          userRole={user.role} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
