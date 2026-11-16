import * as z from "zod";
import { ProficiencyLevel } from "../../../generated/prisma/enums";

export const positionSchema = z.object({
    title : z.string().min(1, "Position title is required"),
    description : z.string(),
    functionDescription : z.string().nullable().optional(),
    supervisorId : z.string().nullable().optional(),
    departmentId : z.string().min(1, "Department id is required"),
});

export const updatePositionSchema = positionSchema.partial();

export const positionSkillSchema = z.object({
    skillId : z.string().min(1, "Skill id is required"),
    requiredLevel : z.enum(ProficiencyLevel),
    isMandatory : z.boolean(),
});

export const updatePositionSkillSchema = positionSkillSchema.omit({
    skillId : true
}).partial();
