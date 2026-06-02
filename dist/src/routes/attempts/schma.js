import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";
/** Create attempt body */
export const CreateAttemptBodySchema = z.object({
    examId: z.uuid(),
});
/** Attempt ID param */
export const AttemptIdParamSchema = z.object({
    attemptId: z.uuid(),
});
/** Question order param (0-indexed) */
export const QuestionOrderParamSchema = z.object({
    order: z.number().int(),
});
