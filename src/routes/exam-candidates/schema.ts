import { assignmentStatusSchema } from "@/src/lib/schema.js";
import z from "zod";

/**
 * Composite PK response type: { examId, candidateId }
 */
export const ExamCandidateSchema = z.object({
  examId: z.uuid(),
  candidateId: z.uuid(),
  assignmentStatus: assignmentStatusSchema,
  assignedAt: z.date().or(z.string()),
});

/** List candidates for an exam — no body; :examId comes from the URL */
export const ListExamCandidatesSchema = z.object({
  examId: z.uuid(),
});

/** Assign candidates — body carries candidate IDs (and optional initial status) */
export const AssignCandidatesSchema = z.object({
  candidates: z
    .array(
      z.object({
        candidateId: z.string(),
        assignmentStatus: assignmentStatusSchema.optional(),
      }),
    )
    .min(1, "At least one candidate is required"),
});

/** Unassign a single candidate — candidateId is in the URL, no body needed */
export const UnassignCandidateSchema = z.object({
  examId: z.uuid(),
  candidateId: z.uuid(),
});

/** Update assignment status — path param + body */
export const UpdateAssignmentStatusSchema = z.object({
  assignmentStatus: assignmentStatusSchema,
});
