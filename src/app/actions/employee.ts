"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EmployeeInput, EmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema } from "@/lib/validations/employee";
import { withAdminAction } from "@/lib/safe-action";

export const addEmployeeAction = withAdminAction(async (data: EmployeeInput) => {
  // 1. Strict Zod Validation
  const result = EmployeeSchema.safeParse(data);

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const validatedData = result.data;

  // 2. Check if user already exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: validatedData.email },
  });

  if (existingEmployee) {
    throw new Error("An employee with this email already exists.");
  }

  // Generate unique employee ID (EMP-XXX)
  const count = await prisma.employee.count();
  const nextId = count + 1;
  const identifier = `EMP-${nextId.toString().padStart(3, '0')}`;

  // 3. Database operation
  const newEmployee = await prisma.employee.create({
    data: {
      employeeIdentifier: identifier,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      passwordHash: "TODO_HASH_" + validatedData.password, // In a real app, hash password here
      role: validatedData.role,
      department: validatedData.department,
      designation: validatedData.designation,
      address: validatedData.address,
      joiningDate: validatedData.joiningDate || new Date(),
      phoneNumber: validatedData.phoneNumber,
      shiftStartTime: validatedData.shiftStartTime,
      shiftEndTime: validatedData.shiftEndTime,
    },
  });

  // Revalidate dashboard path
  revalidatePath("/admin");

  return { success: true, employee: newEmployee };
});

export const getEmployeesAction = withAdminAction(async () => {
  const employees = await prisma.employee.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return employees;
});

// Used by the Employee Kiosk to fetch their own profile details
export async function getEmployeeByIdAction(id: string) {
  return await prisma.employee.findUnique({
    where: { id }
  });
}

export const updateEmployeeAction = withAdminAction(async ({ id, data }: { id: string, data: UpdateEmployeeInput }) => {
  const result = UpdateEmployeeSchema.safeParse(data);

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const validatedData = result.data;

  // Check email uniqueness if email changed
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found.");
  }

  if (existingEmployee.email !== validatedData.email) {
    const emailExists = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });
    if (emailExists) {
      throw new Error("An employee with this email already exists.");
    }
  }

  const updateData: any = {
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email,
    role: validatedData.role,
    department: validatedData.department,
    designation: validatedData.designation,
    address: validatedData.address,
    joiningDate: validatedData.joiningDate,
    phoneNumber: validatedData.phoneNumber,
    shiftStartTime: validatedData.shiftStartTime,
    shiftEndTime: validatedData.shiftEndTime,
  };

  // Only update password if provided
  if (validatedData.password && validatedData.password.trim() !== "") {
    updateData.passwordHash = "TODO_HASH_" + validatedData.password;
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/employees");

  return { success: true, employee: updatedEmployee };
});
