import * as z from "zod";

export const positionSchema = z.object({
    title : z.string().min(1, "Position title is required"),
    description : z.string(),
    functionDescription : z.string().nullable().optional(),
    supervisorId : z.string().nullable().optional(),
    departmentId : z.string().min(1, "Department id is required"),
});

export const updatePositionSchema = positionSchema.partial();
