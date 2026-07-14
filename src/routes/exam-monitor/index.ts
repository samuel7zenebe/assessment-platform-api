import { Hono } from "hono";
import { getExamMonitor } from "./examMonitorController.js";

/**
 * Live exam monitoring (admin/reviewer).
 *
 * Returns a real-time aggregation of every candidate's progress, live score,
 * and per-question timing inside a single exam. Intended to be polled by a
 * proctor dashboard every few seconds.
 *
 * Mounted at `/api/exam-monitor`.
 */
export const examMonitorRouter = new Hono().get("/:id", ...getExamMonitor);
