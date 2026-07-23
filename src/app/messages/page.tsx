import { requireAuth } from "@/lib/rbac";
import { getRooms } from "@/app/actions/chat";
import { prisma } from "@/lib/prisma";
import { ChatLayout } from "@/components/chat/ChatLayout";

export default async function MessagesPage() {
  await requireAuth();

  // Fetch all chat rooms for the current user
  const initialRooms = await getRooms();

  // Fetch all active employees so users can start new chats
  const employees = await prisma.employeeProfile.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Internal company communications.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <ChatLayout initialRooms={initialRooms} employees={employees} />
      </div>
    </div>
  );
}
