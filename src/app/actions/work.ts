"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(data: { name: string; description?: string }) {
  await requireAuth(["MANAGER", "ADMIN"]);

  if (!data.name?.trim()) {
    throw new Error("Project name is required.");
  }

  await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: "ACTIVE"
    }
  });

  revalidatePath("/projects");
}

export async function createTask(data: { title: string; description?: string; priority: string; projectId?: string; assigneeId?: string; dueDate?: string }) {
  await requireAuth(["MANAGER", "ADMIN"]);

  if (!data.title?.trim()) {
    throw new Error("Task title is required.");
  }

  await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      projectId: data.projectId || null,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "TODO"
    }
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") {
  const user = await requireAuth();

  // Validate that the task exists
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true }
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  // Employees can only update their own tasks, unless they are Admin/Manager
  if (user.role === "EMPLOYEE") {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    if (task.assigneeId !== profile?.id) {
      throw new Error("Unauthorized: You can only move your own tasks.");
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}
