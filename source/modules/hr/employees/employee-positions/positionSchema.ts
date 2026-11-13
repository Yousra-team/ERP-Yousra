import * as z from "zod";
import { AssignmentType } from "../../../../../generated/prisma/enums";

export const employeePositionSchema = z.object({
  employeeMatricule: z.string().min(1, "Employee matricule is required"),
  positionId: z.string(),
  assignmentType: z.enum(AssignmentType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updatePositionSchema = employeePositionSchema.omit({
 employeeMatricule : true,
 positionId: true
});

export const endAssignment = z.object({
    endDate : z.coerce.date()
});