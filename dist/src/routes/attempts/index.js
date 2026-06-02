import { Hono } from "hono";
import { createAttempt, getAttempt, getQuestionByOrder, markViewed, upsertAnswer, submitAttempt, getResults, } from "./attemptsController.js";
export const attemptsRouter = new Hono()
    // ── Create attempt ─────────────────────────────────────────────────────────
    .post("/", ...createAttempt)
    // ── Attempt detail and questions ───────────────────────────────────────────
    .get("/:id", ...getAttempt)
    .get("/:id/questions/:order", ...getQuestionByOrder)
    // ── Interaction during exam ────────────────────────────────────────────────
    .post("/:id/questions/:order/view", ...markViewed)
    .post("/:id/questions/:order/answer", ...upsertAnswer)
    // ── Submission ───────────────────────────────────────────────────────────
    .post("/:id/submit", ...submitAttempt)
    // ── Results (only after GRADED) ──────────────────────────────────────────
    .get("/:id/results", ...getResults);
