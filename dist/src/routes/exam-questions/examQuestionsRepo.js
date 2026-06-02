import { db } from "@/src/db/index.js";
import { examQuestions, questionBank, questionChoices } from "@/src/db/schema.js";
import { and, eq } from "drizzle-orm";
import { APIError } from "better-auth";
export const examQuestionsRepo = {
    createExamQuestion: async (data) => {
        const [record] = await db.insert(examQuestions).values(data).returning();
        return record;
    },
    updateExamQuestion: async (where, data) => {
        const [updated] = await db
            .update(examQuestions)
            .set(data)
            .where(and(eq(examQuestions.examId, where.examId), eq(examQuestions.questionId, where.questionId)))
            .returning();
        return updated;
    },
    deleteExamQuestion: async (where) => {
        const [deleted] = await db
            .delete(examQuestions)
            .where(and(eq(examQuestions.examId, where.examId), eq(examQuestions.questionId, where.questionId)))
            .returning();
        return deleted;
    },
    getExamQuestion: async (where) => {
        return await db
            .select()
            .from(examQuestions)
            .where(and(eq(examQuestions.examId, where.examId), eq(examQuestions.questionId, where.questionId)));
    },
    getExamQuestionsByExamId: async (examId) => {
        return await db
            .select()
            .from(examQuestions)
            .where(eq(examQuestions.examId, examId))
            .orderBy(examQuestions.questionOrder);
    },
    getExamQuestionsByQuestionId: async (questionId) => {
        return await db
            .select()
            .from(examQuestions)
            .where(eq(examQuestions.questionId, questionId));
    },
    /** Full exam questions with question-bank details for exam results/display */
    getExamQuestionsWithDetails: async (examId) => {
        return await db
            .select()
            .from(examQuestions)
            .innerJoin(questionBank, eq(questionBank.id, examQuestions.questionId))
            .leftJoin(questionChoices, eq(questionChoices.questionId, questionBank.id))
            .where(eq(examQuestions.examId, examId));
    },
    /** Find an exam-question row by questionId only */
    findByQuestionId: async (questionId) => {
        return await db
            .select()
            .from(examQuestions)
            .where(eq(examQuestions.questionId, questionId));
    },
    /** Bulk-reorder questions within an exam */
    bulkReorder: async (examId, orders) => {
        const results = [];
        for (const { questionId, questionOrder } of orders) {
            const [record] = await db
                .update(examQuestions)
                .set({ questionOrder })
                .where(and(eq(examQuestions.examId, examId), eq(examQuestions.questionId, questionId)))
                .returning();
            if (record)
                results.push(record);
        }
        return results;
    },
};
