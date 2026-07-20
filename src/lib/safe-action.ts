import { Role } from "@prisma/client";
import { getMeAction } from "@/app/actions/auth";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export async function getCurrentSession() {
  const session = await getMeAction();
  if (!session) return null;
  return {
    user: {
      id: session.employeeId,
      role: session.role,
    }
  };
}

export function withAdminAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>
) {
  return async (args: TArgs): Promise<{ data?: TResult; error?: string }> => {
    try {
      const session = await getCurrentSession();

      if (!session || !session.user) {
        throw new ActionError("Unauthorized. Please log in.");
      }

      if (session.user.role !== "ADMIN") {
        throw new ActionError("Forbidden. Only Admin users can perform this action.");
      }

      const result = await action(args);
      return { data: result };
    } catch (error) {
      if (error instanceof ActionError) {
        return { error: error.message };
      }
      console.error("Server Action Error:", error);
      return { error: "An unexpected error occurred." };
    }
  };
}

export function withEmployeeAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>
) {
  return async (args: TArgs): Promise<TResult> => {
    const session = await getCurrentSession();

    if (!session || !session.user) {
      throw new ActionError("Unauthorized. Please log in.");
    }

    return await action(args);
  };
}

export function withAuthAction<TArgs, TResult>(
  action: (args: TArgs, userId: string, role: Role) => Promise<TResult>
) {
  return async (args: TArgs): Promise<{ data?: TResult; error?: string }> => {
    try {
      const session = await getCurrentSession();

      if (!session || !session.user) {
        throw new ActionError("Unauthorized. Please log in.");
      }

      const result = await action(args, session.user.id, session.user.role);
      return { data: result };
    } catch (error) {
      if (error instanceof ActionError) {
        return { error: error.message };
      }
      console.error("Server Action Error:", error);
      return { error: "An unexpected error occurred." };
    }
  };
}
