import { db } from "@/src/db/index.js";
import { examAttempts, attemptQuestions as attemptQuestionsTable, answers as answersTable, questionBank, exams, } from "@/src/db/schema.js";
import { eq, and, inArray, desc, sql, isNull } from "drizzle-orm";
import { APIError } from "better-auth";
// Round a number to 2 decimal places
const clip = (n) => Math.round(n * 100) / 100;
// Convert a nullable sql/number/string to a number
const num = (v) => typeof v === "number" ? v : parseFloat(v ?? "0");
export const gradingRepo = {
    // ── GET GRADING QUEUE ─────────────────────────────────────────────────────
    getGradingQueue: async (filters) => {
        // Build WHERE conditions properly
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
        // For each attempt, count questions needing manual review
        const attemptsWithReviewCount = await Promise.all(attempts.map(async (attempt) => {
            // Count total questions
            const [{ count: totalQuestions }] = await db
                .select({ count: sql `COUNT(*)` })
                .from(attemptQuestionsTable)
                .where(eq(attemptQuestionsTable.attemptId, attempt.id));
            // Count questions that have been answered but not yet graded (isCorrect is null)
            // Use isNull() instead of eq(..., null) for NULL comparison
            const [{ count: pendingReview }] = await db
                .select({ count: sql `COUNT(*)` })
                .from(answersTable)
                .innerJoin(attemptQuestionsTable, eq(answersTable.attemptQuestionId, attemptQuestionsTable.id))
                .where(and(eq(attemptQuestionsTable.attemptId, attempt.id), isNull(answersTable.isCorrect)));
            return {
                ...attempt,
                totalQuestions,
                pendingReview,
            };
        }));
        return attemptsWithReviewCount;
    },
    // ── GET FULL ATTEMPT FOR REVIEW ───────────────────────────────────────────
    getAttemptForReview: async (attemptId) => {
        // Get attempt details
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
        // Get attempt questions with answers and question data
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
            .leftJoin(answersTable, eq(answersTable.attemptQuestionId, attemptQuestionsTable.id))
            .where(eq(attemptQuestionsTable.attemptId, attemptId))
            .orderBy(attemptQuestionsTable.questionOrder);
        // Get exam details
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
    // ── UPDATE ANSWER GRADING ─────────────────────────────────────────────────
    updateAnswerGrading: async (attemptId, answerId, updates) => {
        // Verify the answer belongs to this attempt
        const [answer] = await db
            .select({
            id: answersTable.id,
            attemptQuestionId: answersTable.attemptQuestionId,
        })
            .from(answersTable)
            .innerJoin(attemptQuestionsTable, eq(answersTable.attemptQuestionId, attemptQuestionsTable.id))
            .where(and(eq(answersTable.id, answerId), eq(attemptQuestionsTable.attemptId, attemptId)))
            .limit(1);
        if (!answer) {
            throw new APIError("NOT_FOUND", {
                message: "Answer not found for this attempt",
                status: 404,
            });
        }
        // Update the answer - convert awardedPoints to string for decimal column
        const [updated] = await db
            .update(answersTable)
            .set({
            isCorrect: updates.isCorrect,
            awardedPoints: updates.awardedPoints.toString(),
            reviewerFeedback: updates.reviewerFeedback ?? undefined,
            manuallyReviewed: true,
            reviewedAt: new Date(),
            // reviewedBy would be set from auth context in controller
        })
            .where(eq(answersTable.id, answerId))
            .returning();
        if (!updated) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
                message: "Failed to update answer grading",
            });
        }
        return updated;
    },
    // ── FINALIZE GRADING ──────────────────────────────────────────────────────
    finalizeGrading: async (attemptId) => {
        // Verify attempt exists and is submitted
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
        // Get all answers for this attempt
        const answerRows = await db
            .select({
            answerId: answersTable.id,
            questionId: attemptQuestionsTable.questionId,
            awardedPoints: answersTable.awardedPoints,
        })
            .from(answersTable)
            .innerJoin(attemptQuestionsTable, eq(answersTable.attemptQuestionId, attemptQuestionsTable.id))
            .where(eq(attemptQuestionsTable.attemptId, attemptId));
        // Calculate total score
        const questionIds = answerRows.map((row) => row.questionId);
        const totalPossibleRaw = (await db
            .select({ count: sql `SUM(${questionBank.points})` })
            .from(questionBank)
            .where(inArray(questionBank.id, questionIds))).at(0)?.count ?? 0;
        const totalPossible = num(totalPossibleRaw);
        const totalEarned = answerRows.reduce((sum, ans) => sum + num(ans.awardedPoints), 0);
        const score = totalPossible > 0 ? clip((totalEarned / totalPossible) * 100) : 0;
        // Get exam pass percentage
        const [exam] = await db
            .select({ passPercentage: exams.passPercentage })
            .from(exams)
            .where(eq(exams.id, attempt.examId))
            .limit(1);
        const passPercentage = exam?.passPercentage ?? 50;
        const passed = totalPossible > 0 ? score >= passPercentage : null;
        // Update attempt with final score and status
        const [updated] = await db
            .update(examAttempts)
            .set({
            status: "GRADED",
            score: score.toString(), // Store as string to match DB decimal type
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
