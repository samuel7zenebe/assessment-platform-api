import { Hono } from "hono";
import { getExamSummary, getExamQuestionAnalytics, getCandidateAnalytics, getPlatformOverview, } from "./analyticsController.js";
export const analyticsRouter = new Hono()
    // ── Exam analytics ───────────────────────────────────────────────────────
    .get("/exams/:id/summary", ...getExamSummary)
    .get("/exams/:id/questions", ...getExamQuestionAnalytics)
    // ── Candidate analytics ──────────────────────────────────────────────────
    .get("/candidates/:id", ...getCandidateAnalytics)
    // ── Platform overview ────────────────────────────────────────────────────
    .get("/overview", ...getPlatformOverview);
