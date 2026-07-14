import z from "zod";

export const QuestionChoiceResponseSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1),
  choiceText: z.string().min(1, "Choice text is required"),
  isCorrect: z.boolean(),
  displayOrder: z.coerce.number().int().nonnegative(),
});

export const CreateQuestionChoiceSchema = z.object({
  questionId: z.uuid(),
  choiceText: z.string(),
  isCorrect: z.boolean(),
  displayOrder: z.coerce.number().int().nonnegative(),
});

export const QuestionChoicesCreateSchema = z.object({
  questionId: z.uuid(),
  choiceText: z.string(),
  isCorrect: z.boolean(),
  displayOrder: z.coerce.number().int().nonnegative(),
});

export const QuestionChoicesGetByQuestionIdSchema = z.object({
  id: z.uuid().min(1, "Question Id is required"),
});

export const QuestionChoicesDeleteByQuestionIdSchema = z.object({
  id: z.uuid(),
});

export const QuestionChoiceUpdateSchema = z.object({
  choiceId: z.string(),
  questionId: z.uuid().optional(),
  choiceText: z.string().optional(),
  isCorrect: z.boolean().optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
});
