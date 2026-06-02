import { db } from "@/src/db/index.js";
import { eq, inArray } from "drizzle-orm";
import {
  examJobTitles,
  examQuestions,
  exams,
  questionBank,
  examAttempts,
  attemptQuestions,
  answers as answersTable,
} from "@/src/db/schema.js";
import { type CreateExamSchema } from "./schema.js";
import type z from "zod";
import { generateExamByDifficulty } from "./utils.js";
import { APIError } from "better-auth";
import type { examStatusSchema } from "@/src/lib/schema.js";

export const examRepo = {
  findAllExams: async () => {
    return await db
      .select()
      .from(exams)
      .orderBy(exams.createdAt)
      .limit(20)
      .offset(0);
  },

  createExam: async (
    createdBy: string,
    exam: z.infer<typeof CreateExamSchema>,
  ) => {
    return db.transaction(async (tx) => {
      const [examData] = await tx
        .insert(exams)
        .values({
          ...exam,
          createdBy,
          scheduledTime: new Date(exam.scheduledTime),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const formattedExamJobTitlesData = exam.jobTitles.map((jobTitle) => ({
        examId: examData.id,
        jobTitleId: jobTitle.id,
      }));
      const [examJobTitlesData] = await tx
        .insert(examJobTitles)
        .values(formattedExamJobTitlesData)
        .returning();
      return [examData, examJobTitlesData];
    });
  },

  createRandomExamQuestions: async (
    examId: string,
    totalQuestions: number,
    difficultyLevel: number,
    jobTitles: Array<{ id: string; weight: number }>,
  ) => {
    const { exam } = await generateExamByDifficulty({
      difficultyLevel,
      jobTitles,
      totalQuestions,
    });

    const data = await db
      .insert(examQuestions)
      .values(
        exam.map((q, index) => ({
          examId,
          questionId: q.question_bank.id,
          questionOrder: index,
        })),
      )
      .returning();
    return data;
  },

  updateExam: async (examId: string, updates: Record<string, unknown>) => {
    const { id, ...rest } = updates;
    const currentExam = (
      await db.select().from(exams).where(eq(exams.id, examId))
    ).at(0);

    const payload: Record<string, unknown> = {
      ...rest,
      updatedAt: new Date(),
    };

    if ("scheduledTime" in updates) {
      payload.scheduledTime = (updates as { scheduledTime?: string })
        .scheduledTime
        ? new Date((updates as { scheduledTime: string }).scheduledTime!)
        : null;
    }

    return db
      .update(exams)
      .set(payload)
      .where(eq(exams.id, examId))
      .returning();
  },

  deleteExam: async (examId: string) => {
    return db.delete(exams).where(eq(exams.id, examId)).returning();
  },

  getExam: async (examId: string) => {
    return await db.select().from(exams).where(eq(exams.id, examId));
  },

  getExamQuestions: async (examId: string) => {
    return await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, examId))
      .leftJoin(questionBank, eq(examQuestions.questionId, questionBank.id))
      .orderBy(examQuestions.questionOrder);
  },

  publishExam: async (examId: string) => {
    const statusVal: "PUBLISHED" = "PUBLISHED";
    const [updated] = await db
      .update(exams)
      .set({ status: statusVal, updatedAt: new Date() })
      .where(eq(exams.id, examId))
      .returning();
    return updated;
  },
  closeExam: async (examId: string) => {
    const statusVal: "CLOSED" = "CLOSED";
    const [updated] = await db
      .update(exams)
      .set({ status: statusVal, updatedAt: new Date() })
      .where(eq(exams.id, examId))
      .returning();
    return updated;
  },
  activateExam: async (examId: string) => {
    const compared = await isExamStatus({
      id: examId,
      status: "PUBLISHED",
    });
    if (!compared) {
      throw new APIError("FORBIDDEN", {
        cause: "Inappropriate Data",
        message: "current exam status should be published.",
      });
    }
    const statusVal: "ACTIVE" = "ACTIVE";
    const [updated] = await db
      .update(exams)
      .set({ status: statusVal, updatedAt: new Date() })
      .where(eq(exams.id, examId))
      .returning();
    return updated;
  },

  archiveExam: async (examId: string) => {
    const statusVal: "ARCHIVED" = "ARCHIVED";
    const [updated] = await db
      .update(exams)
      .set({ status: statusVal, updatedAt: new Date() })
      .where(eq(exams.id, examId))
      .returning();
    return updated;
  },

  generateQuestions: async (examId: string, totalQuestions?: number) => {
    const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
    if (!exam)
      throw new APIError("NOT_FOUND", {
        status: 404,
        message: "Exam not found",
      });

    const count = totalQuestions ?? exam.totalQuestions ?? 20;
    const rows = await db
      .select({ jobTitleId: examJobTitles.jobTitleId })
      .from(examJobTitles)
      .where(eq(examJobTitles.examId, examId));

    const jobTitles = rows.map((r) => ({
      id: String(r.jobTitleId),
      weight: 100,
    }));

    await examRepo.createRandomExamQuestions(
      examId,
      count,
      exam.difficultyLevel,
      jobTitles,
    );

    await db
      .update(exams)
      .set({ totalQuestions: count, updatedAt: new Date() })
      .where(eq(exams.id, examId));

    return await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, examId))
      .orderBy(examQuestions.questionOrder);
  },

  getExamStatistics: async (examId: string) => {
    const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
    if (!exam)
      throw new APIError("NOT_FOUND", {
        status: 404,
        message: "Exam not found",
      });

    const questionRows = await db
      .select()
      .from(examQuestions)
      .leftJoin(questionBank, eq(examQuestions.questionId, questionBank.id))
      .where(eq(examQuestions.examId, examId));

    const easy = questionRows.filter(
      (r) => r.question_bank?.difficultyLabel === "EASY",
    ).length;
    const medium = questionRows.filter(
      (r) => r.question_bank?.difficultyLabel === "MEDIUM",
    ).length;
    const hard = questionRows.filter(
      (r) => r.question_bank?.difficultyLabel === "HARD",
    ).length;

    const attemptRows = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.examId, examId));
    const totalAttempts = attemptRows.length;
    const inProgress = attemptRows.filter(
      (a) => String(a.status) === "IN_PROGRESS",
    ).length;
    const submittedCount = attemptRows.filter(
      (a) => String(a.status) === "SUBMITTED",
    ).length;
    const gradedCount = attemptRows.filter(
      (a) => String(a.status) === "GRADED",
    ).length;

    const scored = attemptRows.filter((a) => a.score != null);
    const scores = scored.map((a) => parseFloat(a.score!));
    const avgScore =
      scores.length > 0
        ? scores.reduce((s, v) => s + v, 0) / scores.length
        : null;
    const maxScore = scores.length > 0 ? Math.max(...scores) : null;
    const minScore = scores.length > 0 ? Math.min(...scores) : null;
    const passedCount = attemptRows.filter((a) => a.passed).length;
    const passRate = totalAttempts > 0 ? passedCount / totalAttempts : null;

    let totalAnswersCount = 0;
    let totalCorrectAnswers = 0;
    const { inArray } = await import("drizzle-orm");
    if (attemptRows.length > 0) {
      const attemptIdsList = attemptRows.map((a) => a.id) as string[];
      const attemptQARows = await db
        .select()
        .from(attemptQuestions)
        .where(inArray(attemptQuestions.attemptId, attemptIdsList));
      const attemptQAIds = attemptQARows.map((r) => r.id) as string[];
      if (attemptQAIds.length > 0) {
        const answerRows = await db
          .select()
          .from(answersTable)
          .where(inArray(answersTable.attemptQuestionId, attemptQAIds));
        totalAnswersCount = answerRows.length;
        totalCorrectAnswers = answerRows.filter((r) => r.isCorrect).length;
      }
    }

    return {
      exam: {
        id: exam.id,
        title: exam.title,
        status: exam.status,
        passPercentage: exam.passPercentage,
        totalQuestions: questionRows.length,
        difficultyBreakdown: { easy, medium, hard },
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      },
      attempts: {
        total: totalAttempts,
        inProgress,
        submitted: submittedCount,
        graded: gradedCount,
      },
      scores: {
        avgScore,
        maxScore,
        minScore,
        passedCount,
        passRate,
      },
      answers: {
        totalAnswers: totalAnswersCount,
        correctAnswers: totalCorrectAnswers,
        incorrectAnswers: totalAnswersCount - totalCorrectAnswers,
      },
    };
  },
};

const isExamStatus = async ({
  id,
  status,
}: {
  id: string;
  status: z.infer<typeof examStatusSchema>;
}) => {
  const [examDetail] = await db.select().from(exams).where(eq(exams.id, id));
  return examDetail.status === status;
};
