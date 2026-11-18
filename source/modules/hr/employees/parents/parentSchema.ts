import * as z from "zod";
import { gender } from "../employee.schema";


export const employeeParentSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  isAlive: z.boolean(),
  dateOfBirth: z.coerce.date().nullable(),
  gender: z.enum(gender),
  isDependent: z.boolean(),
});

export const updateParentSchema = employeeParentSchema.partial()