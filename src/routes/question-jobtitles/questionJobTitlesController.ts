import { createFactory } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { QuestionJobTitleSchema } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { QuestionJobTitlesRepo } from "./questionJobTitlesRepo.js";
import z from "zod";

const factory = createFactory<{}>();

// ── GET  /question-jobtitles  → list question-jobtitles ──────────────────────────
export const getQuestionsJobTitles = factory.createHandlers(
  sValidator(
    "query",
    z.object({
      jobTitleId: z.string().optional(),
      questionId: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const { jobTitleId, questionId } = c.req.valid("query");
      const questions =
        await QuestionJobTitlesRepo.findAllQuestionJobTitlesByJobTitleId(
          jobTitleId,
        );
      return c.json({
        data: questions,
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "failed to fetch question job titles",
        cause: "Internal Server Error",
      });
    }
  },
);

// ── POST  /question-jobtitles/available  → check available questions ──────────────
export const availableQuestions = factory.createHandlers(
  sValidator(
    "json",
    z.object({
      weight: z.coerce.number(),
      totalQuestions: z.coerce.number(),
      difficultyLevel: z.coerce.number().min(1).max(10),
    }),
  ),
  sValidator(
    "param",
    z.object({
      jobTitleId: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { jobTitleId } = c.req.valid("param");
      const { weight, totalQuestions, difficultyLevel } = c.req.valid("json");

      const questions = await QuestionJobTitlesRepo.checkingQuestionsExistence({
        jobTitle: {
          id: jobTitleId,
          weight: weight,
        },
        difficultyLevel,
        totalQuestions,
      });

      return c.json({
        data: {
          jobTitleId: jobTitleId,
          titleName: questions[0]?.titleName || "Unknown",
          questions: ["MEDIUM", "HARD", "EASY"].map((item, index) => ({
            difficultyLabel:
              questions.find((q) => q.difficultyLabel === item)
                ?.difficultyLabel || item,
            total:
              questions.find((q) => q.difficultyLabel === item)?.total || 0,
            required:
              questions.find((q) => q.difficultyLabel === item)?.required || 0,
            hasEnough:
              questions.find((q) => q.difficultyLabel === item)?.hasEnough ||
              false,
            message:
              questions.find((q) => q.difficultyLabel === item)?.message ||
              `Insufficient ${item.toLowerCase()} questions`,
          })),
        },
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "failed to fetch question job titles",
        cause: "Internal Server Error",
      });
    }
  },
);

// ── GET  /:id/job-titles  → get question job titles ──────────────────────────────
export const getQuestionJobTitles = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const questionJobTitles =
        await QuestionJobTitlesRepo.getQuestionJobTitles(id);

      return c.json({
        data: questionJobTitles,
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "failed to fetch question question job title",
        cause: "Internal Server Error",
      });
    }
  },
);

// ── POST  /:questionId/job-titles/:jobTitleId  → create question job title ──────
export const createQuestionJobTitle = factory.createHandlers(
  sValidator("json", QuestionJobTitleSchema.array()),
  async (c) => {
    try {
      const questionJobTitles = c.req.valid("json");
      const createdQuestionJobTitles =
        await QuestionJobTitlesRepo.createQuestionJobTitle(questionJobTitles);
      return c.json({
        data: createdQuestionJobTitles,
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "failed to create question job title",
        cause: "Internal Server Error",
      });
    }
  },
);

// ── DELETE  /:questionId/job-titles/:jobTitleId  → delete question job title ─────
export const deleteQuestionJobTitle = factory.createHandlers(
  sValidator(
    "param",
    z.object({ questionId: z.string(), jobTitleId: z.string() }),
  ),
  async (c) => {
    try {
      const { questionId, jobTitleId } = c.req.valid("param");

      const deletedQuestionJobTitles =
        await QuestionJobTitlesRepo.deleteQuestionJobTitle(
          questionId,
          jobTitleId,
        );
      return c.json({
        data: deletedQuestionJobTitles,
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "failed to delete question job title",
        cause: "Internal Server Error",
      });
    }
  },
);