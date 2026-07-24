"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createClient(data: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const client = await prisma.client.create({ data });
    revalidatePath("/crm");
    return { success: true, data: client };
  } catch (error: any) {
    return { error: error.message || "Failed to create client" };
  }
}

export async function createLead(data: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  value?: number;
  notes?: string;
}) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const lead = await prisma.lead.create({ data });
    revalidatePath("/crm");
    return { success: true, data: lead };
  } catch (error: any) {
    return { error: error.message || "Failed to create lead" };
  }
}

export async function updateLeadStatus(id: string, status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST") {
  await requireAuth(["ADMIN", "MANAGER"]);

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/crm");
    return { success: true, data: lead };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead status" };
  }
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const client = await prisma.client.update({ where: { id }, data });
    revalidatePath("/crm");
    return { success: true, data: client };
  } catch (error: any) {
    return { error: error.message || "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
  await requireAuth(["ADMIN"]); // Only admins should delete clients
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/crm");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete client" };
  }
}

export async function updateLead(
  id: string,
  data: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    value?: number;
    status?: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
  }
) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    const lead = await prisma.lead.update({ where: { id }, data });
    revalidatePath("/crm");
    return { success: true, data: lead };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead" };
  }
}

export async function deleteLead(id: string) {
  await requireAuth(["ADMIN", "MANAGER"]);
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/crm");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete lead" };
  }
}
