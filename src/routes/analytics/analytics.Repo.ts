import { db } from "@/src/db/index.js";
import { examAttempts, exams } from "@/src/db/schema.js";
import { APIError } from "better-auth";
import { eq } from "drizzle-orm";

// Round a number to 2 decimal places
export const clip = (n: number): number => Math.round(n * 100) / 100;

// Convert a nullable sql/number/string to a number
export const num = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v ?? "0");

// ── GET  /api/analytics/exams/:id/summary     # Pass rate, avg score, completion rate
export const analyticsRepo = {
  getExamSummary: async (examId: string) => {
    // Verify exam exists
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) {
      throw new APIError("NOT_FOUND", {
        message: "Exam not found",
        status: 404,
      });
    }

    // Get all attempts for this exam
    const attempts = await db
      .select({
        id: examAttempts.id,
        status: examAttempts.status,
        score: examAttempts.score,
        passed: examAttempts.passed,
        submittedAt: examAttempts.submittedAt,
        startedAt: examAttempts.startedAt,
      })
      .from(examAttempts)
      .where(eq(examAttempts.examId, examId));

    // Calculate counts explicitly to avoid type confusion
    let totalAttempts = 0;
    let submittedAttempts = 0;
    let gradedAttempts = 0;
    let gradedWithScore = 0;
    let passedAttempts = 0;
    let startedAttempts = 0;

    for (const attempt of attempts) {
      totalAttempts++;

      if (attempt.startedAt !== null) {
        startedAttempts++;
      }

      if (attempt.status === "SUBMITTED" || attempt.status === "GRADED") {
        submittedAttempts++;
      }

      if (attempt.status === "GRADED") {
        gradedAttempts++;

        if (attempt.score !== null) {
          gradedWithScore++;
          if (attempt.passed === true) {
            passedAttempts++;
          }
        }
      }
    }

    // Calculate pass rate and average score from graded attempts only
    const passRate =
      gradedWithScore > 0 ? (passedAttempts / gradedWithScore) * 100 : 0;

    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    for (const attempt of attempts) {
      if (attempt.status === "GRADED" && attempt.score !== null) {
        totalScore += Number(attempt.score);
        scoreCount++;
      }
    }
    const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    // Completion rate: submitted / assigned (we'll approximate with started attempts for now)
    const completionRate =
      totalAttempts > 0 ? (startedAttempts / totalAttempts) * 100 : 0;

    return {
      examId,
      totalAttempts,
      startedAttempts,
      submittedAttempts,
      gradedAttempts,
      passRate: clip(passRate),
      averageScore: clip(avgScore),
      completionRate: clip(completionRate),
    };
  },
};
