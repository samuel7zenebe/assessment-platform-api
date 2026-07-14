import z from "zod";

export const IdParamSchema = z.object({ id: z.uuid() });

export const QuestionChoiceInputSchema = z.object({
  choiceText: z.string().min(1, "Choice text is required"),
  isCorrect: z.boolean(),
  displayOrder: z.coerce.number().int().nonnegative(),
});

export const QuestionChoiceResponseSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1),
  choiceText: z.string().min(1, "Choice text is required"),
  isCorrect: z.boolean(),
  displayOrder: z.coerce.number().int().nonnegative(),
});

export const ExamJobTitleSchema = z.object({
  examId: z.uuid(),
  jobTitleId: z.uuid(),
  weightPercentage: z.number().int().min(1).max(100).default(100),
  isPrimary: z.boolean().default(false),
  questionCount: z.number().int().positive().optional(),
});
