import { db } from "@/src/db/index.js";
import {
  examAttempts,
  attemptQuestions as attemptQuestionsTable,
  answers as answersTable,
  questionBank,
  exams,
} from "@/src/db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { APIError } from "better-auth";
import z from "zod";
import type { ExamMonitorQuerySchema } from "./schema.js";

// Round a number to 2 decimal places
const clip = (n: number): number => Math.round(n * 100) / 100;

// Convert a nullable sql/number/string to a number
const num = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v ?? "0");

type MonitorFilters = z.infer<typeof ExamMonitorQuerySchema>;

/**
 * Live, read-only aggregation of everything happening inside one exam.
 *
 * Reuses data that is already captured per attempt:
 *  - `examAttempts`        → candidate, status, final score
 *  - `attemptQuestions`    → `viewedAt` / `answeredAt` per question (timing)
 *  - `answers`             → `awardedPoints` / `isCorrect` (live score, only when
 *                            the candidate submits via the auto-grading path)
 *
 * No new tables or columns are required.
 */
export const examMonitorRepo = {
  getExamMonitor: async (examId: string, filters: Partial<MonitorFilters> = {}) => {
    const [exam] = await db
      .select({ id: exams.id, title: exams.title })
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam)
      throw new APIError("NOT_FOUND", {
        message: "Exam not found",
        status: 404,
      });

    const attempts = await db
      .select({
        id: examAttempts.id,
        candidateId: examAttempts.candidateId,
        attemptNumber: examAttempts.attemptNumber,
        status: examAttempts.status,
        startedAt: examAttempts.startedAt,
        submittedAt: examAttempts.submittedAt,
        score: examAttempts.score,
        passed: examAttempts.passed,
      })
      .from(examAttempts)
      .where(eq(examAttempts.examId, examId));

    const filtered =
      filters.status
        ? attempts.filter((a) => a.status === filters.status)
        : attempts;

    const summary = {
      totalCandidates: filtered.length,
      inProgress: 0,
      submitted: 0,
      graded: 0,
      expired: 0,
      flaggedIdle: 0,
    };

    if (filtered.length === 0) {
      return {
        examId,
        examTitle: exam.title,
        generatedAt: new Date(),
        summary,
        candidates: [],
      };
    }

    const attemptIds = filtered.map((a) => a.id);

    const rows = await db
      .select({
        attemptId: attemptQuestionsTable.attemptId,
        order: attemptQuestionsTable.questionOrder,
        viewedAt: attemptQuestionsTable.viewedAt,
        answeredAt: attemptQuestionsTable.answeredAt,
        points: questionBank.points,
        awardedPoints: answersTable.awardedPoints,
        isCorrect: answersTable.isCorrect,
      })
      .from(attemptQuestionsTable)
      .leftJoin(
        answersTable,
        eq(answersTable.attemptQuestionId, attemptQuestionsTable.id),
      )
      .leftJoin(
        questionBank,
        eq(questionBank.id, attemptQuestionsTable.questionId),
      )
      .where(inArray(attemptQuestionsTable.attemptId, attemptIds));

    const byAttempt = new Map<string, typeof rows>();
    for (const r of rows) {
      if (!byAttempt.has(r.attemptId)) byAttempt.set(r.attemptId, []);
      byAttempt.get(r.attemptId)!.push(r);
    }

    const now = new Date();
    const idleThreshold = filters.idleMinutes ?? null;

    const candidates = filtered.map((attempt) => {
      const qs = byAttempt.get(attempt.id) ?? [];
      const totalQuestions = qs.length;
      const answered = qs.filter((q) => q.answeredAt != null);
      const totalPossible = qs.reduce((s, q) => s + num(q.points), 0);
      const earned = answered.reduce((s, q) => s + num(q.awardedPoints), 0);
      const liveScore =
        totalPossible > 0 ? clip((earned / totalPossible) * 100) : 0;

      const lastActivity = qs.reduce<Date | null>((max, q) => {
        const t = q.answeredAt ?? q.viewedAt;
        if (t && (max === null || t > max)) return t;
        return max;
      }, null);
      const idleMinutes = lastActivity
        ? Math.round((now.getTime() - lastActivity.getTime()) / 60000)
        : null;

      // Current question = the most recently viewed question not yet answered.
      const open = qs
        .filter((q) => q.viewedAt != null && q.answeredAt == null)
        .sort((a, b) => (a.viewedAt! < b.viewedAt! ? -1 : 1));
      const currentQuestionOrder =
        open.length > 0 ? open[open.length - 1].order : null;

      const flaggedIdle =
        attempt.status === "IN_PROGRESS" &&
        idleMinutes != null &&
        idleThreshold != null &&
        idleMinutes >= idleThreshold;

      if (attempt.status === "IN_PROGRESS") summary.inProgress++;
      else if (attempt.status === "SUBMITTED") summary.submitted++;
      else if (attempt.status === "GRADED") summary.graded++;
      else if (attempt.status === "EXPIRED") summary.expired++;
      if (flaggedIdle) summary.flaggedIdle++;

      const candidate: Record<string, unknown> = {
        attemptId: attempt.id,
        candidateId: attempt.candidateId,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        finalScore: attempt.score,
        passed: attempt.passed,
        progress: { answered: answered.length, total: totalQuestions },
        liveScore,
        currentQuestionOrder,
        lastActivityAt: lastActivity,
        idleMinutes,
        flaggedIdle,
      };

      if (filters.includeQuestions) {
        candidate.questions = qs
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q) => ({
            order: q.order,
            viewedAt: q.viewedAt,
            answeredAt: q.answeredAt,
            durationSeconds:
              q.viewedAt && q.answeredAt
                ? Math.round(
                    (q.answeredAt.getTime() - q.viewedAt.getTime()) / 1000,
                  )
                : null,
            awardedPoints: q.awardedPoints,
            isCorrect: q.isCorrect,
            answered: q.answeredAt != null,
          }));
      }

      return candidate;
    });

    return {
      examId,
      examTitle: exam.title,
      generatedAt: now,
      summary,
      candidates,
    };
  },
};
