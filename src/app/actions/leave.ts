"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequest(formData: FormData) {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const type = formData.get("type") as string;
  const reason = formData.get("reason") as string;

  if (!startDate || !endDate || !type) {
    throw new Error("Missing required fields");
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId: profile.id,
      startDate,
      endDate,
      type,
      reason,
      status: "PENDING"
    }
  });

  revalidatePath("/");
  revalidatePath("/leave");
}

export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED") {
  // Only managers or admins can update leave status
  await requireAuth(["MANAGER", "ADMIN"]);

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status }
  });

  revalidatePath("/leave");
}
