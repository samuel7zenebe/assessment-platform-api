import { db } from "@/src/db/index.js";
import { questionJobTitles, jobTitles as jobTitlesSchema, questionBank, jobTitles, } from "@/src/db/schema.js";
import { and, eq, sql, count } from "drizzle-orm";
import { getQuestionDifficultyDistribution } from "../exams/utils.js";
export const QuestionJobTitlesRepo = {
    findAllQuestionJobTitlesByJobTitleId: (jobTitleId, questionId) => {
        let condition = sql `1 = 1`;
        if (jobTitleId) {
            condition = sql `${questionJobTitles.jobTitleId} = ${jobTitleId}`;
        }
        if (questionId) {
            condition = sql `${questionJobTitles.questionId} = ${questionId}`;
        }
        return db
            .select({
            jobTitle: jobTitlesSchema.titleName,
            question: questionBank.question,
            category: questionBank.category,
            difficultyLevel: questionBank.difficultyLabel,
            questionType: questionBank.type,
            questionId: questionBank.id,
            jobTitleId: jobTitlesSchema.id,
        })
            .from(questionJobTitles)
            .innerJoin(jobTitlesSchema, eq(questionJobTitles.jobTitleId, jobTitlesSchema.id))
            .innerJoin(questionBank, eq(questionJobTitles.questionId, questionBank.id))
            .where(condition);
    },
    createQuestionJobTitle: (data) => {
        return db.insert(questionJobTitles).values(data).returning({
            id: questionJobTitles.jobTitleId,
        });
    },
    getQuestionJobTitles: (questionId) => {
        return db
            .select()
            .from(questionJobTitles)
            .where(eq(questionJobTitles.questionId, questionId));
    },
    deleteQuestionJobTitle: (questionId, jobTitleId) => {
        return db
            .delete(questionJobTitles)
            .where(and(eq(questionJobTitles.questionId, questionId), eq(questionJobTitles.jobTitleId, jobTitleId)))
            .returning({
            questionId: questionJobTitles.questionId,
        });
    },
    checkingQuestionsExistence: async ({ difficultyLevel, totalQuestions, jobTitle, }) => {
        const distribution = getQuestionDifficultyDistribution({
            difficultyLevel,
            totalQuestions,
        });
        let questionsCount = await db
            .select({
            difficultyLabel: questionBank.difficultyLabel,
            titleName: jobTitles.titleName,
            total: count(questionBank.id),
        })
            .from(questionJobTitles)
            .leftJoin(jobTitles, eq(questionJobTitles.jobTitleId, jobTitles.id))
            .leftJoin(questionBank, eq(questionJobTitles.questionId, questionBank.id))
            .where(eq(questionJobTitles.jobTitleId, jobTitle.id))
            .groupBy(questionBank.difficultyLabel, jobTitles.titleName);
        return questionsCount.map((data) => {
            const requiredCount = Math.round(distribution[data.difficultyLabel?.toLowerCase()] *
                (jobTitle.weight / 100));
            return {
                difficultyLabel: data.difficultyLabel,
                titleName: data.titleName,
                total: data.total,
                required: requiredCount,
                hasEnough: data.total >= requiredCount,
                message: data.total >= requiredCount
                    ? `Sufficient  ${data.difficultyLabel?.toLowerCase()} questions`
                    : `Insufficient ${data.difficultyLabel?.toLowerCase()} questions`,
            };
        });
    },
};
