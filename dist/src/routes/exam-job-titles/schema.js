import z from 'zod';
export const ExamJobTitleIdSchema = z.object({
    examId: z.uuid(),
    jobTitleId: z.uuid(),
});
export const CreateExamJobTitleSchema = z.object({
    examId: z.uuid(),
    jobTitleId: z.uuid(),
    weightPercentage: z.number().int().min(1).max(100).default(100),
    isPrimary: z.boolean().default(false),
    questionCount: z.number().int().positive().optional(),
});
export const UpdateExamJobTitleSchema = z.object({
    examId: z.uuid(),
    jobTitleId: z.uuid(),
    weightPercentage: z.number().int().min(1).max(100).optional(),
    isPrimary: z.boolean().optional(),
    questionCount: z.number().int().positive().optional(),
});
export const DeleteExamJobTitleSchema = z.object({
    examId: z.uuid(),
    jobTitleId: z.uuid(),
});
export const GetExamJobTitlesSchema = z.object({
    examId: z.uuid(),
});
