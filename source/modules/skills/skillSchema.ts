import * as z from "zod";
import { SkillCategory } from "../../../generated/prisma/enums";

export const skillSchema = z.object({
    name : z.string().min(1, "Skill name is required"),
    category : z.enum(SkillCategory),
    description : z.string().nullable().optional(),
});

export const updateSkillSchema = skillSchema.partial();
