import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

/**
 * Ensures the current user is authenticated. 
 * If not, redirects to login.
 * If roles are provided, ensures the user has one of the allowed roles.
 * If not, redirects to unauthorized or dashboard.
 */
export async function requireAuth(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as Role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return session.user;
}

/**
 * Wrapper for Server Actions to ensure the user is authenticated and authorized.
 */
export function withAuth<TArgs extends any[], TReturn>(
  action: (user: { id: string; role: Role }, ...args: TArgs) => Promise<TReturn>,
  allowedRoles?: Role[]
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = session.user.role as Role;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      throw new Error("Forbidden");
    }

    return action({ id: session.user.id, role: userRole }, ...args);
  };
}
