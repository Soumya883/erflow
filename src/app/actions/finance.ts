"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  date: Date;
  receiptUrl?: string;
  notes?: string;
}) {
  const user = await requireAuth();
  try {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error("Profile not found");

    const expense = await prisma.expense.create({
      data: { ...data, employeeId: profile.id }
    });
    revalidatePath("/finance");
    return { success: true, data: expense };
  } catch (error: any) {
    return { error: error.message || "Failed to submit expense" };
  }
}

export async function updateExpenseStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED" | "PAID") {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/finance");
    return { success: true, data: expense };
  } catch (error: any) {
    return { error: error.message || "Failed to update expense status" };
  }
}

export async function createInvoice(data: {
  clientId: string;
  invoiceNo: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const invoice = await prisma.invoice.create({ data });
    revalidatePath("/finance");
    return { success: true, data: invoice };
  } catch (error: any) {
    return { error: error.message || "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(id: string, status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED") {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/finance");
    return { success: true, data: invoice };
  } catch (error: any) {
    return { error: error.message || "Failed to update invoice status" };
  }
}
