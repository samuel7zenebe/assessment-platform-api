import { createFactory } from "hono/factory";
import { attemptQuestionAnswerRepo } from "./attemptQuestionAnswers.repo.js";
import { db } from "@/src/db/index.js";
import { attemptQuestions } from "@/src/db/schema.js";
import { SubmitAnswerSchema, UpdateAnswerSchema, GradeAnswerSchema, BulkGradeSchema } from "./schema.js";
import { sValidator } from "@hono/standard-validator";
import { APIError } from "better-auth";
import { eq, and } from "drizzle-orm";

const factory = createFactory();

export const submitAnswer = factory.createHandlers(
  sValidator("json", SubmitAnswerSchema),
  async (c) => {
    const data = c.req.valid("json");
    try {
      const [attemptQ] = await db
        .select({ attemptId: attemptQuestions.attemptId })
        .from(attemptQuestions)
        .where(eq(attemptQuestions.id, data.attemptQuestionId));

      if (!attemptQ) throw new APIError("NOT_FOUND", { message: "Attempt question not found" });

      const existing = await attemptQuestionAnswerRepo.getSavedAnswer(data.attemptQuestionId);
      if (existing) throw new APIError("CONFLICT", { message: "Answer already submitted for this question", code: "409" });

      const answer = await attemptQuestionAnswerRepo.submitAnswer({ ...data, attemptId: attemptQ.attemptId });
      return c.json({ data: answer, success: true, message: "Answer submitted successfully." });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", { message: "Failed to submit answer", cause: err });
    }
  },
);

export const getSavedAnswer = factory.createHandlers(
  async (c) => {
    const attemptQuestionId = c.req.param("id");
    if (!attemptQuestionId) throw new APIError(400, { message: "Missing attempt question id" });

    try {
      const answer = await attemptQuestionAnswerRepo.getSavedAnswer(attemptQuestionId);
      if (!answer) throw new APIError(404, { message: "No saved answer found for this question" });
      return c.json({ data: answer, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch answer", cause: err });
    }
  },
);

export const getAllAttemptAnswers = factory.createHandlers(
  async (c) => {
    const attemptId = c.req.param("id");
    if (!attemptId) throw new APIError(400, { message: "Missing attempt id" });

    try {
      const answers = await attemptQuestionAnswerRepo.getAllAttemptAnswers(attemptId);
      return c.json({ data: answers, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch attempt answers", cause: err });
    }
  },
);

export const updateAnswer = factory.createHandlers(
  sValidator("json", UpdateAnswerSchema),
  async (c) => {
    const answerId = c.req.param("id");
    if (!answerId) throw new APIError(400, { message: "Missing answer id" });

    try {
      const answer = await attemptQuestionAnswerRepo.updateAnswer(answerId, c.req.valid("json"));
      if (!answer) throw new APIError(404, { message: "Answer not found" });
      return c.json({ data: answer, success: true, message: "Answer updated successfully." });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", { message: "Failed to update answer", cause: err });
    }
  },
);

export const gradeAnswer = factory.createHandlers(
  sValidator("json", GradeAnswerSchema),
  async (c) => {
    const answerId = c.req.param("id");
    if (!answerId) throw new APIError(400, { message: "Missing answer id" });

    try {
      const existing = await attemptQuestionAnswerRepo.getAnswerById(answerId);
      if (!existing) throw new APIError(404, { message: "Answer not found" });

      const graded = await attemptQuestionAnswerRepo.gradeAnswer(answerId, c.req.valid("json"));
      return c.json({ data: graded, success: true, message: "Answer graded successfully." });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", { message: "Failed to grade answer", cause: err });
    }
  },
);

export const bulkGradeAnswers = factory.createHandlers(
  sValidator("json", BulkGradeSchema),
  async (c) => {
    const { grades } = c.req.valid("json");

    try {
      const graded = await attemptQuestionAnswerRepo.bulkGradeAnswers(grades);
      return c.json({ data: graded, success: true, message: `${graded.length} answer(s) graded successfully.` });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", { message: "Failed to bulk grade answers", cause: err });
    }
  },
);

export const getAnswerStatistics = factory.createHandlers(
  async (c) => {
    const attemptQuestionId = c.req.query("attemptQuestionId");
    const examAttemptId = c.req.query("examAttemptId");

    try {
      const stats = await attemptQuestionAnswerRepo.getAnswerStatistics({
        examAttemptId: examAttemptId || undefined,
        attemptQuestionId: attemptQuestionId || undefined,
      });
      return c.json({ data: stats, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch statistics", cause: err });
    }
  },
);
