import { db } from "@/src/db/index.js";
import { questionJobTitles, jobTitles as jobTitlesSchema, questionBank, } from "@/src/db/schema.js";
import { eq, sql } from "drizzle-orm";
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
            difficultyLevel: questionBank.difficultyLevel,
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
    deleteQuestionJobTitle: (questionId) => {
        return db
            .delete(questionJobTitles)
            .where(eq(questionJobTitles.questionId, questionId))
            .returning({
            questionId: questionJobTitles.questionId,
        });
    },
};
