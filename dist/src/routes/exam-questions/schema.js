import z from "zod";
export const ExamQuestionSchema = z.object({
    examId: z.uuid(),
    questionId: z.uuid(),
    questionOrder: z.number().int().nonnegative(),
});
export const ReorderQuestionSchema = z.object({
    questionId: z.uuid(),
    questionOrder: z.number().int().nonnegative(),
});
export const BulkReorderSchema = z.object({
    orders: z.array(z.object({
        questionId: z.uuid(),
        questionOrder: z.number().int().nonnegative(),
    })),
});
// find questions by exam id
export const SelectExamQuestionsByExamIdSchema = z.object({
    examId: z.uuid(),
});
