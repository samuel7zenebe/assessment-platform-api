import { db } from "@/src/db/index.js";
import { questionChoices } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";
import type z from "zod";
import {
  QuestionChoicesCreateSchema,
  QuestionChoiceUpdateSchema,
} from "./schema.js";

export const QuestionChoicesRepo = {
  /**
   * Finding question choices for a given question id
   * @param questionId
   * @returns Promise<QuestionChoices[]>
   */
  findQuestionChoicesByQuestionId: (questionId: string) => {
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
  deleteQuestionChoicesByQuestionId: (questionId: string) => {
    return db
      .delete(questionChoices)
      .where(eq(questionChoices.questionId, questionId));
  },

  // Delete Question Choice by its ID
  deleteQuestionChoiceById: (id: string) => {
    return db.delete(questionChoices).where(eq(questionChoices.id, id));
  },

  updateQuestionChoice: ({
    choiceText,
    displayOrder,
    isCorrect,
    questionId,
    choiceId,
  }: z.infer<typeof QuestionChoiceUpdateSchema>) => {
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
      });
  },
  getQuestionChoiceById: (id: string) => {
    return db.select().from(questionChoices).where(eq(questionChoices.id, id));
  },
  getAllQuestionChoices: () => {
    return db.select().from(questionChoices);
  },
  addQuestionChoice: ({
    choiceText,
    displayOrder,
    isCorrect,
    questionId,
  }: z.infer<typeof QuestionChoicesCreateSchema>) => {
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
