import { createFactory } from "hono/factory";
import { examAttemptsRepo } from "./examAttemptsRepo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { ListAttemptsQuerySchema, StartExamSchema, AttemptIdParamSchema, SubmitAttemptSchema, AttemptReviewQuerySchema, } from "./schema.js";
import { APIError } from "better-auth";
const factory = createFactory();
// ── GET   /exam-attempts               → list attempts ──────────────────────
export const listAttempts = factory.createHandlers(sValidator("query", ListAttemptsQuerySchema), async (c) => {
    const { examId, candidateId, status } = c.req.valid("query");
    try {
        const data = await examAttemptsRepo.listAttempts({ examId, candidateId, status });
        return c.json({ data, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to list attempts", cause: err });
    }
});
// ── GET   /exam-attempts/:attemptId    → get attempt ─────────────────────────
export const getAttempt = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    try {
        const attempt = await examAttemptsRepo.getAttemptById(attemptId);
        if (!attempt)
            throw new APIError("NOT_FOUND", { message: "Attempt not found", status: 404 });
        return c.json({ data: attempt, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch attempt", cause: err });
    }
});
// ── POST  /exams/:examId/start         → start exam ─────────────────────────
export const startExam = factory.createHandlers(sValidator("param", z.object({ examId: z.uuid() })), sValidator("json", StartExamSchema), async (c) => {
    const examId = c.req.valid("param").examId;
    const body = c.req.valid("json");
    try {
        const candidateId = c.get("user").id;
        const [attempt] = await examAttemptsRepo.listAttempts({ examId, candidateId });
        const attemptNumber = body.attemptNumber ?? (attempt?.attemptNumber ?? 0) + 1;
        const data = await examAttemptsRepo.startExam({ examId, candidateId, attemptNumber });
        return c.json({ data, success: true, message: "Exam started successfully." });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to start exam", cause: err });
    }
});
// ── POST  /exam-attempts/:attemptId/submit → submit exam ────────────────────
export const submitAttempt = factory.createHandlers(sValidator("param", AttemptIdParamSchema), sValidator("json", SubmitAttemptSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    try {
        const existing = await examAttemptsRepo.getAttemptById(attemptId);
        if (!existing)
            throw new APIError("NOT_FOUND", { message: "Attempt not found", status: 404 });
        if (existing.status !== "IN_PROGRESS") {
            throw new APIError("BAD_REQUEST", {
                message: `Attempt is already ${existing.status}`,
                status: 400,
            });
        }
        const data = await examAttemptsRepo.submitAttempt(attemptId);
        return c.json({ data, success: true, message: "Exam submitted successfully." });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to submit exam", cause: err });
    }
});
// ── PATCH /exam-attempts/:attemptId/expire → expire attempt ─────────────────
export const expireAttempt = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    try {
        const existing = await examAttemptsRepo.getAttemptById(attemptId);
        if (!existing)
            throw new APIError("NOT_FOUND", { message: "Attempt not found", status: 404 });
        const data = await examAttemptsRepo.expireAttempt(attemptId);
        return c.json({ data, success: true, message: "Attempt expired successfully." });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to expire attempt", cause: err });
    }
});
// ── GET   /exam-attempts/:attemptId/result  → final result ───────────────────
export const getAttemptResult = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    try {
        const result = await examAttemptsRepo.getResult(attemptId);
        return c.json({ data: result, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch result", cause: err });
    }
});
// ── GET   /exam-attempts/:attemptId/review  → detailed review ─────────────────
export const getAttemptReview = factory.createHandlers(sValidator("param", AttemptIdParamSchema), sValidator("query", AttemptReviewQuerySchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    try {
        const review = await examAttemptsRepo.getAttemptReview(attemptId);
        return c.json({ data: review, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch review", cause: err });
    }
});
