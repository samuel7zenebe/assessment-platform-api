import z from "zod";

export const DepartmentSchema = z.object({
  departmentId: z.string(),
  name: z.string(),
});

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  managerId: z.string().optional(),
  dgmName: z.string().optional(),
});

export const DepartmentIdSchema = z.object({
  departmentId: z.string(),
});

export const UpdateDepartmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Department name is required").optional(),
  description: z.string().optional(),
  managerId: z.string().optional(),
  dgmName: z.string().optional(),
});

export const CreateDepartmentsInBatchSchema = z.array(
  z.object({
    name: z.string().min(1, "Department name is required"),
    description: z.string().optional(),
    managerId: z.string().optional(),
    dgmName: z.string().optional(),
  }),
);
