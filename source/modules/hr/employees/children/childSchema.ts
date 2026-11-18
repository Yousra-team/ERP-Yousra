import * as z from "zod";
import { gender } from "../employee.schema";

export const childSchema = z.object({
    isDependent : z.boolean(),
    birthCertificateNo : z.string(),
    firstName : z.string(),
    lastName: z.string(),
    spouseMatricule : z.string(),
    employeeMatricule : z.string(),
    dateOfBirth : z.coerce.date(),
    gender : z.enum(gender)
})

export const updateChildSchema = childSchema.partial()