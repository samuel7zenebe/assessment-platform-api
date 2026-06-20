import { createFactory } from "hono/factory";
import { examRepo } from "./examsRepo.js";
import { hasPermission } from "@/src/middleware/auth.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import {
  CreateExamSchema,
  UpdateExamSchema,
  DeleteExamSchema,
  PublishExamSchema,
  ArchiveExamSchema,
  GenerateExamQuestionsSchema,
} from "./schema.js";
import { APIError } from "better-auth";
import { db } from "@/src/db/index.js";
import { examQuestions, exams, examJobTitles } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";
import { generateExamByDifficulty } from "./utils.js";
const factory = createFactory();
// ── GET    /     → list exams ────────────────────────────────────────────────
export const getAllExams = factory.createHandlers(
  hasPermission({ resource: "exam", action: "read" }),
  async (c) => {
    try {
      const data = await examRepo.findAllExams();
      return c.json(
        { data, success: true },
        { status: data.length > 0 ? 200 : 404 },
      );
    } catch (err) {
      console.log(err);
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "An error occurred while fetching the exams",
        cause: err,
      });
    }
  },
);
// ── GET    /:id  → get exam ──────────────────────────────────────────────────
export const getExamById = factory.createHandlers(
  hasPermission({ resource: "exam", action: "read" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const data = await examRepo.getExam(examId);
      if (!data)
        throw new APIError("NOT_FOUND", {
          message: "Exam not found",
          status: 404,
        });
      return c.json({ data, success: true }, { status: 200 });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "An error occurred while fetching the exam",
        cause: err,
      });
    }
  },
);

export const getAllCategories = factory.createHandlers(async (c) => {
  try {
    const categories = await QuestionBankRepo.getAllCategories();

    return c.json(
      {
        data: categories,
        success: true,
        total: categories.length,
      },
      {
        status: categories.length > 0 ? 200 : 404,
      },
    );
  } catch (error) {
    throw new HTTPException(500, {
      cause: "Internal Server Error",
      message: "An error occurred while fetching categories",
    });
  }
});
// ── POST   /     → create exam ───────────────────────────────────────────────
export const createExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "create" }),
  sValidator("json", CreateExamSchema),
  async (c) => {
    const userId = c.get("user").id;
    const exam = c.req.valid("json");
    console.log("Passed Jobtitles : ", exam.jobTitles);
    const [examData, examJobTitlesData] = await examRepo.createExam(
      userId,
      exam,
    );
    const { distribution } = await examRepo.createRandomExamQuestions({
      difficultyLevel: exam.difficultyLevel,
      id: examData.id,
      jobTitles: exam.jobTitles.map((j) => ({
        id: j.id,
        weight: j.weight,
      })),
      totalQuestions: exam.totalQuestions,
    });
    console.log(" Distribution : ", distribution);
    return c.json(
      {
        data: { exam: examData.id, distribution },
        success: true,
        message: `An exam with id ${examData.id} is created successfully.`,
      },
      { status: 201 },
    );
  },
);
// ── PUT    /:id  → update exam ──────────────────────────────────────────────
export const updateExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator("json", UpdateExamSchema),
  async (c) => {
    try {
      const exam = c.req.valid("json");
      const data = await examRepo.updateExam(exam.id, exam);
      return c.json(
        {
          data,
          success: true,
          message: `An exam with id ${data[0].id} is updated successfully.`,
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "An error occurred while updating the exam",
        cause: err,
      });
    }
  },
);
// ── DELETE /:id  → soft delete exam ─────────────────────────────────────────
export const deleteExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "delete" }),
  sValidator("param", DeleteExamSchema),
  async (c) => {
    try {
      const exam = c.req.valid("param");
      const data = await examRepo.deleteExam(exam.id);
      return c.json(
        {
          data,
          success: true,
          message: `An exam with id ${data[0].id} is deleted successfully.`,
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "An error occurred while deleting the exam",
        cause: err,
      });
    }
  },
);
// ── GET    /questions/:id  → exam questions ──────────────────────────────────
export const getExamQuestions = factory.createHandlers(
  hasPermission({ resource: "exam", action: "read" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const examQuestionsData = await examRepo.getExamQuestions(examId);
      const total = examQuestionsData.length;
      const formattedQuestions = examQuestionsData.map((eqRow) => ({
        questionId: eqRow.exam_questions.questionId,
        questionOrder: eqRow.exam_questions.questionOrder,
        questionText: eqRow.question_bank?.question,
      }));
      if (!formattedQuestions.length)
        throw new APIError("NOT_FOUND", {
          message: "Exam questions not found",
          status: 404,
        });
      return c.json(
        {
          data: {
            ...examQuestionsData[0].exams,
            examId,
            totalQuestions: total,
            difficultyDistribution: {
              easy: examQuestionsData.filter(
                (q) => q?.question_bank?.difficultyLabel === "EASY",
              ).length,
              medium: examQuestionsData.filter(
                (q) => q?.question_bank?.difficultyLabel === "MEDIUM",
              ).length,
              hard: examQuestionsData.filter(
                (q) => q?.question_bank?.difficultyLabel === "HARD",
              ).length,
            },
            questions: formattedQuestions,
          },
          success: true,
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "An error occurred while fetching the exam questions",
        cause: err,
      });
    }
  },
);
// ── PATCH  /:id/publish  → publish exam ─────────────────────────────────────
export const publishExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const exists = await examRepo.getExam(examId);
      if (!exists)
        throw new APIError("NOT_FOUND", {
          message: "Exam not found",
          status: 404,
        });
      const updated = await examRepo.publishExam(examId);
      return c.json(
        {
          data: updated,
          success: true,
          message: "Exam published successfully.",
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to publish exam",
        cause: err,
      });
    }
  },
);
// ── PATCH  /:id/archive  → archive exam ─────────────────────────────────────
export const archiveExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const exists = await examRepo.getExam(examId);
      if (!exists)
        throw new APIError("NOT_FOUND", {
          message: "Exam not found",
          status: 404,
        });
      const updated = await examRepo.archiveExam(examId);
      return c.json(
        {
          data: updated,
          success: true,
          message: "Exam archived successfully.",
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to archive exam",
        cause: err,
      });
    }
  },
);
// ---PATCH /:id/activate -> activate an exam
export const activateExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const exists = await examRepo.getExam(examId);
      if (!exists)
        throw new APIError("NOT_FOUND", {
          message: "Exam not found",
          status: 404,
        });
      const updated = await examRepo.activateExam(examId);
      return c.json(
        {
          data: updated,
          success: true,
          message: "Exam activated successfully.",
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to archive exam",
        cause: err,
      });
    }
  },
);
// ___> PATCH /:id/close ===< close exam
export const closeExam = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const exists = await examRepo.getExam(examId);
      if (!exists)
        throw new APIError("NOT_FOUND", {
          message: "Exam not found",
          status: 404,
        });
      const updated = await examRepo.closeExam(examId);
      return c.json(
        {
          data: updated,
          success: true,
          message: "Exam closed successfully.",
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to close exam",
        cause: err,
      });
    }
  },
);
// ── POST   /:id/generate  → generate exam questions ─────────────────────────
export const generateExamQuestions = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator(
    "json",
    GenerateExamQuestionsSchema.omit({
      id: true,
    }),
  ),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const { totalQuestions, difficultyLevel, jobTitles } =
        c.req.valid("json");
      const { distribution, exam_questions } =
        await examRepo.createRandomExamQuestions({
          difficultyLevel,
          id: examId,
          jobTitles,
          totalQuestions,
        });
      return c.json(
        {
          data: { exam_questions, distribution },
          success: true,
          message: `Exam questions generated successfully (${exam_questions.length} questions).`,
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to generate exam questions",
        cause: err,
      });
    }
  },
);
// ── POST   /:id/regenerate  → regenerate exam questions ─────────────────────────
export const regenerateExamQuestions = factory.createHandlers(
  hasPermission({ resource: "exam", action: "update" }),
  sValidator(
    "json",
    GenerateExamQuestionsSchema.omit({
      id: true,
    }),
  ),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const { totalQuestions, difficultyLevel, jobTitles } =
        c.req.valid("json");
      // Delete all existing exam Question
      await db.delete(examQuestions).where(eq(examQuestions.examId, examId));
      // Update the totalQuestions
      await db
        .update(exams)
        .set({
          totalQuestions,
        })
        .where(eq(exams.id, examId));
      // Delete all exam-job-titles for the exam
      await db.delete(examJobTitles).where(eq(examJobTitles.examId, examId));
      // Insert the new job titles
      await db.insert(examJobTitles).values(
        jobTitles.map((jobTitle) => ({
          examId,
          jobTitleId: jobTitle.id,
          weight: jobTitle.weight,
        })),
      );
      const { distribution, exam_questions } =
        await examRepo.createRandomExamQuestions({
          difficultyLevel,
          id: examId,
          jobTitles,
          totalQuestions,
        });
      return c.json(
        {
          data: { exam_questions, distribution },
          success: true,
          message: `Exam questions generated successfully (${exam_questions.length} questions).`,
        },
        { status: 200 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to generate exam questions",
        cause: err,
      });
    }
  },
);
// ── GET    /:id/statistics  → exam analytics ─────────────────────────────────
export const getExamStatistics = factory.createHandlers(
  hasPermission({ resource: "exam", action: "read" }),
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    try {
      const examId = c.req.valid("param").id;
      const stats = await examRepo.getExamStatistics(examId);
      return c.json({ data: stats, success: true }, { status: 200 });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch exam statistics",
        cause: err,
      });
    }
  },
);
