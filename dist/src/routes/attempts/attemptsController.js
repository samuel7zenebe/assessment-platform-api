import { createFactory } from "hono/factory";
import { attemptsRepo } from "./attempts.Repo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { APIError } from "better-auth";
import { CreateAttemptBodySchema, AttemptIdParamSchema, QuestionOrderParamSchema, } from "./schma.js";
const factory = createFactory();
// ── POST   /api/attempts                     # { examId } → creates attempt + snapshots questions
export const createAttempt = factory.createHandlers(sValidator("json", CreateAttemptBodySchema), async (c) => {
    const { examId } = c.req.valid("json");
    const candidateId = c.get("user").id; // Assuming user is authenticated
    const role = c.get("user").role;
    try {
        const attempt = await attemptsRepo.createAttemptWithSnapshots({
            examId,
            candidateId,
        });
        return c.json({ data: attempt, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create attempt", cause: err });
    }
});
// ── GET    /api/attempts/:id                 # Attempt state + question list (no correct answers)
export const getAttempt = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        const attemptWithQuestions = await attemptsRepo.getAttemptWithQuestions(attemptId);
        // Authorization: CANDIDATE can only see own attempts, ADMIN can see all
        if (role === "CANDIDATE" && attemptWithQuestions.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        return c.json({ data: attemptWithQuestions, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch attempt", cause: err });
    }
});
// ── GET    /api/attempts/:id/questions/:order    # Get single question by order position
export const getQuestionByOrder = factory.createHandlers(sValidator("param", AttemptIdParamSchema), sValidator("param", QuestionOrderParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const { order } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        // First get attempt to check authorization and status
        const attempt = await attemptsRepo.getAttemptWithQuestions(attemptId);
        if (role === "CANDIDATE" && attempt.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        if (attempt.status !== "IN_PROGRESS") {
            throw new APIError("BAD_REQUEST", {
                message: `Cannot access question: attempt is ${attempt.status}`,
                status: 400,
            });
        }
        const question = await attemptsRepo.getQuestionByOrder(attemptId, order);
        return c.json({ data: question, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch question", cause: err });
    }
});
// ── POST   /api/attempts/:id/questions/:order/view  # Mark viewedAt timestamp
export const markViewed = factory.createHandlers(sValidator("param", AttemptIdParamSchema), sValidator("param", QuestionOrderParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const { order } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        // Check authorization and status
        const attempt = await attemptsRepo.getAttemptWithQuestions(attemptId);
        if (role === "CANDIDATE" && attempt.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        if (attempt.status !== "IN_PROGRESS") {
            throw new APIError("BAD_REQUEST", {
                message: `Cannot mark viewed: attempt is ${attempt.status}`,
                status: 400,
            });
        }
        const updated = await attemptsRepo.updateViewedAt(attemptId, order);
        return c.json({ data: updated, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to mark viewed", cause: err });
    }
});
// ── POST   /api/attempts/:id/questions/:order/answer # Upserts the answers row
export const upsertAnswer = factory.createHandlers(sValidator("param", AttemptIdParamSchema), sValidator("param", QuestionOrderParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const { order } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        // Check authorization and status
        const attempt = await attemptsRepo.getAttemptWithQuestions(attemptId);
        if (role === "CANDIDATE" && attempt.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        if (attempt.status !== "IN_PROGRESS") {
            throw new APIError("BAD_REQUEST", {
                message: `Cannot answer: attempt is ${attempt.status}`,
                status: 400,
            });
        }
        // Parse body based on content-type
        let answerBody;
        if (c.req.header("Content-Type")?.includes("application/json")) {
            try {
                answerBody = await c.req.json();
            }
            catch (e) {
                throw new APIError("BAD_REQUEST", { message: "Invalid JSON body", status: 400 });
            }
        }
        else {
            // For other content types, try to parse as JSON anyway (or reject)
            try {
                answerBody = await c.req.json();
            }
            catch (e) {
                throw new APIError("BAD_REQUEST", { message: "Invalid JSON body", status: 400 });
            }
        }
        const result = await attemptsRepo.upsertAnswer(attemptId, order, answerBody);
        return c.json({ data: result, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to upsert answer", cause: err });
    }
});
// ── POST   /api/attempts/:id/submit          # Lock attempt, auto-grade objective Qs, set status=SUBMITTED
export const submitAttempt = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        // Check authorization and status
        const attempt = await attemptsRepo.getAttemptWithQuestions(attemptId);
        if (role === "CANDIDATE" && attempt.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        if (attempt.status !== "IN_PROGRESS") {
            throw new APIError("BAD_REQUEST", {
                message: `Cannot submit: attempt is ${attempt.status}`,
                status: 400,
            });
        }
        const result = await attemptsRepo.submitAttemptWithAutoGrade(attemptId);
        return c.json({ data: result, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to submit attempt", cause: err });
    }
});
// ── GET    /api/attempts/:id/results         # Score, pass/fail, per-question breakdown (only after GRADED)
export const getResults = factory.createHandlers(sValidator("param", AttemptIdParamSchema), async (c) => {
    const { attemptId } = c.req.valid("param");
    const userId = c.get("user").id;
    const role = c.get("user").role;
    try {
        // Check authorization
        const attempt = await attemptsRepo.getAttemptWithQuestions(attemptId);
        if (role === "CANDIDATE" && attempt.candidateId !== userId) {
            throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
        }
        if (attempt.status !== "GRADED") {
            throw new APIError("BAD_REQUEST", {
                message: "Results are only available after grading",
                status: 400,
            });
        }
        const results = await attemptsRepo.getResults(attemptId);
        return c.json({ data: results, success: true });
    }
    catch (err) {
        if (err instanceof APIError)
            throw err;
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch results", cause: err });
    }
});
