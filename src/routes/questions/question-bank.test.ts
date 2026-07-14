import { describe, expect, it, mock } from "bun:test";
import { questionBankRouter } from "./index.js";
import { QuestionBankRepo } from "./questionBankRepo.js";
import { Hono } from "hono";

// Mock the repository
mock.module("./questionBankRepo.js", () => ({
  QuestionBankRepo: {
    findAllQuestions: mock(() => Promise.resolve([])),
    findQuestionById: mock((id: string) => Promise.resolve([])),
    createQuestionBank: mock((data: any) => Promise.resolve("new-id")),
    updateQuestion: mock((id: string, data: any) => Promise.resolve([{ id }])),
    deleteQuestion: mock((id: string) => Promise.resolve([{ id }])),
  },
}));

// Mock the database for permission checks
mock.module("@/src/db/index.js", () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() =>
          Promise.resolve([{ id: "perm-1", permission: "VIEW" }]),
        ),
      })),
    })),
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
      (QuestionBankRepo.findAllQuestions as any).mockResolvedValue(mockData);

      const res = await app.request("/");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual(mockData);
    });
  });

  describe("GET /:questionId", () => {
    it("should return 200 and data if question exists", async () => {
      const mockData = [{ id: "1", question: "What is 1+1?" }];
      (QuestionBankRepo.findQuestionById as any).mockResolvedValue(mockData);

      const res = await app.request("/1");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual(mockData[0]);
    });
  });

  describe("POST /", () => {
    it("should return 200 on success", async () => {
      (QuestionBankRepo.createQuestionBankRecord as any).mockResolvedValue(
        "new-id",
      );

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

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.questionId).toBe("new-id");
    });
  });

  describe("PUT /", () => {
    it("should return 200 on successful edit", async () => {
      (QuestionBankRepo.updateQuestion as any).mockResolvedValue([{ id: "1" }]);

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
      (QuestionBankRepo.deleteQuestion as any).mockResolvedValue([{ id: "1" }]);

      const res = await app.request("/1", {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});