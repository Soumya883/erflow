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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true }
  });

  if (!task) {
    throw new Error("Task not found.");
  }

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

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  }
) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const project = await prisma.project.update({ where: { id }, data });
    revalidatePath("/projects");
    return { success: true, data: project };
  } catch (error: any) {
    return { error: error.message || "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete project" };
  }
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    projectId?: string;
    assigneeId?: string;
    dueDate?: Date;
  }
) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const task = await prisma.task.update({ where: { id }, data });
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, data: task };
  } catch (error: any) {
    return { error: error.message || "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete task" };
  }
}
