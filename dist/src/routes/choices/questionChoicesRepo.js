import { db } from "@/src/db/index.js";
import { questionChoices } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";
import { QuestionChoicesCreateSchema, QuestionChoiceUpdateSchema, } from "./schema.js";
export const QuestionChoicesRepo = {
    /**
     * Finding question choices for a given question id
     * @param questionId
     * @returns Promise<QuestionChoices[]>
     */
    findQuestionChoicesByQuestionId: (questionId) => {
        return db
            .select()
            .from(questionChoices)
            .where(eq(questionChoices.questionId, questionId));
    },
    /**
     * Deleting question choices
     * @param questionId
     * @returns Promise<string>
     */
    deleteQuestionChoicesByQuestionId: (questionId) => {
        return db
            .delete(questionChoices)
            .where(eq(questionChoices.questionId, questionId));
    },
    // Delete Question Choice by its ID
    deleteQuestionChoiceById: (id) => {
        return db.delete(questionChoices).where(eq(questionChoices.id, id));
    },
    updateQuestionChoice: ({ choiceText, displayOrder, isCorrect, questionId, choiceId, }) => {
        return db
            .update(questionChoices)
            .set({
            choiceText,
            displayOrder,
            isCorrect,
            questionId,
        })
            .where(eq(questionChoices.id, choiceId))
            .returning({
            id: questionChoices.id,
            isCorrect: questionChoices.isCorrect,
        });
    },
    getQuestionChoiceById: (id) => {
        return db.select().from(questionChoices).where(eq(questionChoices.id, id));
    },
    getAllQuestionChoices: () => {
        return db.select().from(questionChoices);
    },
    addQuestionChoice: ({ choiceText, displayOrder, isCorrect, questionId, }) => {
        return db
            .insert(questionChoices)
            .values({
            choiceText,
            displayOrder,
            isCorrect,
            questionId,
        })
            .returning({
            id: questionChoices.id,
        });
    },
};
