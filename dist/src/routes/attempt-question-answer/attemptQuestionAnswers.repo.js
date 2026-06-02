import { db } from "@/src/db/index.js";
import { answers, attemptQuestions, questionBank, questionChoices, } from "@/src/db/schema.js";
import { and, eq } from "drizzle-orm";
import { APIError } from "better-auth";
export const attemptQuestionAnswerRepo = {
    submitAnswer: async (data) => {
        const [attempt] = await db
            .select()
            .from(attemptQuestions)
            .where(eq(attemptQuestions.id, data.attemptQuestionId));
        if (!attempt)
            throw new APIError("NOT_FOUND", { message: "Attempt question not found" });
        const correctChoice = await db
            .select()
            .from(questionChoices)
            .innerJoin(questionBank, eq(questionBank.id, questionChoices.questionId))
            .where(and(eq(questionChoices.questionId, attempt.questionId), eq(questionChoices.isCorrect, true)))
            .limit(1);
        const correctChoiceId = correctChoice[0]?.question_choices?.id ?? null;
        let isCorrect = false;
        let awardedPoints = "0";
        if (data.selectedChoiceId && data.selectedChoiceId === correctChoiceId) {
            isCorrect = true;
            awardedPoints = correctChoice[0]?.question_bank?.points?.toString() ?? "0";
        }
        if (typeof data.booleanAnswer === "boolean") {
            const questionData = correctChoice[0]?.question_bank;
            if (questionData?.questionData?.booleanAnswer !== undefined) {
                isCorrect = data.booleanAnswer === questionData.questionData.booleanAnswer;
                awardedPoints = isCorrect && questionData.points ? questionData.points.toString() : "0";
            }
        }
        if (data.answerJson) {
            awardedPoints = correctChoice[0]?.question_bank?.points?.toString() ?? "0";
        }
        const [answerRecord] = await db
            .insert(answers)
            .values({
            attemptQuestionId: data.attemptQuestionId,
            selectedChoiceId: data.selectedChoiceId ?? null,
            answerText: data.answerText ?? null,
            booleanAnswer: data.booleanAnswer ?? null,
            answerJson: data.answerJson ?? null,
            isCorrect,
            awardedPoints,
            answeredAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        await db
            .update(attemptQuestions)
            .set({ answeredAt: new Date() })
            .where(eq(attemptQuestions.id, data.attemptQuestionId));
        return answerRecord;
    },
    getSavedAnswer: async (attemptQuestionId) => {
        const [answer] = await db
            .select()
            .from(answers)
            .where(eq(answers.attemptQuestionId, attemptQuestionId))
            .limit(1);
        return answer ?? null;
    },
    getAnswerById: async (answerId) => {
        const [answer] = await db
            .select()
            .from(answers)
            .where(eq(answers.id, answerId))
            .limit(1);
        return answer ?? null;
    },
    updateAnswer: async (answerId, data) => {
        const [updated] = await db
            .update(answers)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(answers.id, answerId))
            .returning();
        return updated ?? null;
    },
    gradeAnswer: async (answerId, data) => {
        const [graded] = await db
            .update(answers)
            .set({
            isCorrect: data.isCorrect,
            awardedPoints: data.awardedPoints.toString(),
            manuallyReviewed: data.manuallyReviewed,
            reviewerFeedback: data.reviewerFeedback ?? null,
            updatedAt: new Date(),
        })
            .where(eq(answers.id, answerId))
            .returning();
        return graded ?? null;
    },
    bulkGradeAnswers: async (grades) => {
        const results = [];
        for (const grade of grades) {
            const [record] = await db
                .update(answers)
                .set({
                isCorrect: grade.isCorrect,
                awardedPoints: grade.awardedPoints.toString(),
                manuallyReviewed: typeof grade.manuallyReviewed === "boolean" ? grade.manuallyReviewed : true,
                reviewerFeedback: grade.reviewerFeedback ?? null,
                updatedAt: new Date(),
            })
                .where(eq(answers.id, grade.answerId))
                .returning();
            if (record)
                results.push(record);
        }
        return results;
    },
    getAllAttemptAnswers: async (examAttemptId) => {
        return await db
            .select()
            .from(answers)
            .leftJoin(attemptQuestions, eq(attemptQuestions.id, answers.attemptQuestionId))
            .where(eq(attemptQuestions.attemptId, examAttemptId));
    },
    getAnswerStatistics: async (filters) => {
        let allRows;
        if (filters.examAttemptId) {
            const attemptQAIds = await db
                .select({ id: attemptQuestions.id })
                .from(attemptQuestions)
                .where(eq(attemptQuestions.attemptId, filters.examAttemptId));
            if (attemptQAIds.length === 0)
                return computeStats([]);
            const { inArray } = await import("drizzle-orm");
            allRows = await db
                .select()
                .from(answers)
                .where(inArray(answers.attemptQuestionId, attemptQAIds.map((r) => r.id)));
        }
        else if (filters.attemptQuestionId) {
            allRows = await db
                .select()
                .from(answers)
                .where(eq(answers.attemptQuestionId, filters.attemptQuestionId));
        }
        else {
            allRows = await db.select().from(answers);
        }
        return computeStats(allRows);
    },
};
const computeStats = (rows) => {
    const totalAnswers = rows.length;
    const correctAnswers = rows.filter((r) => r.isCorrect).length;
    const manuallyReviewed = rows.filter((r) => r.manuallyReviewed).length;
    const totalAwarded = rows.reduce((sum, r) => sum + parseFloat(r.awardedPoints ?? "0"), 0);
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
