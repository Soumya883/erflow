"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  // Only Admins and Managers can create announcements
  const user = await requireAuth(["MANAGER", "ADMIN"]);

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: profile.id
    }
  });

  revalidatePath("/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  await requireAuth(["MANAGER", "ADMIN"]);

  await prisma.announcement.delete({
    where: { id }
  });

  revalidatePath("/announcements");
  revalidatePath("/");
}
