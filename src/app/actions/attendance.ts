"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clockIn() {
  const user = await requireAuth();

  // Find the employee profile
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  // Get today's date at midnight for querying
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if they already clocked in today
  const existingLog = await prisma.attendanceLog.findFirst({
    where: {
      employeeId: profile.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existingLog) {
    throw new Error("Already clocked in today");
  }

  await prisma.attendanceLog.create({
    data: {
      employeeId: profile.id,
      date: new Date(),
      checkIn: new Date(),
    }
  });

  revalidatePath("/");
  revalidatePath("/attendance");
}

export async function clockOut() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.attendanceLog.findFirst({
    where: {
      employeeId: profile.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (!existingLog) {
    throw new Error("You have not clocked in today");
  }

  if (existingLog.checkOut) {
    throw new Error("Already clocked out today");
  }

  await prisma.attendanceLog.update({
    where: { id: existingLog.id },
    data: {
      checkOut: new Date()
    }
  });

  revalidatePath("/");
  revalidatePath("/attendance");
}
