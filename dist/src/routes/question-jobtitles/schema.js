import z from "zod";
export const QuestionJobTitleSchema = z.object({
    questionId: z.string(),
    jobTitleId: z.string(),
});
