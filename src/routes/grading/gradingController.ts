import { type Context } from "hono";
import { createFactory } from "hono/factory";
import { gradingRepo } from "./grading.Repo.js";
import {
  AttemptQuestionIdParamSchema,
  AnswerIdParamSchema,
  ExamAttemptIdParamSchema,
  AttemptIdParamSchema,
  SubmitAnswerSchema,
  UpdateAnswerSchema,
  GradeAnswerSchema,
  BulkGradeSchema,
  AnswerStatisticsQuerySchema,
  GradingQueueQuerySchema,
  FinalizeGradingSchema,
} from "./schema.js";
import { sValidator } from "@hono/standard-validator";
import { APIError } from "better-auth";
import { isAdmin } from "@/src/lib/roles.js";

const factory = createFactory();

type AuthUser = { id: string; role: string };

const getAuthUser = (c: Context): AuthUser => {
  const user = c.get("user");
  if (!user)
    throw new APIError("UNAUTHORIZED", {
      message: "Authentication required",
      status: 401,
    });
  return user as AuthUser;
};

/** Reviewer-only endpoints. */
const assertAdmin = (c: Context): AuthUser => {
  const user = getAuthUser(c);
  if (!isAdmin(user.role))
    throw new APIError("FORBIDDEN", {
      message: "Admin access required",
      status: 403,
    });
  return user;
};

/* ─────────────────────────────────────────────────────────────────────────
 * Answer capture (candidate, during the exam)
 * ───────────────────────────────────────────────────────────────────────── */

// POST /attempt-questions/:attemptQuestionId/answers
export const submitAnswer = factory.createHandlers(
  sValidator("param", AttemptQuestionIdParamSchema),
  sValidator("json", SubmitAnswerSchema),
  async (c) => {
    const { attemptQuestionId } = c.req.valid("param");
    try {
      const answer = await gradingRepo.submitAnswer(
        attemptQuestionId,
        c.req.valid("json"),
      );
      return c.json({
        data: answer,
        success: true,
        message: "Answer submitted successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to submit answer",
        cause: err,
      });
    }
  },
);

// GET /attempt-questions/:attemptQuestionId/answer
export const getSavedAnswer = factory.createHandlers(
  sValidator("param", AttemptQuestionIdParamSchema),
  async (c) => {
    const { attemptQuestionId } = c.req.valid("param");
    try {
      const answer = await gradingRepo.getSavedAnswer(attemptQuestionId);
      if (!answer)
        throw new APIError("NOT_FOUND", {
          message: "No saved answer found for this question",
          status: 404,
        });
      return c.json({ data: answer, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch answer",
        cause: err,
      });
    }
  },
);

// GET /exam-attempts/:examAttemptId/answers
export const getAllAttemptAnswers = factory.createHandlers(
  sValidator("param", ExamAttemptIdParamSchema),
  async (c) => {
    const { examAttemptId } = c.req.valid("param");
    try {
      const answers = await gradingRepo.getAllAttemptAnswers(examAttemptId);
      return c.json({ data: answers, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch attempt answers",
        cause: err,
      });
    }
  },
);

// PATCH /answers/:answerId  → update answer content (re-auto-grades objective)
export const updateAnswer = factory.createHandlers(
  sValidator("param", AnswerIdParamSchema),
  sValidator("json", UpdateAnswerSchema),
  async (c) => {
    const { answerId } = c.req.valid("param");
    try {
      const existing = await gradingRepo.getAnswerById(answerId);
      if (!existing)
        throw new APIError("NOT_FOUND", {
          message: "Answer not found",
          status: 404,
        });

      const answer = await gradingRepo.submitAnswer(
        existing.attemptQuestionId,
        c.req.valid("json"),
      );
      return c.json({
        data: answer,
        success: true,
        message: "Answer updated successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to update answer",
        cause: err,
      });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────
 * Manual grading (reviewer)
 * ───────────────────────────────────────────────────────────────────────── */

// PATCH /answers/:answerId/grade
export const gradeAnswer = factory.createHandlers(
  sValidator("param", AnswerIdParamSchema),
  sValidator("json", GradeAnswerSchema),
  async (c) => {
    const { answerId } = c.req.valid("param");
    const reviewer = assertAdmin(c);
    try {
      const graded = await gradingRepo.gradeAnswer(
        answerId,
        c.req.valid("json"),
        reviewer.id,
      );
      if (!graded)
        throw new APIError("NOT_FOUND", {
          message: "Answer not found",
          status: 404,
        });
      return c.json({
        data: graded,
        success: true,
        message: "Answer graded successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to grade answer",
        cause: err,
      });
    }
  },
);

// POST /answers/bulk-grade
export const bulkGradeAnswers = factory.createHandlers(
  sValidator("json", BulkGradeSchema),
  async (c) => {
    const reviewer = assertAdmin(c);
    const { grades } = c.req.valid("json");
    try {
      const graded = await gradingRepo.bulkGradeAnswers(grades, reviewer.id);
      return c.json({
        data: graded,
        success: true,
        message: `${graded.length} answer(s) graded successfully.`,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to bulk grade answers",
        cause: err,
      });
    }
  },
);

// GET /answers/statistics
export const getAnswerStatistics = factory.createHandlers(
  sValidator("query", AnswerStatisticsQuerySchema),
  async (c) => {
    assertAdmin(c);
    const { examAttemptId, attemptQuestionId } = c.req.valid("query");
    try {
      const stats = await gradingRepo.getAnswerStatistics({
        examAttemptId,
        attemptQuestionId,
      });
      return c.json({ data: stats, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch statistics",
        cause: err,
      });
    }
  },
);

/* ─────────────────────────────────────────────────────────────────────────
 * Grading workflow (reviewer)
 * ───────────────────────────────────────────────────────────────────────── */

// GET /queue
export const getGradingQueue = factory.createHandlers(
  sValidator("query", GradingQueueQuerySchema),
  async (c) => {
    assertAdmin(c);
    const { examId, limit, offset } = c.req.valid("query");
    try {
      const queue = await gradingRepo.getGradingQueue({
        examId,
        limit,
        offset,
      });
      return c.json({
        data: queue,
        success: true,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch grading queue",
        cause: err,
      });
    }
  },
);

// GET /:attemptId
export const getAttemptForReview = factory.createHandlers(
  sValidator("param", AttemptIdParamSchema),
  async (c) => {
    assertAdmin(c);
    const { attemptId } = c.req.valid("param");
    try {
      const attemptData = await gradingRepo.getAttemptForReview(attemptId);
      return c.json({ data: attemptData, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch attempt for review",
        cause: err,
      });
    }
  },
);

// POST /:attemptId/finalize
export const finalizeGrading = factory.createHandlers(
  sValidator("param", AttemptIdParamSchema),
  sValidator("json", FinalizeGradingSchema),
  async (c) => {
    assertAdmin(c);
    const { attemptId } = c.req.valid("param");
    try {
      const result = await gradingRepo.finalizeGrading(attemptId);
      return c.json({
        data: result,
        success: true,
        message: "Grading finalized successfully",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to finalize grading",
        cause: err,
      });
    }
  },
);
