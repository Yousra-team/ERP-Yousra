import * as z from "zod";
import { Relationship } from "../../../../../generated/prisma/enums";

export const emergencyContactSchema = z.object({
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  relationship: z.enum(Relationship),
  phone: z.e164(),
  alternatePhone: z.string().nullable().optional(),
  addressLine: z.string().nullable().optional(),
  priorityOrder: z.number().int(),
  isActive: z.boolean(),
});

export const updateContactSchema = emergencyContactSchema.partial()