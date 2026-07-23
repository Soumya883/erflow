"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UpdateEmployeeInput, UpdateEmployeeSchema } from "@/lib/validations/employee";
import bcrypt from "bcryptjs";

export async function updateEmployeeAction({ id, data }: { id: string, data: UpdateEmployeeInput }) {
  try {
    await requireAuth(["ADMIN"]);

    const parsed = UpdateEmployeeSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid data provided" };
    }

    const { name, email, role, departmentId, jobTitle, salary, phone, joinDate, status, password, bankName, bankBranch, bankAccountNumber, bankIfscCode } = parsed.data;

    // First update the user record
    const updateUserData: any = {
      name,
      email,
      role
    };

    if (password) {
      updateUserData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Find the employee profile to get the userId outside of a transaction
    const profile = await prisma.employeeProfile.findUnique({
      where: { id }
    });

    if (!profile) throw new Error("Employee not found");

    await prisma.user.update({
      where: { id: profile.userId },
      data: updateUserData
    });

    await prisma.employeeProfile.update({
      where: { id },
      data: {
        departmentId: departmentId || null,
        jobTitle,
        salary,
        phone,
        status,
        joinDate: joinDate ? new Date(joinDate) : null,
        bankName,
        bankBranch,
        bankAccountNumber,
        bankIfscCode,
      }
    });

    revalidatePath("/directory");
    revalidatePath("/departments");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update employee:", error);
    return { error: error.message || "Something went wrong" };
  }
}
