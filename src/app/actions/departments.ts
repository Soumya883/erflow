"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDepartment(name: string) {
  const user = await requireAuth(["ADMIN", "MANAGER"]);

  if (!name.trim()) {
    throw new Error("Department name is required");
  }

  const existing = await prisma.department.findUnique({
    where: { name: name.trim() }
  });

  if (existing) {
    throw new Error("A department with this name already exists");
  }

  const dept = await prisma.department.create({
    data: {
      name: name.trim()
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "DEPARTMENT",
      entityId: dept.id,
      userId: user.id,
      details: `Created new department: ${name}`
    }
  });

  revalidatePath("/departments");
}

export async function updateDepartment(id: string, name: string) {
  const user = await requireAuth(["ADMIN"]);

  if (!name.trim()) {
    throw new Error("Department name is required");
  }

  const existing = await prisma.department.findUnique({
    where: { name: name.trim() }
  });

  if (existing && existing.id !== id) {
    throw new Error("A department with this name already exists");
  }

  const dept = await prisma.department.update({
    where: { id },
    data: { name: name.trim() }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "DEPARTMENT",
      entityId: dept.id,
      userId: user.id,
      details: `Updated department to: ${name}`
    }
  });

  revalidatePath("/departments");
}

export async function deleteDepartment(id: string) {
  const user = await requireAuth(["ADMIN"]); // Only admins can delete

  const dept = await prisma.department.findUnique({
    where: { id },
    include: { employees: true }
  });

  if (!dept) {
    throw new Error("Department not found");
  }

  if (dept.employees.length > 0) {
    throw new Error("Cannot delete department because it still has employees assigned to it. Please reassign them first.");
  }

  await prisma.department.delete({
    where: { id }
  });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "DEPARTMENT",
      entityId: dept.id,
      userId: user.id,
      details: `Deleted department: ${dept.name}`
    }
  });

  revalidatePath("/departments");
}
