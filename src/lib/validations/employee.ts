import { z } from "zod";

export const EmployeeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  departmentId: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional(),
  salary: z.coerce.number().optional(),
  phone: z.string().optional(),
  joinDate: z.string().optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof EmployeeSchema>;

export const UpdateEmployeeSchema = EmployeeSchema.extend({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional().or(z.literal("")),
});

export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
