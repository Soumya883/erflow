import { z } from "zod";

export const EmployeeSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["ADMIN", "HR", "EMPLOYEE"]).default("EMPLOYEE"),
  department: z.string().optional(),
  designation: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.coerce.date().optional(),
  shiftStartTime: z.string().default("09:00"),
  shiftEndTime: z.string().default("17:00"),
});

export type EmployeeInput = z.infer<typeof EmployeeSchema>;

export const UpdateEmployeeSchema = EmployeeSchema.extend({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional().or(z.literal("")),
});

export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
