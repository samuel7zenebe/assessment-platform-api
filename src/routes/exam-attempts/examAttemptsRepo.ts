import { db } from "@/src/db/index.js";
import {
  examCandidates,
  examQuestions,
  examAttempts,
  attemptQuestions as attemptQuestionsTable,
  answers as answersTable,
  questionBank,
  questionChoices,
  exams,
} from "@/src/db/schema.js";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import type z from "zod";
import type { ListAttemptsQuerySchema } from "./schema.js";
import { APIError } from "better-auth";

/** Round a number to 2 decimal places */
const clip = (n: number): number => Math.round(n * 100) / 100;

/** Convert a nullable sql/number/string to a number */
const num = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v ?? "0");

export const examAttemptsRepo = {
  // ── READ ────────────────────────────────────────────────────────────────────

  listAttempts: async (filters: { examId?: string; candidateId?: string; status?: string }) => {
    const candidateConditions: Parameters<typeof and>[number][] = [];
    if (filters.examId) candidateConditions.push(eq(examAttempts.examId, filters.examId));
    if (filters.candidateId) candidateConditions.push(eq(examAttempts.candidateId, filters.candidateId));

    if (filters.status) {
      // narrow the unknown string to the enum literal via cast
      const st = filters.status as "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "EXPIRED";
      candidateConditions.push(eq(examAttempts.status, st));
    }

    return await db
      .select()
      .from(examAttempts)
      .where(candidateConditions.length === 0 ? undefined : and(...candidateConditions))
      .orderBy(desc(examAttempts.startedAt));
  },

  getAttemptById: async (attemptId: string) => {
    const [a] = await db.select().from(examAttempts).where(eq(examAttempts.id, attemptId)).limit(1);
    return a ?? null;
  },

  getAttemptQuestions: async (attemptId: string) => {
    return await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId))
      .orderBy(attemptQuestionsTable.questionOrder);
  },

  getAttemptReview: async (attemptId: string) => {
    return await db
      .select()
      .from(attemptQuestionsTable)
      .leftJoin(questionBank, eq(attemptQuestionsTable.questionId, questionBank.id))
      .leftJoin(answersTable, eq(answersTable.attemptQuestionId, attemptQuestionsTable.id))
      .leftJoin(
        questionChoices,
        and(eq(questionChoices.questionId, questionBank.id), eq(questionChoices.isCorrect, true)),
      )
      .where(eq(attemptQuestionsTable.attemptId, attemptId));
  },

  // ── START ───────────────────────────────────────────────────────────────────

  startExam: async (params: { examId: string; candidateId: string; attemptNumber: number }) => {
    const [exam] = await db.select().from(exams).where(eq(exams.id, params.examId));
    if (!exam) throw new APIError("NOT_FOUND", { message: "Exam not found", status: 404 });

    const [candidateAssignment] = await db
      .select()
      .from(examCandidates)
      .where(and(eq(examCandidates.examId, params.examId), eq(examCandidates.candidateId, params.candidateId)));

    if (!candidateAssignment) {
      throw new APIError("FORBIDDEN", { message: "Candidate is not assigned to this exam", status: 403 });
    }

    const [attempt] = await db
      .insert(examAttempts)
      .values({
        examId: params.examId,
        candidateId: params.candidateId,
        attemptNumber: params.attemptNumber,
        startedAt: new Date(),
        status: "IN_PROGRESS",
      })
      .returning();

    const rawQuestions = await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, params.examId))
      .orderBy(examQuestions.questionOrder);

    if (rawQuestions.length === 0) {
      throw new APIError(
        "BAD_REQUEST",
        { message: "Exam has no questions. Please contact an administrator.", status: 400 },
      );
    }

    const insertData = rawQuestions.map((eqRow, idx) => ({
      attemptId: attempt!.id,
      questionId: eqRow.questionId,
      questionOrder: idx,
      questionSnapshot: {
        questionId: eqRow.questionId,
        questionOrder: num(eqRow.questionOrder),
      } as Record<string, unknown>,
      createdAt: new Date(),
    }));

    await db.insert(attemptQuestionsTable).values(insertData);

    await db
      .update(examCandidates)
      .set({ assignmentStatus: "STARTED" })
      .where(and(eq(examCandidates.examId, params.examId), eq(examCandidates.candidateId, params.candidateId)));

    const allAQs = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attempt!.id));

    const questionIds = allAQs.map((aq) => aq.questionId) as string[];
    const qbRows = await db.select().from(questionBank).where(inArray(questionBank.id, questionIds));

    const choicesMap: Record<string, unknown[]> = {};
    await Promise.all(
      questionIds.map(async (qid) => {
        const choices = await db
          .select()
          .from(questionChoices)
          .where(eq(questionChoices.questionId, qid))
          .orderBy(questionChoices.displayOrder);
        choicesMap[qid] = choices.map((c) => ({ id: c.id, choiceKey: c.choiceKey, choiceText: c.choiceText, displayOrder: c.displayOrder }));
      }),
    );

    return {
      attemptId: attempt!.id,
      attemptNumber: attempt!.attemptNumber,
      examId: attempt!.examId,
      totalQuestions: allAQs.length,
      estimatedTimeMinutes: exam.estimatedTimeMinutes,
      questions: allAQs.map((aq) => {
        const q = qbRows.find((bq) => bq.id === aq.questionId);
        return {
          attemptQuestionId: aq.id,
          questionOrder: aq.questionOrder,
          question: {
            id: q?.id,
            title: q?.title,
            category: q?.category,
            question: q?.question,
            type: q?.type,
            difficultyLabel: q?.difficultyLabel,
            points: q?.points,
            explanation: q?.explanation,
            estimatedTimeSeconds: q?.estimatedTimeSeconds,
            questionData: q?.questionData,
            imageUrl: q?.imageUrl,
            audioUrl: q?.audioUrl,
            videoUrl: q?.videoUrl,
            choices: q?.type === "CHOICE" || q?.type === "TRUE_FALSE" ? choicesMap[q!.id as string] : undefined,
          },
        };
      }),
    };
  },

  // ── SUBMIT ─────────────────────────────────────────────────────────────────

  submitAttempt: async (attemptId: string) => {
    const attemptRows = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId));

    if (attemptRows.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Cannot submit: no questions were started for this attempt",
        status: 400,
      });
    }

    const attemptedQuestionIds = attemptRows.map((r) => r.id) as string[];
    const answerRows = await db.select().from(answersTable).where(inArray(answersTable.attemptQuestionId, attemptedQuestionIds));

    const totalPossibleRaw = (await db
      .select({ count: sql<number>`SUM(${questionBank.points})` })
      .from(questionBank)
      .where(inArray(questionBank.id, attemptRows.map((r) => r.questionId).filter(Boolean) as string[])))
      .at(0)?.count ?? 0;

    const totalPossible = num(totalPossibleRaw);
    const totalEarned = answerRows.reduce((sum, r) => sum + num(r.awardedPoints), 0);
    const score = totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;

    const [submitted] = await db
      .update(examAttempts)
      .set({
        status: "SUBMITTED",
        submittedAt: new Date(),
        score: score.toString(),
        passed: totalPossible > 0 ? score >= 50 : null,
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();

    return {
      attemptId: submitted!.id,
      status: submitted!.status,
      submittedAt: submitted!.submittedAt,
      score: submitted!.score,
      passed: submitted!.passed,
      totalQuestions: attemptRows.length,
      answeredQuestions: answerRows.length,
    };
  },

  // ── EXPIRE ─────────────────────────────────────────────────────────────────

  expireAttempt: async (attemptId: string) => {
    const attemptRows = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId));

    const attemptedQuestionIds = attemptRows.map((r) => r.id) as string[];
    const answerRows = await db
      .select()
      .from(answersTable)
      .where(inArray(answersTable.attemptQuestionId, attemptedQuestionIds));

    const totalPossibleRaw = (await db
      .select({ count: sql<number>`SUM(${questionBank.points})` })
      .from(questionBank)
      .where(inArray(questionBank.id, attemptRows.map((r) => r.questionId).filter(Boolean) as string[])))
      .at(0)?.count ?? 0;

    const totalPossible = num(totalPossibleRaw);
    const totalEarned = answerRows.reduce((sum, r) => sum + num(r.awardedPoints), 0);
    const score = totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;

    const [updated] = await db
      .update(examAttempts)
      .set({
        status: "EXPIRED",
        passed: false,
        score: score.toString(),
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();

    return updated;
  },

  // ── RESULT ─────────────────────────────────────────────────────────────────

  getResult: async (attemptId: string) => {
    const attemptRows = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId));

    const attemptedQuestionIds = attemptRows.map((r) => r.id) as string[];
    const questionIds = attemptRows.map((r) => r.questionId).filter(Boolean) as string[];

    const totalPossibleRaw = (await db
      .select({ count: sql<number>`SUM(${questionBank.points})` })
      .from(questionBank)
      .where(inArray(questionBank.id, attemptRows.map((r) => r.questionId).filter(Boolean) as string[])))
      .at(0)?.count ?? 0;
    const totalPossible = num(totalPossibleRaw);
    const answerRows = await db.select().from(answersTable).where(inArray(answersTable.attemptQuestionId, attemptedQuestionIds));

    const totalEarned = answerRows.reduce((sum, r) => sum + num(r.awardedPoints), 0);
    const score = totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;
    const isCorrectCount = answerRows.filter((r) => r.isCorrect).length;

    // Attempt number: use attemptId of the first question's attempt row
    const attemptQAttemptId = attemptRows[0]?.attemptId ?? attemptId;
    const attemptCountRows = await db.select().from(examAttempts).where(eq(examAttempts.id, attemptQAttemptId));
    const firstAttempt = attemptCountRows[0];
    const attemptNumber = firstAttempt ? firstAttempt.attemptNumber : 1;

    // Exam meta
    const examInfo = attemptRows.length > 0 && firstAttempt
      ? (await db
          .select({ id: exams.id, title: exams.title, passPercentage: exams.passPercentage })
          .from(exams)
          .where(eq(exams.id, firstAttempt.examId))
          .limit(1)).at(0) ?? null
      : null;

    return {
      attemptId,
      attemptNumber,
      examId: examInfo?.id ?? null,
      examTitle: examInfo?.title ?? null,
      passPercentage: examInfo?.passPercentage ?? 0,
      totalQuestions: attemptRows.length,
      answeredQuestions: answerRows.length,
      correctAnswers: isCorrectCount,
      incorrectAnswers: answerRows.length - isCorrectCount,
      unansweredQuestions: attemptRows.length - answerRows.length,
      score,
      passed: totalPossible > 0 ? score >= 50 : null,
    };
  },
};
