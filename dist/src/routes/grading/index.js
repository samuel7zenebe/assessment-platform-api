import { Hono } from "hono";
import { getGradingQueue, getAttemptForReview, updateAnswerGrading, finalizeGrading, } from "./gradingController.js";
export const gradingRouter = new Hono()
    // ── Grading queue ─────────────────────────────────────────────────────────
    .get("/queue", ...getGradingQueue)
    // ── Attempt review ───────────────────────────────────────────────────────
    .get("/:attemptId", ...getAttemptForReview)
    // ── Answer grading ───────────────────────────────────────────────────────
    .patch("/:attemptId/answers/:answerId", ...updateAnswerGrading)
    // ── Finalize grading ─────────────────────────────────────────────────────
    .post("/:attemptId/finalize", ...finalizeGrading);
