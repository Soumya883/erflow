import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateDepartmentModal } from "@/components/departments/CreateDepartmentModal";
import { DeleteDepartmentButton } from "@/components/departments/DeleteDepartmentButton";
import { Users, Building2 } from "lucide-react";
import Link from "next/link";

export default async function DepartmentsPage() {
  const user = await requireAuth(["ADMIN", "MANAGER"]);

  const departments = await prisma.department.findMany({
    include: {
      employees: {
        include: { user: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage organization structure and teams.
          </p>
        </div>
        <CreateDepartmentModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const empCount = dept.employees.length;
          
          return (
            <div key={dept.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{dept.name}</h3>
                </div>
                {user.role === "ADMIN" && (
                  <DeleteDepartmentButton id={dept.id} name={dept.name} disabled={empCount > 0} />
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm mt-auto border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{empCount} {empCount === 1 ? 'Employee' : 'Employees'}</span>
                </div>
                <Link 
                  href={`/directory?departmentId=${dept.id}`} 
                  className="font-medium text-primary hover:underline"
                >
                  View Team
                </Link>
              </div>
            </div>
          );
        })}

        {departments.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Departments Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first department.</p>
            <CreateDepartmentModal />
          </div>
        )}
      </div>
    </div>
  );
}
