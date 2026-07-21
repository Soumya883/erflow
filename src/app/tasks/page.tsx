import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function TasksPage() {
  const user = await requireAuth();

  const tasks = await prisma.task.findMany({
    include: {
      project: true,
      assignee: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const columns = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "REVIEW", title: "In Review" },
    { id: "DONE", title: "Done" },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks Board</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track project tasks.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">{col.title}</h3>
                  <Badge variant="secondary" className="rounded-full px-2">{colTasks.length}</Badge>
                </div>
                
                <div className="flex flex-col gap-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          {task.project?.name || "No Project"}
                        </Badge>
                        {task.priority === "HIGH" && (
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm leading-tight mb-3">
                        {task.title}
                      </h4>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="text-xs text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                        </div>
                        {task.assignee && (
                          <div className="h-6 w-6 rounded-full overflow-hidden border border-border">
                            {task.assignee.avatarUrl ? (
                              <img src={task.assignee.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center text-[10px]">
                                {task.assignee.user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center text-muted-foreground text-sm h-32">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
