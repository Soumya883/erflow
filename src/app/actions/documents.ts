"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDocument(formData: FormData) {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const name = formData.get("name") as string;
  const fileUrl = formData.get("fileUrl") as string;
  
  // Optional: an HR manager can upload a document for a specific employee
  const employeeId = formData.get("employeeId") as string || profile.id;

  if (!name || !fileUrl) {
    throw new Error("Name and File URL are required");
  }

  await prisma.document.create({
    data: {
      name,
      fileUrl,
      employeeId,
      uploadedById: user.id
    }
  });

  revalidatePath("/documents");
}

export async function deleteDocument(id: string) {
  const user = await requireAuth();

  const doc = await prisma.document.findUnique({ where: { id } });
  
  if (!doc) {
    throw new Error("Document not found");
  }

  // Only the uploader or an Admin/Manager can delete
  if (doc.uploadedById !== user.id && user.role === "EMPLOYEE") {
    throw new Error("Forbidden");
  }

  await prisma.document.delete({
    where: { id }
  });

  revalidatePath("/documents");
}
