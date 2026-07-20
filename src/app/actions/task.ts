"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskStatus, Role } from "@prisma/client";
import { withAuthAction, withAdminAction } from "@/lib/safe-action";
import { z } from "zod";

const UpdateTaskStatusSchema = z.object({
  taskId: z.string(),
  newStatus: z.nativeEnum(TaskStatus),
});

export const getTasksAction = withAuthAction(async (args, userId, role) => {
  // Admins can see all tasks. Employees see their own tasks.
  const whereClause = role === "ADMIN" ? {} : { assigneeId: userId };

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      assignee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
});

export const updateTaskStatusAction = withAuthAction(async (args: { taskId: string; newStatus: TaskStatus }, userId, role) => {
  const result = UpdateTaskStatusSchema.safeParse(args);
  if (!result.success) {
    throw new Error("Invalid data provided");
  }

  const { taskId, newStatus } = result.data;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Permission check: Only Admin or the assigned employee can move the task
  if (role !== "ADMIN" && task.assigneeId !== userId) {
    throw new Error("Forbidden. You do not have permission to update this task.");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/workflows");
  return updatedTask;
});

export const createTaskAction = withAdminAction(async (data: { title: string; description?: string; assigneeId?: string; priority?: string }) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      priority: data.priority || "MEDIUM",
    },
  });

  revalidatePath("/admin/workflows");
  return task;
});
