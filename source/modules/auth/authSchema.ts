import * as z from "zod";

export const LoginSchema = z.object({
    username: z.string(), // Update User name with Matricule
    password: z.string().min(8),
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
});

export const linkUserToEmployeeSchema = z.object({
    matricule : z.string(),
    userId : z.string()
});