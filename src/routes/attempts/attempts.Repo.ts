import { db } from "@/src/db/index.js";
import {
  examAttempts,
  examQuestions,
  attemptQuestions as attemptQuestionsTable,
  answers as answersTable,
  questionBank,
  questionChoices,
  exams,
} from "@/src/db/schema.js";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import type z from "zod";
import { APIError } from "better-auth";
import { getRandomNumberOrders } from "@/src/lib/helper-funs.js";

/** Round a number to 2 decimal places */
const clip = (n: number): number => Math.round(n * 100) / 100;

/** Convert a nullable sql/number/string to a number */
const num = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v ?? "0");

export const attemptsRepo = {
  // ── CREATE ATTEMPT WITH SNAPSHOTS ────────────────────────────────────────
  createAttemptWithSnapshots: async (params: {
    examId: string;
    candidateId: string;
  }) => {
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, params.examId));
    if (!exam)
      throw new APIError("NOT_FOUND", {
        message: "Exam not found",
        status: 404,
      });

    // Get the highest attempt number for this candidate and exam to increment
    const [lastAttempt] = await db
      .select({ attemptNumber: examAttempts.attemptNumber })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, params.examId),
          eq(examAttempts.candidateId, params.candidateId),
        ),
      )
      .orderBy(desc(examAttempts.attemptNumber))
      .limit(1);

    const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;

    const [attempt] = await db
      .insert(examAttempts)
      .values({
        examId: params.examId,
        candidateId: params.candidateId,
        attemptNumber,
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
      throw new APIError("BAD_REQUEST", {
        message: "Exam has no questions. Please contact an administrator.",
        status: 400,
      });
    }

    // Fetch full question data and choices for snapshotting
    const questionIds = rawQuestions.map((r) => r.questionId);
    const questions = await db
      .select()
      .from(questionBank)
      .where(inArray(questionBank.id, questionIds));

    const choicesMap: Record<string, unknown[]> = {};
    await Promise.all(
      questionIds.map(async (qid) => {
        const choices = await db
          .select()
          .from(questionChoices)
          .where(eq(questionChoices.questionId, qid))
          .orderBy(questionChoices.displayOrder);
        choicesMap[qid] = choices.map((c: any) => ({
          id: c.id,
          choiceKey: c.choiceKey,
          choiceText: c.choiceText,
          displayOrder: c.displayOrder,
          isCorrect: c.isCorrect, // include for snapshotting (will be filtered later)
        }));
      }),
    );

    const randomQuestionOrder = getRandomNumberOrders(rawQuestions.length);

    const insertData = rawQuestions.map((eqRow, idx) => {
      const question = questions.find((q) => q.id === eqRow.questionId);
      if (!question) throw new Error(`Question not found: ${eqRow.questionId}`);
      const choices = choicesMap[eqRow.questionId as string] || [];

      return {
        attemptId: attempt.id,
        questionId: eqRow.questionId,
        questionOrder: randomQuestionOrder[idx],
        questionSnapshot: {
          questionId: question.id,
          title: question.title,
          category: question.category,
          question: question.question,
          type: question.type,
          difficultyLabel: question.difficultyLabel,
          points: question.points,
          explanation: question.explanation,
          estimatedTimeSeconds: question.estimatedTimeSeconds,
          questionData: question.questionData,
          imageUrl: question.imageUrl,
          audioUrl: question.audioUrl,
          videoUrl: question.videoUrl,
          // For objective types, include choices with correctness for grading
          choices:
            question.type === "CHOICE" || question.type === "TRUE_FALSE"
              ? choices.map((c: any) => ({
                  id: c.id,
                  choiceKey: c.choiceKey,
                  choiceText: c.choiceText,
                  isCorrect: c.isCorrect,
                }))
              : undefined,
        } as Record<string, unknown>,
        shuffledChoices: null, // TODO: implement shuffling if needed
        createdAt: new Date(),
      };
    });

    await db.insert(attemptQuestionsTable).values(insertData);

    return attempt;
  },

  // ── GET ATTEMPT WITH QUESTIONS (no correct answers) ───────────────────────
  getAttemptWithQuestions: async (attemptId: string) => {
    console.log(attemptId);
    const attempts = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId));
    console.log(attempts);
    if (attempts.length < 1)
      throw new APIError("NOT_FOUND", {
        message: "Attempt not found",
        status: 404,
      });

    const questions = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId))
      .orderBy(attemptQuestionsTable.questionOrder);

    // Filter out correct answers from snapshots for candidate view
    const filteredQuestions = questions.map((aq) => {
      const snapshot = aq.questionSnapshot as any;
      // If snapshot has choices with isCorrect, remove isCorrect for candidate view
      if (snapshot.choices && Array.isArray(snapshot.choices)) {
        snapshot.choices = snapshot.choices.map((c: any) => {
          const { isCorrect, ...rest } = c;
          return rest;
        });
      }
      return {
        attemptQuestionId: aq.id,
        questionOrder: aq.questionOrder,
        question: snapshot,
        viewedAt: aq.viewedAt,
        answeredAt: aq.answeredAt,
      };
    });

    return {
      ...attempts[0],
      questions: filteredQuestions,
    };
  },

  // ── GET SINGLE QUESTION BY ORDER ─────────────────────────────────────────
  getQuestionByOrder: async (attemptId: string, order: number) => {
    const [aq] = await db
      .select()
      .from(attemptQuestionsTable)
      .where(
        and(
          eq(attemptQuestionsTable.attemptId, attemptId),
          eq(attemptQuestionsTable.questionOrder, order),
        ),
      )
      .limit(1);
    if (!aq)
      throw new APIError("NOT_FOUND", {
        message: "Question not found",
        status: 404,
      });

    const snapshot = aq.questionSnapshot as any;
    // Filter out correct answers for candidate view
    if (snapshot.choices && Array.isArray(snapshot.choices)) {
      snapshot.choices = snapshot.choices.map((c: any) => {
        const { isCorrect, ...rest } = c;
        return rest;
      });
    }

    return {
      attemptQuestionId: aq.id,
      questionOrder: aq.questionOrder,
      question: snapshot,
      viewedAt: aq.viewedAt,
      answeredAt: aq.answeredAt,
    };
  },

  // ── UPDATE VIEWED AT ─────────────────────────────────────────────────────
  updateViewedAt: async (
    attemptId: string,
    order: number,
    viewedAt: Date = new Date(),
  ) => {
    const [updated] = await db
      .update(attemptQuestionsTable)
      .set({ viewedAt })
      .where(
        and(
          eq(attemptQuestionsTable.attemptId, attemptId),
          eq(attemptQuestionsTable.questionOrder, order),
        ),
      )
      .returning();
    if (!updated)
      throw new APIError("NOT_FOUND", {
        message: "Question not found",
        status: 404,
      });
    return updated;
  },
  // ── TOGGLE FLAG ─────────────────────────────────────────────────────
  toggleFlag: async (attemptId: string, order: number, flagged: boolean) => {
    const [updated] = await db
      .update(attemptQuestionsTable)
      .set({ flagged })
      .where(
        and(
          eq(attemptQuestionsTable.attemptId, attemptId),
          eq(attemptQuestionsTable.questionOrder, order),
        ),
      )
      .returning();
    if (!updated)
      throw new APIError("NOT_FOUND", {
        message: "Question not found",
        status: 404,
      });
    return updated;
  },

  // ── UPSERT ANSWER ────────────────────────────────────────────────────────
  upsertAnswer: async (attemptId: string, order: number, answerBody: any) => {
    // First get the attemptQuestionId
    const [aq] = await db
      .select({ id: attemptQuestionsTable.id })
      .from(attemptQuestionsTable)
      .where(
        and(
          eq(attemptQuestionsTable.attemptId, attemptId),
          eq(attemptQuestionsTable.questionOrder, order),
        ),
      )
      .limit(1);
    if (!aq)
      throw new APIError("NOT_FOUND", {
        message: "Question not found",
        status: 404,
      });

    const attemptQuestionId = aq.id;

    // Determine answer type based on body
    let selectedChoiceId: string | null = null;
    let answerText: string | null = null;
    let booleanAnswer: boolean | null = null;
    let answerJson: any = null;

    if (answerBody.selectedChoiceId !== undefined) {
      selectedChoiceId = answerBody.selectedChoiceId[0];
    } else if (answerBody.answerText !== undefined) {
      answerText = answerBody.answerText;
    } else if (answerBody.booleanAnswer !== undefined) {
      booleanAnswer = answerBody.booleanAnswer;
    } else if (answerBody.answerJson !== undefined) {
      answerJson = answerBody.answerJson;
    } else {
      throw new APIError("BAD_REQUEST", {
        message: "Invalid answer body",
        status: 400,
      });
    }

    // Upsert: update if exists, else insert
    const [existing] = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.attemptQuestionId, attemptQuestionId))
      .limit(1);

    const now = new Date();
    if (existing) {
      await db
        .update(answersTable)
        .set({
          selectedChoiceId,
          answerText,
          booleanAnswer,
          answerJson,
          answeredAt: now,
          updatedAt: now,
          // isCorrect, awardedPoints, manuallyReviewed will be set during grading
        })
        .where(eq(answersTable.id, existing.id));
    } else {
      await db.insert(answersTable).values({
        attemptQuestionId,
        selectedChoiceId,
        answerText,
        booleanAnswer,
        answerJson,
        answeredAt: now,
        updatedAt: now,
      });
    }

    // Update the attemptQuestion's answeredAt timestamp (first answer)
    await db
      .update(attemptQuestionsTable)
      .set({ answeredAt: now })
      .where(eq(attemptQuestionsTable.id, attemptQuestionId));

    return { success: true };
  },

  // ── SUBMIT ATTEMPT WITH AUTO-GRADE ───────────────────────────────────────
  submitAttemptWithAutoGrade: async (attemptId: string) => {
    // Get all attempt questions for this attempt
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

    // Get the attempt record
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId))
      .limit(1);
    if (!attempt) throw new Error("Attempt not found"); // This should not happen if attemptRows is not empty

    const attemptedQuestionIds = attemptRows.map((r) => r.id) as string[];
    const questionIds = attemptRows
      .map((r) => r.questionId)
      .filter(Boolean) as string[];

    // Get answers for these attempt questions
    const answerRows = await db
      .select()
      .from(answersTable)
      .where(inArray(answersTable.attemptQuestionId, attemptedQuestionIds));

    // Auto-grade objective questions: CHOICE and TRUE_FALSE
    const updatedAnswers = [];
    for (const answer of answerRows) {
      // Get the attempt question to access snapshot
      const aq = attemptRows.find((aq) => aq.id === answer.attemptQuestionId);
      if (!aq) continue;

      const snapshot = aq.questionSnapshot as any;
      let isCorrect: boolean | null = null;
      let awardedPoints: number = 0;

      if (snapshot.type === "CHOICE" || snapshot.type === "TRUE_FALSE") {
        if (answer.selectedChoiceId !== null) {
          // Find the selected choice in snapshot.choices
          const choice = snapshot.choices?.find(
            (c: any) => c.id === answer.selectedChoiceId,
          );
          isCorrect = choice?.isCorrect ?? false;
          awardedPoints = isCorrect ? Number(snapshot.points) : 0;
        }
      }
      // For other types (MATCH, ESSAY), leave isCorrect and awardedPoints null for manual review

      if (isCorrect !== null) {
        const updateData = {
          isCorrect: isCorrect,
          awardedPoints: awardedPoints.toString(),
          updatedAt: new Date(),
        };
        updatedAnswers.push(
          db
            .update(answersTable)
            .set(updateData)
            .where(eq(answersTable.id, answer.id)),
        );
      }
    }

    // Execute updates
    if (updatedAnswers.length > 0) {
      await Promise.all(updatedAnswers);
    }

    // Calculate total score
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

    // Determine pass/fail (get exam info from attempt)
    const examInfo = attempt
      ? await db
          .select({ id: exams.id, passPercentage: exams.passPercentage })
          .from(exams)
          .where(eq(exams.id, attempt.examId))
          .limit(1)
      : null;
    const passPercentage = examInfo?.[0]?.passPercentage ?? 50;
    const passed = totalPossible > 0 ? score >= passPercentage : null;

    // Update attempt
    const [submitted] = await db
      .update(examAttempts)
      .set({
        status: "SUBMITTED",
        submittedAt: new Date(),
        score: score.toString(), // Store as string to match DB type
        passed,
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();

    return {
      attemptId: submitted.id,
      status: submitted.status,
      submittedAt: submitted.submittedAt,
      score: submitted.score,
      passed: submitted.passed,
      totalQuestions: attemptRows.length,
      answeredQuestions: answerRows.length,
    };
  },

  // ── GET RESULTS (after grading) ──────────────────────────────────────────
  getResults: async (attemptId: string) => {
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId))
      .limit(1);
    if (!attempt)
      throw new APIError("NOT_FOUND", {
        message: "Attempt not found",
        status: 404,
      });

    if (attempt.status !== "GRADED") {
      throw new APIError("BAD_REQUEST", {
        message: "Results are only available after grading",
        status: 400,
      });
    }

    // Get attempt questions
    const attemptRows = await db
      .select()
      .from(attemptQuestionsTable)
      .where(eq(attemptQuestionsTable.attemptId, attemptId));

    const attemptedQuestionIds = attemptRows.map((r) => r.id) as string[];
    const questionIds = attemptRows
      .map((r) => r.questionId)
      .filter(Boolean) as string[];

    const totalPossibleRaw =
      (
        await db
          .select({ count: sql<number>`SUM(${questionBank.points})` })
          .from(questionBank)
          .where(inArray(questionBank.id, questionIds))
      ).at(0)?.count ?? 0;
    const totalPossible = num(totalPossibleRaw);
    const answerRows = await db
      .select()
      .from(answersTable)
      .where(inArray(answersTable.attemptQuestionId, attemptedQuestionIds));

    const totalEarned = answerRows.reduce(
      (sum, ans) => sum + num(ans.awardedPoints),
      0,
    );
    const score =
      totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;
    const isCorrectCount = answerRows.filter((ans) => ans.isCorrect).length;

    return {
      attemptId,
      attemptNumber: attempt.attemptNumber,
      examId: attempt.examId,
      examTitle: null, // TODO: fetch from exams if needed
      passPercentage: null, // TODO: fetch from exams if needed
      totalQuestions: attemptRows.length,
      answeredQuestions: answerRows.length,
      correctAnswers: isCorrectCount,
      incorrectAnswers: answerRows.length - isCorrectCount,
      unansweredQuestions: attemptRows.length - answerRows.length,
      score,
      passed: attempt.passed,
    };
  },
};
