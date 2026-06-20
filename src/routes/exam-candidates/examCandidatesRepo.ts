import { db } from "@/src/db/index.js";
import { examCandidates } from "@/src/db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import type z from "zod";
import type {
  AssignCandidatesSchema,
  UpdateAssignmentStatusSchema,
} from "./schema.js";
import { APIError } from "better-auth";

export const examCandidatesRepo = {
  listCandidates: async (examId: string) => {
    return await db
      .select()
      .from(examCandidates)
      .where(eq(examCandidates.examId, examId))
      .orderBy(examCandidates.assignedAt);
  },

  assignCandidates: async (
    examId: string,
    data: z.infer<typeof AssignCandidatesSchema>,
  ) => {
    const existing = await db
      .select({ candidateId: examCandidates.candidateId })
      .from(examCandidates)
      .where(
        and(
          eq(examCandidates.examId, examId),
          inArray(
            examCandidates.candidateId,
            data.candidates.map((c) => c.candidateId),
          ),
        ),
      );

    const existingIds = new Set(existing.map((r) => r.candidateId));

    const inserts = data.candidates
      .filter((c) => !existingIds.has(c.candidateId))
      .map((c) => ({
        examId,
        candidateId: c.candidateId,
        assignmentStatus: c.assignmentStatus ?? ("ASSIGNED" as const),
        assignedAt: new Date(),
      }));

    if (inserts.length > 0) {
      await db.insert(examCandidates).values(inserts);
    }

    return inserts.map((r) => ({
      examId: r.examId,
      candidateId: r.candidateId,
      assignmentStatus: r.assignmentStatus,
      assignedAt: r.assignedAt,
    }));
  },

  unassignCandidate: async (examId: string, candidateId: string) => {
    const [deleted] = await db
      .delete(examCandidates)
      .where(
        and(
          eq(examCandidates.examId, examId),
          eq(examCandidates.candidateId, candidateId),
        ),
      )
      .returning();
    return deleted ?? null;
  },

  findAssignment: async (examId: string, candidateId: string) => {
    const rows = await db
      .select()
      .from(examCandidates)
      .where(
        and(
          eq(examCandidates.examId, examId),
          eq(examCandidates.candidateId, candidateId),
        ),
      );
    return rows.at(0) ?? null;
  },

  updateStatus: async (
    examId: string,
    candidateId: string,
    data: z.infer<typeof UpdateAssignmentStatusSchema>,
  ) => {
    const [updated] = await db
      .update(examCandidates)
      .set({
        assignmentStatus: data.assignmentStatus,
      })
      .where(
        and(
          eq(examCandidates.examId, examId),
          eq(examCandidates.candidateId, candidateId),
        ),
      )
      .returning();
    return updated ?? null;
  },
};
