import * as z from "zod";

export const companySchema = z.object({
    name : z.string().min(1, "Company name is required"),
    creationDate : z.coerce.date(),
    isParent : z.boolean(),
    parentCompanyId : z.string().nullable().optional(),
});

export const updateCompanySchema = companySchema.partial();
