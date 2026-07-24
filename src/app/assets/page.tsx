import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateAssetModal } from "@/components/assets/CreateAssetModal";
import { AssignAssetModal } from "@/components/assets/AssignAssetModal";
import { ReturnAssetModal } from "@/components/assets/ReturnAssetModal";
import { MonitorSmartphone, Laptop, Armchair, Box, Code } from "lucide-react";

export default async function AssetsPage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  const assets = await prisma.asset.findMany({
    include: {
      assignments: {
        where: { returnedDate: null },
        include: {
          employee: {
            include: { user: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  const employeeOptions = employees.map(emp => ({ id: emp.id, name: emp.user.name }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LAPTOP": return <Laptop className="h-5 w-5" />;
      case "FURNITURE": return <Armchair className="h-5 w-5" />;
      case "SOFTWARE": return <Code className="h-5 w-5" />;
      default: return <Box className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">Available</span>;
      case "ASSIGNED": return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Assigned</span>;
      case "MAINTENANCE": return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Maintenance</span>;
      case "RETIRED": return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Retired</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage company equipment, software licenses, and their assignments.
          </p>
        </div>
        <CreateAssetModal />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Serial Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map((asset) => {
                const currentAssignment = asset.assignments[0];
                return (
                  <tr key={asset.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        {asset.name}
                        {asset.value && <div className="text-xs text-muted-foreground font-normal">₹{asset.value}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{asset.category}</td>
                    <td className="px-6 py-4 text-muted-foreground">{asset.serialNumber || "-"}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">
                      {currentAssignment ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{currentAssignment.employee.user.name}</span>
                          <span className="text-xs text-muted-foreground">Since {new Date(currentAssignment.assignedDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {asset.status === "AVAILABLE" && (
                        <AssignAssetModal assetId={asset.id} assetName={asset.name} employees={employeeOptions} />
                      )}
                      {asset.status === "ASSIGNED" && currentAssignment && (
                        <ReturnAssetModal assignmentId={currentAssignment.id} assetName={asset.name} />
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <MonitorSmartphone className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    No assets found. Click "Add Asset" to start tracking inventory.
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
