import { createFactory } from "hono/factory";
import { analyticsRepo } from "./analytics.Repo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { APIError } from "better-auth";
import { ExamAnalyticsSummarySchema, ExamAnalyticsQuestionsSchema, CandidateAnalyticsSchema, PlatformOverviewSchema, } from "./schma.js";
const factory = createFactory();
// ── GET  /api/analytics/exams/:id/summary     # Pass rate, avg score, completion rate
export const getExamSummary = factory.createHandlers(sValidator("param", z.object({ id: z.uuid() })), sValidator("query", ExamAnalyticsSummarySchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    // Authorization: Only ADMIN can access analytics
    if (role !== "ADMIN") {
        throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
    }
    try {
        const summary = await analyticsRepo.getExamSummary(id);
        return c.json({ data: summary, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to fetch exam analytics summary",
            cause: err
        });
    }
});
// Since we don't have full implementations for the other analytics functions yet,
// we'll return placeholder responses or 501 Not Implemented
export const getExamQuestionAnalytics = factory.createHandlers(sValidator("param", z.object({ id: z.uuid() })), sValidator("query", ExamAnalyticsQuestionsSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    // Authorization: Only ADMIN can access analytics
    if (role !== "ADMIN") {
        throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
    }
    // Placeholder response - not yet implemented
    return c.json({ data: [], success: true });
});
export const getCandidateAnalytics = factory.createHandlers(sValidator("param", z.object({ id: z.string() })), sValidator("query", CandidateAnalyticsSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    // Authorization: ADMIN can access any candidate's analytics
    // CANDIDATE can only access their own analytics
    if (role !== "ADMIN" && id !== userId) {
        throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
    }
    // Placeholder response - not yet implemented
    return c.json({
        data: {
            candidateId: id,
            totalExamsTaken: 0,
            examsPassed: 0,
            passRate: 0,
            averageScore: 0,
            examHistory: [],
        },
        success: true
    });
});
export const getPlatformOverview = factory.createHandlers(sValidator("query", PlatformOverviewSchema), async (c) => {
    const userId = c.get("user").id;
    const role = c.get("user").role;
    // Authorization: Only ADMIN can access platform overview
    if (role !== "ADMIN") {
        throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
    }
    // Placeholder response - not yet implemented
    return c.json({
        data: {
            totalUsers: 0,
            totalExams: 0,
            totalAttempts: 0,
            gradedAttempts: 0,
            passedAttempts: 0,
            passRate: 0,
            averageScore: 0,
        },
        success: true
    });
});
