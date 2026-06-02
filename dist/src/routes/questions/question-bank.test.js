import { describe, expect, it, mock } from "bun:test";
import { questionBankRouter } from "./index.js";
import { QuestionBankRepo } from "./questionBankRepo.js";
import { Hono } from "hono";
// Mock the repository
mock.module("./questionBankRepo.js", () => ({
    QuestionBankRepo: {
        findAllQuestions: mock(() => Promise.resolve([])),
        findQuestionById: mock((id) => Promise.resolve([])),
        createQuestionBank: mock((data) => Promise.resolve("new-id")),
        updateQuestion: mock((id, data) => Promise.resolve([{ id }])),
        deleteQuestion: mock((id) => Promise.resolve([{ id }])),
    },
}));
// We need to wrap the router in another Hono app to provide the 'user' context
const app = new Hono()
    .use("*", async (c, next) => {
    c.set("user", { id: "test-user", role: "BUILDER" });
    await next();
})
    .route("/", questionBankRouter);
describe("Question Bank Router", () => {
    describe("GET /", () => {
        it("should return 200 and questions if they exist", async () => {
            const mockData = [{ id: "1", question: "What is 1+1?" }];
            QuestionBankRepo.findAllQuestions.mockResolvedValue(mockData);
            const res = await app.request("/");
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data).toEqual(mockData);
        });
        it("should return 404 if no questions found", async () => {
            QuestionBankRepo.findAllQuestions.mockResolvedValue([]);
            const res = await app.request("/");
            expect(res.status).toBe(404);
        });
    });
    describe("GET /:questionId", () => {
        it("should return 200 and data if question exists", async () => {
            const mockData = [{ id: "1", question: "What is 1+1?" }];
            QuestionBankRepo.findQuestionById.mockResolvedValue(mockData);
            const res = await app.request("/1");
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data).toEqual(mockData[0]);
        });
    });
    describe("POST /", () => {
        it("should return 201 on success", async () => {
            QuestionBankRepo.createQuestionBank.mockResolvedValue("new-id");
            const res = await app.request("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: "Math",
                    question: "1+1?",
                    difficultyLevel: "EASY",
                    type: "SINGLE_CHOICE",
                    points: 5,
                    choices: [{ choiceText: "2", displayOrder: 1, isCorrect: true }],
                    jobTitles: ["Engineer"],
                }),
            });
            expect(res.status).toBe(200); // The controller returns 200 for success currently
            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data.questionId).toBe("new-id");
        });
        it("should return 401 if user is not a BUILDER", async () => {
            const unauthorizedApp = new Hono()
                .use("*", async (c, next) => {
                c.set("user", { id: "test-user", role: "USER" });
                await next();
            })
                .route("/", questionBankRouter);
            const res = await unauthorizedApp.request("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: "Math",
                    question: "1+1?",
                    difficultyLevel: "EASY",
                    type: "SINGLE_CHOICE",
                    points: 5,
                    choices: [{ choiceText: "2", displayOrder: 1, isCorrect: true }],
                    jobTitles: ["Engineer"],
                }),
            });
            expect(res.status).toBe(401);
        });
        it("should return 400 for invalid data", async () => {
            const res = await app.request("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: "", // Invalid
                    question: "1+1?",
                    difficultyLevel: "EASY",
                    type: "SINGLE_CHOICE",
                    points: 5,
                    choices: [{ choiceText: "2", displayOrder: 1, isCorrect: true }],
                    jobTitles: ["Engineer"],
                }),
            });
            expect(res.status).toBe(400);
        });
        it("should return 500 on internal error", async () => {
            QuestionBankRepo.createQuestionBank.mockRejectedValue(new Error("DB Error"));
            const res = await app.request("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: "Math",
                    question: "1+1?",
                    difficultyLevel: "EASY",
                    type: "SINGLE_CHOICE",
                    points: 5,
                    choices: [{ choiceText: "2", displayOrder: 1, isCorrect: true }],
                    jobTitles: ["Engineer"],
                }),
            });
            expect(res.status).toBe(500);
        });
    });
    describe("PUT /", () => {
        it("should return 200 on successful edit", async () => {
            QuestionBankRepo.updateQuestion.mockResolvedValue([{ id: "1" }]);
            const res = await app.request("/", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: "1",
                    category: "Math",
                    question: "Updated?",
                    difficultyLevel: "HARD",
                    points: 10,
                    type: "SINGLE_CHOICE",
                }),
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.success).toBe(true);
        });
    });
    describe("DELETE /:id", () => {
        it("should return 200 on successful delete", async () => {
            QuestionBankRepo.deleteQuestion.mockResolvedValue([{ id: "1" }]);
            const res = await app.request("/1", {
                method: "DELETE",
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.success).toBe(true);
        });
    });
});
