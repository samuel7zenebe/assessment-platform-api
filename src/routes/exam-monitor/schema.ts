import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";

/** Query filters for the live exam monitor. */
export const ExamMonitorQuerySchema = z.object({
  /** Restrict to a single attempt status (IN_PROGRESS, SUBMITTED, GRADED, EXPIRED). */
  status: attemptStatusSchema.optional(),
  /** Flag candidates idle longer than this many minutes (IN_PROGRESS only). */
  idleMinutes: z.coerce.number().int().nonnegative().optional(),
  /** Include the per-question timing breakdown for every candidate. */
  includeQuestions: z.coerce.boolean().optional().default(false),
});
