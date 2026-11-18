import * as z from "zod";
import { ContractType, TerminationReason } from "../../../../../generated/prisma/enums";

export const contractSchema = z.object({
  contractId: z.string(),
  employeeMatricule: z.string().min(1, "Employee matricule is required"),
  contractType: z.enum(ContractType),
  signedDate: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  trialEndDate: z.coerce.date().nullable().optional(),
  baseSalaryAtSigning: z.number().int().nonnegative(),
  positionId: z.string(),
  serviceId: z.string().min(1, "Service ID is required"),
  terminationDate: z.coerce.date().nullable().optional(),
  terminationReason: z.enum(TerminationReason).nullable().optional(),
  documentReference: z.string().nullable().optional(),
});

// contractId is built from the employee matricule and employeeMatricule comes from the route params
export const createContractSchema = contractSchema.omit({
  contractId : true,
  employeeMatricule : true
});

export const updateContractSchema = contractSchema.omit({
  contractId : true,
  employeeMatricule : true
}).partial();

export const terminateContractSchema = z.object({
  terminationDate: z.coerce.date(),
  terminationReason: z.enum(TerminationReason)
});