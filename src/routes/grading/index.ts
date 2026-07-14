import { Hono } from "hono";
import {
  // Answer capture (candidate, during the exam)
  submitAnswer,
  getSavedAnswer,
  getAllAttemptAnswers,
  updateAnswer,
  // Manual grading (reviewer)
  gradeAnswer,
  bulkGradeAnswers,
  getAnswerStatistics,
  // Grading workflow (reviewer)
  getGradingQueue,
  getAttemptForReview,
  finalizeGrading,
} from "./gradingController.js";

/**
 * Merged "grading" module.
 *
 * Combines answer capture (candidate-facing) and the grading workflow
 * (reviewer-facing) that were previously split across two routers
 * (`/attempt-questions` and `/grading`).
 *
 * Mounted at `/api/grading`.
 */
export const gradingRouter = new Hono()

  // ── Answer capture (candidate, during the exam) ──────────────────────────
  .post("/attempt-questions/:attemptQuestionId/answers", ...submitAnswer)
  .get("/attempt-questions/:attemptQuestionId/answer", ...getSavedAnswer)
  .get("/exam-attempts/:examAttemptId/answers", ...getAllAttemptAnswers)
  .patch("/answers/:answerId", ...updateAnswer)

  // ── Manual grading (reviewer) ────────────────────────────────────────────
  .patch("/answers/:answerId/grade", ...gradeAnswer)
  .post("/answers/bulk-grade", ...bulkGradeAnswers)
  .get("/answers/statistics", ...getAnswerStatistics)

  // ── Grading workflow (reviewer) ──────────────────────────────────────────
  .get("/queue", ...getGradingQueue)
  .get("/:attemptId", ...getAttemptForReview)
  .post("/:attemptId/finalize", ...finalizeGrading);
