import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";

/** Full attempt record row */
export const ExamAttemptSchema = z.object({
  id: z.uuid(),
  examId: z.uuid(),
  candidateId: z.string(),
  attemptNumber: z.number().int(),
  startedAt: z.date().or(z.string()),
  submittedAt: z.date().or(z.string()).nullable(),
  score: z.coerce.number().nullable(),
  passed: z.boolean().nullable(),
  status: attemptStatusSchema,
});

/** List attempts — optional filters */
export const ListAttemptsQuerySchema = z.object({
  examId: z.uuid().optional(),
  candidateId: z.string().optional(),
  status: attemptStatusSchema.optional(),
});

/** Get / expire attempt — UUID path param */
export const AttemptIdParamSchema = z.object({
  attemptId: z.uuid(),
});

/** Start exam — optional totalQuestions override */
export const StartExamSchema = z.object({
  totalQuestions: z.number().int().positive().optional(),
  attemptNumber: z.number().int().min(1).default(1),
});

/** Submit attempt body */
export const SubmitAttemptSchema = z.object({});

/** Result / review query */
export const AttemptReviewQuerySchema = z.object({
  includeAnswers: z.coerce.boolean().default(false).optional(),
});
