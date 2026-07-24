"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createAsset(data: {
  name: string;
  description?: string;
  serialNumber?: string;
  category: "LAPTOP" | "FURNITURE" | "PERIPHERAL" | "SOFTWARE" | "OTHER";
  purchaseDate?: Date;
  value?: number;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        description: data.description,
        serialNumber: data.serialNumber,
        category: data.category,
        purchaseDate: data.purchaseDate,
        value: data.value,
        status: "AVAILABLE",
      },
    });

    revalidatePath("/assets");
    return { success: true, data: asset };
  } catch (error: any) {
    return { error: error.message || "Failed to create asset" };
  }
}

export async function updateAsset(
  id: string,
  data: {
    name?: string;
    description?: string;
    serialNumber?: string;
    category?: "LAPTOP" | "FURNITURE" | "PERIPHERAL" | "SOFTWARE" | "OTHER";
    status?: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED";
    purchaseDate?: Date;
    value?: number;
  }
) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const asset = await prisma.asset.update({
      where: { id },
      data,
    });

    revalidatePath("/assets");
    return { success: true, data: asset };
  } catch (error: any) {
    return { error: error.message || "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    await prisma.asset.delete({ where: { id } });
    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete asset" };
  }
}

export async function assignAsset(data: {
  assetId: string;
  employeeId: string;
  assignedDate: Date;
  expectedReturnDate?: Date;
  notes?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    // Check if asset is available
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset || asset.status !== "AVAILABLE") {
      throw new Error("Asset is not available for assignment");
    }

    const assignment = await prisma.assetAssignment.create({
      data: {
        assetId: data.assetId,
        employeeId: data.employeeId,
        assignedDate: data.assignedDate,
        expectedReturnDate: data.expectedReturnDate,
        notes: data.notes,
      },
    });

    await prisma.asset.update({
      where: { id: data.assetId },
      data: { status: "ASSIGNED" },
    });

    revalidatePath("/assets");
    revalidatePath(`/profile`); // Or employee directory pages
    return { success: true, data: assignment };
  } catch (error: any) {
    return { error: error.message || "Failed to assign asset" };
  }
}

export async function returnAsset(assignmentId: string, notes?: string) {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new Error("Assignment not found");

    const updatedAssignment = await prisma.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        returnedDate: new Date(),
        notes: notes ? `${assignment.notes ? assignment.notes + "\n" : ""}${notes}` : assignment.notes,
      },
    });

    await prisma.asset.update({
      where: { id: assignment.assetId },
      data: { status: "AVAILABLE" },
    });

    revalidatePath("/assets");
    revalidatePath(`/profile`);
    return { success: true, data: updatedAssignment };
  } catch (error: any) {
    return { error: error.message || "Failed to return asset" };
  }
}
