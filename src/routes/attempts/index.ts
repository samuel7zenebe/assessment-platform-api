import { Hono } from "hono";

import {
  createAttempt,
  getAttempt,
  getQuestionByOrder,
  markViewed,
  upsertAnswer,
  submitAttempt,
  getResults,
} from "./attemptsController.js";

export const attemptsRouter = new Hono()
  // ── Create attempt ─────────────────────────────────────────────────────────
  .post("/", ...createAttempt)
  // ── Attempt detail and questions ───────────────────────────────────────────
  .get("/:attemptId", ...getAttempt)
  .get("/:id/questions/:order", ...getQuestionByOrder)
  // ── Interaction during exam ────────────────────────────────────────────────
  .post("/:attemptId/questions/:order/view", ...markViewed)
  .post("/:attemptId/questions/:order/answer", ...upsertAnswer)
  // ── Submission ───────────────────────────────────────────────────────────
  .post("/:attemptId/submit", ...submitAttempt)
  // ── Results (only after GRADED) ──────────────────────────────────────────
  .get("/:attemptId/results", ...getResults);
