import * as z from "zod";
import { ProficiencyLevel } from "../../../../../generated/prisma/enums";

export const positionSkillSchema = z.object({
    skillId : z.string().min(1, "Skill id is required"),
    requiredLevel : z.enum(ProficiencyLevel),
    isMandatory : z.boolean(),
});

// skillId is in the url on update, can't be changed
export const updatePositionSkillSchema = positionSkillSchema.omit({
    skillId : true
}).partial();
