"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createTicket(data: {
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  const user = await requireAuth();
  try {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error("Profile not found");

    const ticket = await prisma.ticket.create({
      data: { ...data, authorId: profile.id }
    });
    revalidatePath("/helpdesk");
    return { success: true, data: ticket };
  } catch (error: any) {
    return { error: error.message || "Failed to create ticket" };
  }
}

export async function updateTicket(id: string, data: {
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data
    });
    revalidatePath("/helpdesk");
    return { success: true, data: ticket };
  } catch (error: any) {
    return { error: error.message || "Failed to update ticket" };
  }
}
