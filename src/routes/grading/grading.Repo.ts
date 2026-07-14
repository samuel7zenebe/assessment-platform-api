import { db } from "@/src/db/index.js";
import {
  examAttempts,
  attemptQuestions as attemptQuestionsTable,
  answers as answersTable,
  questionBank,
  questionChoices,
  exams,
} from "@/src/db/schema.js";
import { eq, and, inArray, desc, sql, isNull } from "drizzle-orm";
import { APIError } from "better-auth";
import type z from "zod";
import type { AnswerContentSchema, GradeAnswerSchema } from "./schema.js";

// Round a number to 2 decimal places
const clip = (n: number): number => Math.round(n * 100) / 100;

// Convert a nullable sql/number/string to a number
const num = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v ?? "0");

/** Shape of the data needed to auto-evaluate an answer. */
type AnswerInput = z.infer<typeof AnswerContentSchema>;

/**
 * Automatically evaluate objective (CHOICE / TRUE_FALSE) answers via the
 * selected choice id.
 *
 * Returns whether the answer is correct and the points awarded. Structured /
 * free-text answers (essay) are NOT auto-scored here — they are left to manual
 * review and simply reserve the question's full points as a placeholder.
 */
const evaluateObjective = async (
  questionId: string,
  input: AnswerInput,
): Promise<{ isCorrect: boolean; awardedPoints: string }> => {
  const correct = await db
    .select({
      choiceId: questionChoices.id,
      points: questionBank.points,
    })
    .from(questionChoices)
    .innerJoin(questionBank, eq(questionBank.id, questionChoices.questionId))
    .where(
      and(
        eq(questionChoices.questionId, questionId),
        eq(questionChoices.isCorrect, true),
      ),
    )
    .limit(1);

  const row = correct[0];
  if (!row) return { isCorrect: false, awardedPoints: "0" };

  let isCorrect = false;
  let awardedPoints = "0";

  if (input.selectedChoiceId && input.selectedChoiceId === row.choiceId) {
    isCorrect = true;
    awardedPoints = num(row.points).toString();
  }

  // Structured answers are graded manually; reserve full points as a placeholder.
  if (input.answerJson !== undefined) {
    awardedPoints = num(row.points).toString();
  }

  return { isCorrect, awardedPoints };
};

/** Whether the provided input contains anything the auto-grader can score. */
const hasObjectiveInput = (input: AnswerInput): boolean =>
  input.selectedChoiceId !== undefined || input.answerJson !== undefined;

export const gradingRepo = {
  /* ── ANSWER CAPTURE ──────────────────────────────────────────────────── */

  /**
   * Submit (or re-submit) an answer. Objective questions are auto-graded on
   * every save; manual review flags are cleared so a re-submitted answer is
   * re-evaluated rather than keeping a stale human grade.
   */
  submitAnswer: async (attemptQuestionId: string, input: AnswerInput) => {
    const [attemptQ] = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.id, attemptQuestionId))
      .limit(1);

    if (!attemptQ)
      throw new APIError("NOT_FOUND", {
        message: "Attempt question not found",
      });

    const evaluation = hasObjectiveInput(input)
      ? await evaluateObjective(attemptQ.questionId, input)
      : null;

    const existing = await db
      .select({ id: answersTable.id })
      .from(answersTable)
      .where(eq(answersTable.attemptQuestionId, attemptQuestionId))
      .limit(1);

    type AnswerSet = Partial<typeof answersTable.$inferInsert>;

    const content: AnswerSet = {
      selectedChoiceId: input.selectedChoiceId ?? null,
      answerText: input.answerText ?? null,
      booleanAnswer: input.booleanAnswer ?? null,
      answerJson: input.answerJson ?? null,
      updatedAt: new Date(),
      answeredAt: new Date(),
    };

    if (evaluation) {
      content.isCorrect = evaluation.isCorrect;
      content.awardedPoints = evaluation.awardedPoints;
      content.manuallyReviewed = false;
      content.reviewerFeedback = null;
      content.reviewedBy = null;
      content.reviewedAt = null;
    }

    let record: typeof answersTable.$inferSelect;

    if (existing.length > 0) {
      [record] = await db
        .update(answersTable)
        .set(content)
        .where(eq(answersTable.attemptQuestionId, attemptQuestionId))
        .returning();
    } else {
      [record] = await db
        .insert(answersTable)
        .values({ attemptQuestionId, ...content })
        .returning();
    }

    await db
      .update(attemptQuestionsTable)
      .set({ answeredAt: new Date() })
      .where(eq(attemptQuestionsTable.id, attemptQuestionId));

    return record;
  },

  getSavedAnswer: async (attemptQuestionId: string) => {
    const [answer] = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.attemptQuestionId, attemptQuestionId))
      .limit(1);
    return answer ?? null;
  },

  getAnswerById: async (answerId: string) => {
    const [answer] = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.id, answerId))
      .limit(1);
    return answer ?? null;
  },

  getAllAttemptAnswers: async (examAttemptId: string) => {
    return await db
      .select({
        answerId: answersTable.id,
        questionId: attemptQuestionsTable.questionId,
        order: attemptQuestionsTable.questionOrder,
        selectedChoiceId: answersTable.selectedChoiceId,
        attemptId: attemptQuestionsTable.attemptId,
        attemptNumber: examAttempts.attemptNumber,
        examId: examAttempts.examId,
      })
      .from(answersTable)
      .leftJoin(
        attemptQuestionsTable,
        eq(attemptQuestionsTable.id, answersTable.attemptQuestionId),
      )
      .leftJoin(examAttempts, eq(examAttempts.id, examAttemptId))
      .where(eq(attemptQuestionsTable.attemptId, examAttemptId))
      .groupBy(
        answersTable.id,
        attemptQuestionsTable.questionId,
        attemptQuestionsTable.questionOrder,
        attemptQuestionsTable.attemptId,
        examAttempts.attemptNumber,
        examAttempts.examId,
      );
  },

  /* ── MANUAL GRADING ─────────────────────────────────────────────────── */

  gradeAnswer: async (
    answerId: string,
    grade: z.infer<typeof GradeAnswerSchema>,
    reviewerId: string,
  ) => {
    const [graded] = await db
      .update(answersTable)
      .set({
        isCorrect: grade.isCorrect,
        awardedPoints: grade.awardedPoints.toString(),
        manuallyReviewed: grade.manuallyReviewed,
        reviewerFeedback: grade.reviewerFeedback ?? null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(answersTable.id, answerId))
      .returning();
    return graded ?? null;
  },

  bulkGradeAnswers: async (
    grades: Array<z.infer<typeof GradeAnswerSchema> & { answerId: string }>,
    reviewerId: string,
  ) => {
    const results: (typeof answersTable.$inferSelect)[] = [];
    for (const grade of grades) {
      const [record] = await db
        .update(answersTable)
        .set({
          isCorrect: grade.isCorrect,
          awardedPoints: grade.awardedPoints.toString(),
          manuallyReviewed: grade.manuallyReviewed,
          reviewerFeedback: grade.reviewerFeedback ?? null,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(answersTable.id, grade.answerId))
        .returning();
      if (record) results.push(record);
    }
    return results;
  },

  getAnswerStatistics: async (filters: {
    examAttemptId?: string;
    attemptQuestionId?: string;
  }) => {
    let allRows: (typeof answersTable.$inferSelect)[];

    if (filters.examAttemptId) {
      const attemptQAIds = await db
        .select({ id: attemptQuestionsTable.id })
        .from(attemptQuestionsTable)
        .where(eq(attemptQuestionsTable.attemptId, filters.examAttemptId));

      if (attemptQAIds.length === 0) return computeStats([]);

      allRows = await db
        .select()
        .from(answersTable)
        .where(
          inArray(
            answersTable.attemptQuestionId,
            attemptQAIds.map((r) => r.id),
          ),
        );
    } else if (filters.attemptQuestionId) {
      allRows = await db
        .select()
        .from(answersTable)
        .where(eq(answersTable.attemptQuestionId, filters.attemptQuestionId));
    } else {
      allRows = await db.select().from(answersTable);
    }

    return computeStats(allRows);
  },

  /* ── GRADING WORKFLOW ───────────────────────────────────────────────── */

  // ── GET GRADING QUEUE ─────────────────────────────────────────────────
  getGradingQueue: async (filters: {
    examId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const whereConditions = [eq(examAttempts.status, "SUBMITTED")];

    if (filters.examId) {
      whereConditions.push(eq(examAttempts.examId, filters.examId));
    }

    const attempts = await db
      .select({
        id: examAttempts.id,
        examId: examAttempts.examId,
        candidateId: examAttempts.candidateId,
        attemptNumber: examAttempts.attemptNumber,
        startedAt: examAttempts.startedAt,
        submittedAt: examAttempts.submittedAt,
        score: examAttempts.score,
        passed: examAttempts.passed,
        status: examAttempts.status,
      })
      .from(examAttempts)
      .where(and(...whereConditions))
      .orderBy(desc(examAttempts.submittedAt))
      .limit(filters.limit ?? 50)
      .offset(filters.offset ?? 0);

    const attemptsWithReviewCount = await Promise.all(
      attempts.map(async (attempt) => {
        const [{ count: totalQuestions }] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(attemptQuestionsTable)
          .where(eq(attemptQuestionsTable.attemptId, attempt.id));

        const [{ count: pendingReview }] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(answersTable)
          .innerJoin(
            attemptQuestionsTable,
            eq(answersTable.attemptQuestionId, attemptQuestionsTable.id),
          )
          .where(
            and(
              eq(attemptQuestionsTable.attemptId, attempt.id),
              isNull(answersTable.isCorrect),
            ),
          );

        return {
          ...attempt,
          totalQuestions,
          pendingReview,
        };
      }),
    );

    return attemptsWithReviewCount;
  },

  // ── GET FULL ATTEMPT FOR REVIEW ─────────────────────────────────────────
  getAttemptForReview: async (attemptId: string) => {
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId))
      .limit(1);

    if (!attempt) {
      throw new APIError("NOT_FOUND", {
        message: "Attempt not found",
        status: 404,
      });
    }

    if (attempt.status !== "SUBMITTED") {
      throw new APIError("BAD_REQUEST", {
        message: `Attempt is not submitted (status: ${attempt.status})`,
        status: 400,
      });
    }

    const questionsWithAnswers = await db
      .select({
        attemptQuestionId: attemptQuestionsTable.id,
        questionOrder: attemptQuestionsTable.questionOrder,
        question: attemptQuestionsTable.questionSnapshot,
        answerId: answersTable.id,
        selectedChoiceId: answersTable.selectedChoiceId,
        answerText: answersTable.answerText,
        booleanAnswer: answersTable.booleanAnswer,
        answerJson: answersTable.answerJson,
        isCorrect: answersTable.isCorrect,
        awardedPoints: answersTable.awardedPoints,
        reviewerFeedback: answersTable.reviewerFeedback,
        manuallyReviewed: answersTable.manuallyReviewed,
        answeredAt: answersTable.answeredAt,
      })
      .from(attemptQuestionsTable)
      .leftJoin(
        answersTable,
        eq(answersTable.attemptQuestionId, attemptQuestionsTable.id),
      )
      .where(eq(attemptQuestionsTable.attemptId, attemptId))
      .orderBy(attemptQuestionsTable.questionOrder);

    const [exam] = await db
      .select({
        id: exams.id,
        title: exams.title,
        passPercentage: exams.passPercentage,
      })
      .from(exams)
      .where(eq(exams.id, attempt.examId))
      .limit(1);

    return {
      attempt,
      exam: exam ?? null,
      questions: questionsWithAnswers,
    };
  },

  // ── FINALIZE GRADING ───────────────────────────────────────────────────
  finalizeGrading: async (attemptId: string) => {
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId))
      .limit(1);

    if (!attempt) {
      throw new APIError("NOT_FOUND", {
        message: "Attempt not found",
        status: 404,
      });
    }

    if (attempt.status !== "SUBMITTED") {
      throw new APIError("BAD_REQUEST", {
        message: `Attempt is not submitted (status: ${attempt.status})`,
        status: 400,
      });
    }

    const answerRows = await db
      .select({
        answerId: answersTable.id,
        questionId: attemptQuestionsTable.questionId,
        awardedPoints: answersTable.awardedPoints,
      })
      .from(answersTable)
      .innerJoin(
        attemptQuestionsTable,
        eq(answersTable.attemptQuestionId, attemptQuestionsTable.id),
      )
      .where(eq(attemptQuestionsTable.attemptId, attemptId));

    const questionIds = answerRows.map((row) => row.questionId) as string[];

    const totalPossibleRaw =
      (
        await db
          .select({ count: sql<number>`SUM(${questionBank.points})` })
          .from(questionBank)
          .where(inArray(questionBank.id, questionIds))
      ).at(0)?.count ?? 0;

    const totalPossible = num(totalPossibleRaw);
    const totalEarned = answerRows.reduce(
      (sum, ans) => sum + num(ans.awardedPoints),
      0,
    );
    const score =
      totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;

    const [exam] = await db
      .select({ passPercentage: exams.passPercentage })
      .from(exams)
      .where(eq(exams.id, attempt.examId))
      .limit(1);

    const passPercentage = exam?.passPercentage ?? 50;
    const passed = totalPossible > 0 ? score >= passPercentage : null;

    const [updated] = await db
      .update(examAttempts)
      .set({
        status: "GRADED",
        score: score.toString(),
        passed,
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();

    if (!updated) {
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to finalize grading",
      });
    }

    return {
      attemptId: updated.id,
      status: updated.status,
      score: updated.score,
      passed: updated.passed,
      totalQuestions: answerRows.length,
      totalPoints: totalPossible,
      earnedPoints: totalEarned,
    };
  },
};

const computeStats = (rows: (typeof answersTable.$inferSelect)[]) => {
  const totalAnswers = rows.length;
  const correctAnswers = rows.filter((r) => r.isCorrect).length;
  const manuallyReviewed = rows.filter((r) => r.manuallyReviewed).length;
  const totalAwarded = rows.reduce(
    (sum, r) => sum + parseFloat(r.awardedPoints ?? "0"),
    0,
  );

  return {
    totalAnswers,
    correctAnswers,
    incorrectAnswers: totalAnswers - correctAnswers,
    accuracyRate: totalAnswers > 0 ? correctAnswers / totalAnswers : 0,
    manuallyReviewed,
    totalAwardedPoints: totalAwarded,
    avgAwardedPoints: totalAnswers > 0 ? totalAwarded / totalAnswers : 0,
  };
};
