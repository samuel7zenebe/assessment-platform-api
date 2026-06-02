import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";
/** Grading queue filters */
export const GradingQueueQuerySchema = z.object({
    examId: z.uuid().optional(),
    limit: z.number().int().positive().optional().default(50),
    offset: z.number().int().nonnegative().optional().default(0),
});
/** Grading answer update body */
export const GradeAnswerBodySchema = z.object({
    isCorrect: z.boolean(),
    awardedPoints: z.number(),
    reviewerFeedback: z.string().optional(),
});
/** Finalize grading body */
export const FinalizeGradingSchema = z.object({});
