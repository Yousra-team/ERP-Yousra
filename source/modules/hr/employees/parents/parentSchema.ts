import * as z from "zod";
import { gender } from "../employee.schema";


export const employeeParentSchema = z.object({
  // Manual matricule: parents are not in CNPS so the caller supplies it
  parentMatricule: z.string().min(1, "Parent matricule is required"),
  firstName: z.string(),
  lastName: z.string(),
  isAlive: z.boolean(),
  dateOfBirth: z.coerce.date().nullable(),
  gender: z.enum(gender),
  isDependent: z.boolean(),
});

export const updateParentSchema = employeeParentSchema.omit({
  parentMatricule : true
}).partial()