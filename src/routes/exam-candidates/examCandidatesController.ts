import { createFactory } from "hono/factory";
import { examCandidatesRepo } from "./examCandidatesRepo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import {
  ListExamCandidatesSchema,
  AssignCandidatesSchema,
  UnassignCandidateSchema,
  UpdateAssignmentStatusSchema,
} from "./schema.js";
import { APIError } from "better-auth";
import { hasPermission } from "@/src/middleware/auth.js";
import { userRepo } from "../users/usersRepo.js";

const factory = createFactory();

// ── GET  /exams/:examId/candidates               → list assigned candidates ─
export const listCandidates = factory.createHandlers(
  hasPermission({
    resource: "candidate",
    action: "list",
  }),
  sValidator("param", z.object({ examId: z.uuid() })),
  async (c) => {
    const examId = c.req.valid("param").examId;
    try {
      const rows = await examCandidatesRepo.listCandidates(examId);
      return c.json({ data: rows, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list candidates",
        cause: err,
      });
    }
  },
);

// ── POST /exams/:examId/candidates               → assign candidates ─────────
export const assignCandidates = factory.createHandlers(
  hasPermission({
    resource: "candidate",
    action: "assign_exam",
  }),
  sValidator("param", z.object({ examId: z.uuid() })),
  sValidator("json", AssignCandidatesSchema),
  async (c) => {
    const examId = c.req.valid("param").examId;
    const body = c.req.valid("json");
    try {
      const inserted = await examCandidatesRepo.assignCandidates(examId, body);
      const skipped = body.candidates.length - inserted.length;
      return c.json({
        data: inserted,
        success: true,
        message:
          skipped > 0
            ? `${inserted.length} candidate(s) assigned, ${skipped} already existed.`
            : `${inserted.length} candidate(s) assigned successfully.`,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to assign candidates",
        cause: err,
      });
    }
  },
);

// ── PATCH /exam-candidates/:examId/:candidateId/status → update assignment status
export const updateAssignmentStatus = factory.createHandlers(
  hasPermission({
    resource: "candidate",
    action: "assign_exam",
  }),
  sValidator(
    "param",
    z.object({
      examId: z.uuid(),
      candidateId: z.uuid(),
    }),
  ),
  sValidator("json", UpdateAssignmentStatusSchema),
  async (c) => {
    const { examId, candidateId } = c.req.valid("param");
    const { assignmentStatus } = c.req.valid("json");

    try {
      const existing = await examCandidatesRepo.findAssignment(
        examId,
        candidateId,
      );
      if (!existing)
        throw new APIError("NOT_FOUND", {
          message: "Assignment not found",
          status: 404,
        });

      const updated = await examCandidatesRepo.updateStatus(
        examId,
        candidateId,
        { assignmentStatus },
      );
      return c.json({
        data: updated,
        success: true,
        message: `Assignment status updated to ${assignmentStatus}.`,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update assignment status",
        cause: err,
      });
    }
  },
);

// ── DELETE /exams/:examId/candidates/:candidateId → unassign candidate ───────
export const unassignCandidate = factory.createHandlers(
  hasPermission({
    resource: "candidate",
    action: "unassign_exam",
  }),
  sValidator(
    "param",
    z.object({
      examId: z.uuid(),
      candidateId: z.string(),
    }),
  ),
  async (c) => {
    const examId = c.req.valid("param").examId;
    const candidateId = c.req.valid("param").candidateId;

    try {
      const existing = await examCandidatesRepo.findAssignment(
        examId,
        candidateId,
      );
      if (!existing)
        throw new APIError("NOT_FOUND", {
          message: "Assignment not found",
          status: 404,
        });

      await examCandidatesRepo.unassignCandidate(examId, candidateId);
      return c.json({
        data: null,
        success: true,
        message: "Candidate unassigned successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to unassign candidate",
        cause: err,
      });
    }
  },
);

export const autoAssignCandidates = factory.createHandlers(
  hasPermission({
    resource: "candidate",
    action: "assign_exam",
  }),
  sValidator("param", z.object({ examId: z.uuid() })),
  sValidator(
    "json",
    z.object({
      total: z.coerce.number(),
    }),
  ),
  async (c) => {
    const examId = c.req.valid("param").examId;
    const { total } = c.req.valid("json");
    try {
      let candidates: { password: string; id: string; username: string }[] = [];
      for (let i = 0; i < Number(total); i++) {
        const generateCandidate = await userRepo.generateFakeCandidate(c);
        candidates.push({
          ...generateCandidate,
        });
      }
      const inserted = await examCandidatesRepo.assignCandidates(examId, {
        candidates: candidates.map((c) => ({
          candidateId: c.id,
          assignmentStatus: "ASSIGNED",
        })),
      });
      const skipped = candidates.length - inserted.length;
      return c.json({
        data: inserted.map((c) => ({
          ...c,
          password: candidates.find((can) => can.id === c.candidateId)
            ?.password,
          username: candidates.find((can) => can.id === c.candidateId)
            ?.username,
        })),
        success: true,
        message:
          skipped > 0
            ? `${inserted.length} candidate(s) assigned, ${skipped} already existed.`
            : `${inserted.length} candidate(s) assigned successfully.`,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to assign candidates",
        cause: err,
      });
    }
  },
);
