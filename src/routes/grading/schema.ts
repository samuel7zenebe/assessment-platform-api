import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";

/* ─────────────────────────────────────────────────────────────────────────
 * Path params
 * ───────────────────────────────────────────────────────────────────────── */

export const AttemptQuestionIdParamSchema = z.object({
  attemptQuestionId: z.uuid(),
});

export const AnswerIdParamSchema = z.object({
  answerId: z.uuid(),
});

export const ExamAttemptIdParamSchema = z.object({
  examAttemptId: z.uuid(),
});

export const AttemptIdParamSchema = z.object({
  attemptId: z.uuid(),
});

/* ─────────────────────────────────────────────────────────────────────────
 * Answer capture (candidate, during the exam)
 * ───────────────────────────────────────────────────────────────────────── */

/** Body of an answer submission / update. */
export const AnswerContentSchema = z.object({
  selectedChoiceId: z.uuid().optional(),
  answerText: z.string().optional(),
  booleanAnswer: z.boolean().optional(),
  answerJson: z.record(z.string(), z.any()).optional().or(z.array(z.any())),
});

export const SubmitAnswerSchema = AnswerContentSchema;

export const UpdateAnswerSchema = AnswerContentSchema;

/* ─────────────────────────────────────────────────────────────────────────
 * Manual grading (reviewer)
 * ───────────────────────────────────────────────────────────────────────── */

export const GradeAnswerSchema = z.object({
  isCorrect: z.boolean(),
  awardedPoints: z.number().min(0),
  reviewerFeedback: z.string().optional(),
  manuallyReviewed: z.boolean().default(true),
});

export const BulkGradeSchema = z.object({
  grades: z.array(
    GradeAnswerSchema.extend({
      answerId: z.uuid(),
    }),
  ),
});

/* ─────────────────────────────────────────────────────────────────────────
 * Analytics
 * ───────────────────────────────────────────────────────────────────────── */

export const AnswerStatisticsQuerySchema = z.object({
  examAttemptId: z.uuid().optional(),
  attemptQuestionId: z.uuid().optional(),
});

/* ─────────────────────────────────────────────────────────────────────────
 * Grading workflow (reviewer)
 * ───────────────────────────────────────────────────────────────────────── */

/** Grading queue filters */
export const GradingQueueQuerySchema = z.object({
  examId: z.uuid().optional(),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

/** Finalize grading body — no payload required. */
export const FinalizeGradingSchema = z.object({});

// Re-export for convenience so callers can reference a single schema module.
export { attemptStatusSchema };
