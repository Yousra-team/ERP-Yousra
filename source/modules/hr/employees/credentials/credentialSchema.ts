import * as z from "zod";

export const academicCredentialSchema = z.object({
  employeeMatricule: z.string().min(1, "Employee matricule is required"),
  degreeName: z.string().min(1, "Degree name is required"),
  institutionAttended: z.string().min(1, "Institution attended is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startDate: z.coerce.date(),
  completionDate: z.coerce.date().nullable().optional(),
  gradeEarned: z.number().int(),
  gradeScale: z.number().int(),
  gradePercentage: z.number().int().nullable().optional(),
  gradeLetter: z.string().nullable().optional(),
  diplomaNumber: z.string().nullable().optional(),
  issueDate: z.coerce.date(),
});

export const updateCredentialSchema = academicCredentialSchema.omit({
    employeeMatricule : true
})