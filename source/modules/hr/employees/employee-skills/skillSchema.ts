import * as z from "zod";
import { ProficiencyLevel } from "../../../../../generated/prisma/enums";

export const employeeSkillSchema = z.object({
  employeeMatricule: z.string().min(1, "Employee matricule is required"),
  skillId: z.string(),
  proficiencyLevel: z.enum(ProficiencyLevel),
  acquiredDate: z.coerce.date().nullable().optional(),
  lastAssessedDate: z.coerce.date().nullable().optional(),
});

export const updateSkillSchema = employeeSkillSchema.omit({
    employeeMatricule : true,
    skillId : true
})