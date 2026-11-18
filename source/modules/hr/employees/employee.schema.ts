import { z } from "zod";
import { MaritalStatus, MarriageRegime, TerminationReason } from "../../../../generated/prisma/enums";

export const maritalStatus = ["SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED"
] as const

export const gender = ["male", "female"] as const;

export const createEmployeeSchema = z.object({
  employeeMatricule: z.string(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string(),
  gender: z.enum(gender),
  dateOfBirth: z.coerce.date("Invalid date of birth"),
  hireDate: z.coerce.date("Invalid hire date"),
  country: z.string(),
  niuNumber: z.string().optional(),
  cnpsNumber: z.string().optional(),
  maritalStatus: z.enum(MaritalStatus),
  MarriageRegime: z.enum(MarriageRegime),
  phone: z.string("Phone number is required"),
  email: z.email("Invalid email address"),
  residenceAddressLine: z.string().min(1, "Residence address is required"),
});

export const archiveEmployeeSchema = z.object({
  terminationReason: z.string("Bro this is a string"),
  effectiveDate: z.coerce.date("Yeah this is not a date")
});

export const updateEmployeeSchema = createEmployeeSchema.omit({
  employeeMatricule: true,
  niuNumber : true,
  cnpsNumber: true
})