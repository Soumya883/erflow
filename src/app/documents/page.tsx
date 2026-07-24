import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateDocumentModal } from "@/components/documents/CreateDocumentModal";
import { UpdateDocumentModal } from "@/components/documents/UpdateDocumentModal";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";
import { FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function DocumentsPage() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  // Admin/Manager see all documents, Employee sees only their own
  const isAdminOrManager = user.role === "ADMIN" || user.role === "MANAGER";
  
  const documents = await prisma.document.findMany({
    where: isAdminOrManager ? {} : { employeeId: profile?.id },
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Access and manage your important files and links.
          </p>
        </div>
        <CreateDocumentModal />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Document Name</th>
                {isAdminOrManager && <th className="px-6 py-4 font-medium">Owner</th>}
                <th className="px-6 py-4 font-medium">Added</th>
                <th className="px-6 py-4 font-medium">Link</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      {doc.name}
                    </div>
                  </td>
                  {isAdminOrManager && (
                    <td className="px-6 py-4 text-muted-foreground">
                      {doc.employee?.user?.name || "Unknown"}
                    </td>
                  )}
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(doc.uploadedById === user.id || isAdminOrManager) && (
                        <>
                          <UpdateDocumentModal document={JSON.parse(JSON.stringify(doc))} />
                          <DeleteDocumentButton id={doc.id} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrManager ? 4 : 3} className="px-6 py-8 text-center text-muted-foreground">
                    No documents found.
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
