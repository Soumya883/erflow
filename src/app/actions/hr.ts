"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ========================
// GOAL ACTIONS
// ========================

export async function createGoal(data: {
  title: string;
  description?: string;
  dueDate?: Date;
  employeeId: string;
}) {
  await requireAuth(["ADMIN", "MANAGER", "EMPLOYEE"]);

  try {
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        employeeId: data.employeeId,
      }
    });

    revalidatePath("/profile");
    return { success: true, data: goal };
  } catch (error: any) {
    return { error: error.message || "Failed to create goal" };
  }
}

export async function updateGoalProgress(id: string, progress: number, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  await requireAuth(["ADMIN", "MANAGER", "EMPLOYEE"]);

  try {
    const goal = await prisma.goal.update({
      where: { id },
      data: { progress, status }
    });

    revalidatePath("/profile");
    return { success: true, data: goal };
  } catch (error: any) {
    return { error: error.message || "Failed to update goal progress" };
  }
}

export async function deleteGoal(id: string) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    await prisma.goal.delete({ where: { id } });
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete goal" };
  }
}

// ========================
// PERFORMANCE REVIEW ACTIONS
// ========================

export async function createPerformanceReview(data: {
  employeeId: string;
  reviewPeriod: string;
  rating: number;
  comments: string;
}) {
  const user = await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const reviewerProfile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id }
    });

    if (!reviewerProfile) throw new Error("Reviewer profile not found");

    const review = await prisma.performanceReview.create({
      data: {
        employeeId: data.employeeId,
        reviewerId: reviewerProfile.id,
        reviewPeriod: data.reviewPeriod,
        rating: data.rating,
        comments: data.comments,
      }
    });

    revalidatePath("/appraisals");
    revalidatePath("/profile");
    return { success: true, data: review };
  } catch (error: any) {
    return { error: error.message || "Failed to create performance review" };
  }
}

// ========================
// RECRUITMENT (ATS) ACTIONS
// ========================

export async function createJobPosting(data: {
  title: string;
  location: string;
  type: string;
  description: string;
  departmentId?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const job = await prisma.jobPosting.create({ data });
    revalidatePath("/recruitment");
    return { success: true, data: job };
  } catch (error: any) {
    return { error: error.message || "Failed to create job posting" };
  }
}

export async function addApplicant(data: {
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  notes?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const applicant = await prisma.applicant.create({ data });
    revalidatePath("/recruitment");
    return { success: true, data: applicant };
  } catch (error: any) {
    return { error: error.message || "Failed to add applicant" };
  }
}

export async function updateApplicantStatus(id: string, status: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED") {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const applicant = await prisma.applicant.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/recruitment");
    return { success: true, data: applicant };
  } catch (error: any) {
    return { error: error.message || "Failed to update applicant status" };
  }
}
