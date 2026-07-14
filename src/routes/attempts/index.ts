import { Hono } from "hono";

import {
  createAttempt,
  getAttempt,
  getQuestionByOrder,
  markViewed,
  upsertAnswer,
  submitAttempt,
  getResults,
  markFlagged,
} from "./attemptsController.js";

export const attemptsRouter = new Hono()
  // ── Create attempt ─────────────────────────────────────────────────────────
  .post("/", ...createAttempt)
  // ── Attempt detail and questions ───────────────────────────────────────────
  .get("/:attemptId", ...getAttempt)
  .get("/:attemptId/questions/:order", ...getQuestionByOrder)
  // ── Interaction during exam ────────────────────────────────────────────────
  .post("/:attemptId/questions/:order/view", ...markViewed)
  .post("/:attemptId/questions/:order/toggle-flag", ...markFlagged)
  .post("/:attemptId/questions/:order/answer", ...upsertAnswer)
  // ── Submission ───────────────────────────────────────────────────────────
  .post("/:attemptId/submit", ...submitAttempt)
  // ── Results exa(only after GRADED) ──────────────────────────────────────────
  .get("/:attemptId/results", ...getResults);
