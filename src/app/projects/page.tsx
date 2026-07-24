import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { UpdateProjectModal } from "@/components/projects/UpdateProjectModal";
import Link from "next/link";
import { FolderKanban, CheckSquare, Clock } from "lucide-react";

export default async function ProjectsPage() {
  const user = await requireAuth();
  const isManager = user.role === "ADMIN" || user.role === "MANAGER";

  const projects = await prisma.project.findMany({
    include: {
      tasks: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage company initiatives.
          </p>
        </div>
        <CreateProjectModal isManager={isManager} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter(t => t.status === "DONE").length;
          const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

          return (
            <div key={project.id} className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  {isManager && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <UpdateProjectModal project={project} />
                    </div>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    project.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    project.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-1 truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {project.description || "No description provided."}
              </p>

              <div className="space-y-3 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CheckSquare className="h-4 w-4" /> Tasks</span>
                  <span className="font-medium">{completedTasks} / {totalTasks}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Link 
                    href={`/tasks?projectId=${project.id}`}
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Tasks <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Projects Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first project.</p>
            <CreateProjectModal isManager={isManager} />
          </div>
        )}
      </div>
    </div>
  );
}
