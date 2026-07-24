import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateTicketModal } from "@/components/helpdesk/CreateTicketModal";
import { TicketList } from "@/components/helpdesk/TicketList";
import { LifeBuoy } from "lucide-react";

export default async function HelpdeskPage() {
  const user = await requireAuth();
  if (!user) return null;

  const isAdminOrManager = user.role === "ADMIN" || user.role === "MANAGER";
  
  let tickets = [];
  if (isAdminOrManager) {
    tickets = await prisma.ticket.findMany({
      include: {
        author: { include: { user: true } },
        assignee: { include: { user: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  } else {
    // Normal users only see their own tickets
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      tickets = await prisma.ticket.findMany({
        where: { authorId: profile.id },
        include: {
          author: { include: { user: true } },
          assignee: { include: { user: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    }
  }

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-primary" />
            IT & HR Helpdesk
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdminOrManager ? "Manage and resolve company support tickets." : "Submit and track your internal support requests."}
          </p>
        </div>
        <CreateTicketModal />
      </div>

      <div className="mt-8">
        <TicketList tickets={tickets} employees={JSON.parse(JSON.stringify(employees))} isAdmin={isAdminOrManager} />
      </div>
    </div>
  );
}
