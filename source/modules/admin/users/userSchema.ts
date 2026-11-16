import * as z from "zod";

export const roles = [
  "Admin",
  "Manager",
  "Developer",
  "Cashier",
  "Driver",
  "HR",
  "Finance",
  "Waiter",
  "Technician",
  "Legal",
  "Stock_Manager",
  "Chef",
  "Controller",
  "Employee",
  "Customer"
] as const;


export const userSchema = z.object({
    username : z.string().min(1), // Unique login name (employees use their matricule)
    firstName : z.string(),
    lastName: z.string(),
    role: z.enum(roles),
    password: z.string().min(8)
});

export const updateUserSchema = userSchema.partial();