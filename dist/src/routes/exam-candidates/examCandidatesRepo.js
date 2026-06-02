import { db } from "@/src/db/index.js";
import { examCandidates, } from "@/src/db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { APIError } from "better-auth";
export const examCandidatesRepo = {
    listCandidates: async (examId) => {
        return await db
            .select()
            .from(examCandidates)
            .where(eq(examCandidates.examId, examId))
            .orderBy(examCandidates.assignedAt);
    },
    assignCandidates: async (examId, data) => {
        const existing = await db
            .select({ candidateId: examCandidates.candidateId })
            .from(examCandidates)
            .where(inArray(examCandidates.candidateId, data.candidates.map((c) => c.candidateId)));
        const existingIds = new Set(existing.map((r) => r.candidateId));
        const inserts = data.candidates
            .filter((c) => !existingIds.has(c.candidateId))
            .map((c) => ({
            examId,
            candidateId: c.candidateId,
            assignmentStatus: c.assignmentStatus ?? "ASSIGNED",
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
    unassignCandidate: async (examId, candidateId) => {
        const [deleted] = await db
            .delete(examCandidates)
            .where(and(eq(examCandidates.examId, examId), eq(examCandidates.candidateId, candidateId)))
            .returning();
        return deleted ?? null;
    },
    findAssignment: async (examId, candidateId) => {
        const rows = await db
            .select()
            .from(examCandidates)
            .where(and(eq(examCandidates.examId, examId), eq(examCandidates.candidateId, candidateId)));
        return rows.at(0) ?? null;
    },
    updateStatus: async (examId, candidateId, data) => {
        const [updated] = await db
            .update(examCandidates)
            .set({
            assignmentStatus: data.assignmentStatus,
        })
            .where(and(eq(examCandidates.examId, examId), eq(examCandidates.candidateId, candidateId)))
            .returning();
        return updated ?? null;
    },
};
