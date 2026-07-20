"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getMeAction() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("erflow_session")?.value;
  if (!cookie) return null;
  return await decrypt(cookie);
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // 1. Find user by email
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    return { error: "Invalid credentials." };
  }

  // 2. Check password (using our mocked "TODO_HASH_" prefix)
  const isMatch = employee.passwordHash === "TODO_HASH_" + password || employee.passwordHash === password;

  if (!isMatch) {
    return { error: "Invalid credentials." };
  }

  // 3. Create session
  await createSession(employee.id, employee.role);

  // 4. Redirect based on role
  if (employee.role === "ADMIN") {
    redirect("/admin");
  } else if (employee.role === "HR") {
    redirect("/hr");
  } else {
    redirect("/employee");
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
