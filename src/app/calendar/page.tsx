import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CalendarClient, CalendarEvent } from "@/components/calendar/CalendarClient";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default async function CalendarPage() {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  // We fetch a wide range of dates so the calendar can navigate a bit without full reloads,
  // or we just fetch everything active if it's small.
  // For production, we'd filter by a specific date range passed via searchParams.
  // Here, we'll fetch tasks that have a dueDate, and leave requests that are approved.
  
  const now = toZonedTime(new Date(), 'Asia/Kolkata');
  const threeMonthsAgo = subMonths(now, 3);
  const threeMonthsFromNow = addMonths(now, 3);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: threeMonthsAgo,
        lte: threeMonthsFromNow
      },
      status: { not: "DONE" } // Optional: only show pending tasks
    },
    include: {
      assignee: { include: { user: true } }
    }
  });

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: threeMonthsFromNow },
      endDate: { gte: threeMonthsAgo }
    },
    include: {
      employee: { include: { user: true } }
    }
  });

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  const events: CalendarEvent[] = [];

  // Map tasks
  tasks.forEach(task => {
    if (task.dueDate) {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate.toISOString(),
        type: "TASK",
        status: task.status,
        user: task.assignee?.user.name
      });
    }
  });

  // Map leaves (we need to create an event for EACH day of the leave)
  leaveRequests.forEach(leave => {
    let current = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    
    while (current <= end) {
      events.push({
        id: `leave-${leave.id}-${current.toISOString()}`,
        title: `${leave.type} LEAVE`,
        date: current.toISOString(),
        type: "LEAVE",
        user: leave.employee.user.name
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View upcoming tasks and approved leave schedules. Click on a date to mark leave (HR/Admin only).
        </p>
      </div>

      <div className="flex-1 bg-card rounded-2xl border border-border p-6 shadow-sm overflow-auto">
        <CalendarClient events={events} isAdmin={isAdmin} employees={employees.map(e => ({ id: e.id, name: e.user.name }))} />
      </div>
    </div>
  );
}
