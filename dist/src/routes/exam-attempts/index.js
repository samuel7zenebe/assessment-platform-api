import { Hono } from "hono";
import { listAttempts, getAttempt, startExam, submitAttempt, expireAttempt, getAttemptResult, getAttemptReview, } from "./examAttemptsController.js";
export const examAttemptsRouter = new Hono()
    // ── List / detail ─────────────────────────────────────────────────────────
    .get("/", ...listAttempts)
    .get("/:attemptId", ...getAttempt)
    // ── Exam lifecycle ────────────────────────────────────────────────────────
    .post("/exams/:examId/start", ...startExam)
    // ── Attempt lifecycle ─────────────────────────────────────────────────────
    .post("/:attemptId/submit", ...submitAttempt)
    .patch("/:attemptId/expire", ...expireAttempt)
    // ── Result / review ───────────────────────────────────────────────────────
    .get("/:attemptId/result", ...getAttemptResult)
    .get("/:attemptId/review", ...getAttemptReview);
