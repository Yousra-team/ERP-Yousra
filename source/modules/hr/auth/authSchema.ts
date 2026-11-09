import * as z from "zod";

export const LoginSchema = z.object({
    matricule: z.string(),
    password: z.string().min(8)
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
})