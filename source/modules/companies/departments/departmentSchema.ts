import * as z from "zod";

export const departmentSchema = z.object({
    companyId : z.string().min(1, "Company id is required"),
    name : z.string().min(1, "Department name is required"),
    parentDepartmentId : z.string().nullable().optional(),
    description : z.string(),
    isActive : z.boolean(),
});

export const updateDepartmentSchema = departmentSchema.partial();
