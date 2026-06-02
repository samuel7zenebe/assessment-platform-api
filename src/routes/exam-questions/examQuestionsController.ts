import { createFactory } from "hono/factory";
import { examQuestionsRepo } from "./examQuestionsRepo.js";
import { db } from "@/src/db/index.js";
import {
  exams,
  examJobTitles,
  questionBank,
  questionJobTitles,
} from "@/src/db/schema.js";
import { APIError } from "better-auth";
import z from "zod";
import { eq } from "drizzle-orm";
import { sValidator } from "@hono/standard-validator";
import {
  ExamQuestionSchema,
  ReorderQuestionSchema,
  BulkReorderSchema,
} from "./schema.js";

const factory = createFactory();

// ── POST  /exams/:examId/questions         → attach question ─────────────────
export const addQuestionToExam = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      id: z.uuid(),
    }),
  ),
  sValidator(
    "json",
    ExamQuestionSchema.pick({
      questionId: true,
      questionOrder: true,
    }),
  ),
  async (c) => {
    const { id: examId } = c.req.valid("param");
    const { questionId, questionOrder } = c.req.valid("json");
    try {
      const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
      if (exam.generationMode !== "QUESTION_COUNT") {
        throw new APIError("BAD_REQUEST", {
          message: "exam generation mode should be QUESTION_COUNT",
        });
      }
      const data = await db.transaction(async (tx) => {
        const [questionExists] = await examQuestionsRepo.getExamQuestion({
          examId,
          questionId,
        });
        if (questionExists.questionId) {
          throw new APIError("BAD_REQUEST", {
            message: "question already exists in exam",
            code: "403",
          });
        }
        const [questionData] = await db
          .select()
          .from(questionBank)
          .leftJoin(
            questionJobTitles,
            eq(questionJobTitles.questionId, questionBank.id),
          )
          .leftJoin(
            examJobTitles,
            eq(examJobTitles.jobTitleId, questionJobTitles.jobTitleId),
          )
          .where(eq(questionBank.id, questionId));

        if (!questionData.question_job_titles?.jobTitleId) {
          throw new APIError("BAD_REQUEST", {
            message: "question has no related job title",
            code: "400",
          });
        }

        const addExamQuestion = await examQuestionsRepo.createExamQuestion({
          examId,
          questionId,
          questionOrder,
        });

        await tx.update(exams).set({
          totalQuestions: exam.totalQuestions! + 1,
          updatedAt: new Date(),
          estimatedTimeMinutes:
            exam.estimatedTimeMinutes! +
            questionData.question_bank?.estimatedTimeSeconds! / 60,
        });

        await db.insert(examJobTitles).values({
          examId,
          jobTitleId: questionData.question_job_titles.jobTitleId,
        });

        return addExamQuestion;
      });

      return c.json({
        data,
        success: true,
        message: "Question was added to exam successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) {
        return c.json({
          message: err.message,
          success: false,
          code: Number(err.statusCode),
        });
      }
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to add question to exam",
        code: "400",
        cause: err,
      });
    }
  },
);

// ── POST  /exams/:examId/questions/reorder  → bulk reorder ───────────────────
export const bulkReorder = factory.createHandlers(
  sValidator("json", BulkReorderSchema),
  async (c) => {
    const examId = c.req.param("examId")!;
    const { orders } = c.req.valid("json");
    try {
      const results = await examQuestionsRepo.bulkReorder(examId, orders);
      return c.json({
        data: results,
        success: true,
        message: "Questions reordered successfully.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to reorder questions",
        cause: err,
      });
    }
  },
);

// ── PATCH /exam-questions/:examId  → reorder / update single question ─────────
// note: the route param is `:examId`; the body supplies `questionId` + `questionOrder`
export const updateExamQuestion = factory.createHandlers(
  sValidator("json", ReorderQuestionSchema),
  async (c) => {
    const examId = c.req.param("examId")!;
    const { questionId, questionOrder } = c.req.valid("json");
    try {
      const [exists] = await examQuestionsRepo.getExamQuestion({
        examId,
        questionId,
      });
      if (!exists.examId) {
        throw new APIError("NOT_FOUND", {
          message: "Exam question not found",
          code: "404",
        });
      }
      const updated = await examQuestionsRepo.updateExamQuestion(
        { examId, questionId },
        { questionOrder },
      );
      return c.json({
        data: updated,
        success: true,
        message: "Question order updated.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to update exam question",
        cause: err,
      });
    }
  },
);

// ── DELETE /exam-questions/:examId  → remove question from exam ──────────────
// note: body supplies `questionId` to identify the composite PK row
export const removeQuestionFromExam = factory.createHandlers(
  sValidator("json", ReorderQuestionSchema),
  async (c) => {
    const examId = c.req.param("examId")!;
    const { questionId } = c.req.valid("json");
    try {
      const [exists] = await examQuestionsRepo.getExamQuestion({
        examId,
        questionId,
      });
      if (!exists.examId) {
        throw new APIError("NOT_FOUND", {
          message: "Exam question not found",
          code: "404",
        });
      }
      const deleted = await examQuestionsRepo.deleteExamQuestion({
        examId,
        questionId,
      });
      return c.json({
        data: deleted,
        success: true,
        message: "Question removed from exam.",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("EXPECTATION_FAILED", {
        message: "Failed to remove question from exam",
        cause: err,
      });
    }
  },
);

// ── GET /exams/:examId/questions  → exam questions (with details) ─────────────
// aliased slug so the ?examId=... query param matches existing SelectExamQuestionsByExamIdSchema
export const getExamQuestions = factory.createHandlers(async (c) => {
  const examId = c.req.param("examId")!;
  try {
    const questions =
      await examQuestionsRepo.getExamQuestionsWithDetails(examId);
    return c.json({ data: questions, success: true });
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Failed to fetch exam questions",
      cause: err,
    });
  }
});
