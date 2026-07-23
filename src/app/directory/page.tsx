import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditEmployeeModal } from "@/components/edit-employee-modal";

export default async function DirectoryPage(props: { searchParams: Promise<{ departmentId?: string }> }) {
  const currentUser = await requireAuth();
  const searchParams = await props.searchParams;
  const departmentId = searchParams?.departmentId;

  const employees = await prisma.employeeProfile.findMany({
    where: departmentId ? { departmentId } : {},
    include: {
      user: true,
      department: true
    },
    orderBy: { user: { name: 'asc' } }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  let departmentName = "";
  if (departmentId) {
    const dept = departments.find(d => d.id === departmentId);
    if (dept) departmentName = ` - ${dept.name} Team`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory{departmentName}</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage {departmentId ? "department" : "all"} team members.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              {currentUser.role === 'ADMIN' && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt={emp.user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-semibold text-muted-foreground bg-primary/5">
                          {emp.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{emp.user.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {emp.department ? (
                    <Badge variant="secondary" className="rounded-md font-normal">
                      {emp.department.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {emp.jobTitle || emp.user.role}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={emp.status === "ACTIVE" ? "default" : "secondary"} 
                    className={emp.status === "ACTIVE" ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-500/20" : ""}
                  >
                    {emp.status}
                  </Badge>
                </TableCell>
                {currentUser.role === 'ADMIN' && (
                  <TableCell className="text-right">
                    <div>
                      <EditEmployeeModal employee={emp} departments={departments} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={currentUser.role === 'ADMIN' ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
