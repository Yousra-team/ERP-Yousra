import { z } from "zod";
import { gender } from "../employee.schema";
import { SpouseEndReason } from "../../../../../generated/prisma/enums";

export const SpouseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date(), 
  gender: z.enum(gender),
  cniNumber: z.string().min(1, "CNI number is required"),
  marriageDate: z.coerce.date("Marriage date is required"), 
  marriageCertificateNo: z.string().optional(),
  isDependent: z.boolean(),
  employeeMatricule: z.string().min(1, "Employee matricule is required"),
});

// Infer the TypeScript type from the schema
export type EmployeeFormInput = z.infer<typeof SpouseSchema>;

export const updateSpouseSchema = SpouseSchema.omit({
  cniNumber : true,
  employeeMatricule : true,
});

export const endMarriageSchema = z.object({
  endedOn : z.coerce.date(),
  endReason : z.enum(SpouseEndReason)
});