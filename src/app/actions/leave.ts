"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequest(formData: FormData) {
  try {
    const user = await requireAuth();

    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      return { error: "Employee profile not found. Please contact HR to set up your profile." };
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;

    if (!startDateStr || !endDateStr || !type) {
      return { error: "Missing required fields" };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

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
    return { success: true };
  } catch (err: any) {
    console.error("Submit leave request error:", err);
    return { error: "An unexpected error occurred while requesting leave. " + (err.message || "") };
  }
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

export async function createLeaveAdmin(data: {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  type: string;
  reason?: string;
}) {
  await requireAuth(["MANAGER", "ADMIN"]);

  await prisma.leaveRequest.create({
    data: {
      employeeId: data.employeeId,
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.type,
      reason: data.reason || "Added by Admin/Manager",
      status: "APPROVED" // Since admin is adding it, approve it directly
    }
  });

  revalidatePath("/calendar");
  revalidatePath("/leave");
  return { success: true };
}
