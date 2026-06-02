import { createFactory } from "hono/factory";
import { gradingRepo } from "./grading.Repo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { APIError } from "better-auth";
import {
  GradingQueueQuerySchema,
  GradeAnswerBodySchema,
  FinalizeGradingSchema,
} from "./schma.js";

const factory = createFactory();

// ── GET   /api/grading/queue                # Attempts with status=SUBMITTED needing manual review
export const getGradingQueue = factory.createHandlers(
  sValidator("query", GradingQueueQuerySchema),
  async (c) => {
    const { examId, limit, offset } = c.req.valid("query");
    const userId = c.get("user").id;
    const role = c.get("user").role;

    // Authorization: Only ADMIN can access grading queue
    if (role !== "ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Access denied",
        status: 403,
      });
    }

    try {
      const queue = await gradingRepo.getGradingQueue({
        examId,
        limit,
        offset,
      });
      return c.json({ data: queue, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch grading queue",
        cause: err,
      });
    }
  },
);

// ── GET   /api/grading/:attemptId           # Full attempt with all answers for review
export const getAttemptForReview = factory.createHandlers(
  sValidator("param", z.object({ attemptId: z.uuid() })),
  async (c) => {
    const { attemptId } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;

    // Authorization: Only ADMIN can access grading details
    if (role !== "ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Access denied",
        status: 403,
      });
    }

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

// ── PATCH /api/grading/:attemptId/answers/:answerId   # { isCorrect, awardedPoints, reviewerFeedback }
export const updateAnswerGrading = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      attemptId: z.uuid(),
      answerId: z.uuid(),
    }),
  ),
  sValidator("json", GradeAnswerBodySchema),
  async (c) => {
    const { attemptId, answerId } = c.req.valid("param");
    const { isCorrect, awardedPoints, reviewerFeedback } = c.req.valid("json");
    const userId = c.get("user").id;
    const role = c.get("user").role;

    // Authorization: Only ADMIN can update grading
    if (role !== "ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Access denied",
        status: 403,
      });
    }

    try {
      const updatedAnswer = await gradingRepo.updateAnswerGrading(
        attemptId,
        answerId,
        { isCorrect, awardedPoints, reviewerFeedback },
      );
      return c.json({ data: updatedAnswer, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update answer grading",
        cause: err,
      });
    }
  },
);

// ── POST  /api/grading/:attemptId/finalize  # Set status=GRADED, compute final score, set passed flag
export const finalizeGrading = factory.createHandlers(
  sValidator("param", z.object({ attemptId: z.uuid() })),
  sValidator("json", FinalizeGradingSchema),
  async (c) => {
    const { attemptId } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;

    // Authorization: Only ADMIN can finalize grading
    if (role !== "ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Access denied",
        status: 403,
      });
    }

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
