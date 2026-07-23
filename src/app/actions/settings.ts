"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: {
  companyName: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}) {
  const user = await requireAuth(["ADMIN"]);

  // We only have one settings record, get it or create it
  let settings = await prisma.systemSettings.findFirst();

  if (settings) {
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data
    });
  } else {
    settings = await prisma.systemSettings.create({
      data
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "SETTINGS",
      entityId: settings.id,
      userId: user.id,
      details: `Updated system settings`
    }
  });

  revalidatePath("/");
  revalidatePath("/settings");
}
