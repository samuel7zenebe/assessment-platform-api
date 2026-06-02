import z from "zod";

export const SubmitAnswerSchema = z.object({
  attemptQuestionId: z.uuid(),
  selectedChoiceId: z.uuid().optional(),
  answerText: z.string().optional(),
  booleanAnswer: z.boolean().optional(),
  answerJson: z.record(z.string(), z.any()).optional().or(z.array(z.any())),
});

export const SavedAnswerQuerySchema = z.object({
  attemptQuestionId: z.uuid(),
});

export const UpdateAnswerSchema = z.object({
  selectedChoiceId: z.uuid().optional(),
  answerText: z.string().optional(),
  booleanAnswer: z.boolean().optional(),
  answerJson: z.record(z.string(), z.any()).optional().or(z.array(z.any())),
});

export const GradeAnswerSchema = z.object({
  isCorrect: z.boolean(),
  awardedPoints: z.number().min(0),
  manuallyReviewed: z.boolean().default(true),
  reviewerFeedback: z.string().optional(),
});

export const BulkGradeSchema = z.object({
  grades: z.array(
    z.object({
      answerId: z.uuid(),
      isCorrect: z.boolean(),
      awardedPoints: z.number().min(0),
      manuallyReviewed: z.boolean().default(true),
      reviewerFeedback: z.string().optional(),
    }),
  ),
});

export const AnswerStatisticsSchema = z.object({
  examAttemptId: z.uuid().optional(),
  attemptQuestionId: z.uuid().optional(),
});
