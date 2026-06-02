import { db } from "@/src/db/index.js";
import {
  questionBank,
  questionChoices,
  questionJobTitles,
  jobTitles as JobTitlesSchema,
  jobTitles,
} from "@/src/db/schema.js";
import { QuestionBankCreateSChema, QuestionBankEditSchema } from "./schema.js";
import type z from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { Factory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
export const QuestionBankRepo = {
  findAllQuestions: (conditions?: any) => {
    return db
      .select()
      .from(questionBank)
      .where(conditions)
      .orderBy(desc(questionBank.createdAt));
  },
  findQuestionById: async (id: string) => {
    const result = await db
      .select()
      .from(questionBank)
      .leftJoin(
        questionChoices,
        eq(questionBank.id, questionChoices.questionId),
      )
      .where(eq(questionBank.id, id))
      .orderBy(questionChoices.displayOrder); // important!

    if (result.length === 0) return null;

    // Group the choices manually
    const question = result[0].question_bank;
    const choices = result.map((row) => row.question_choices).filter(Boolean); // remove nulls if any

    return {
      ...question,
      choices, // now it's an array
    };
  },

  createQuestionBank: async (
    data: z.infer<typeof QuestionBankCreateSChema>,
  ) => {
    return db.transaction(async (tx) => {
      const [questionBankData] = await tx
        .insert(questionBank)
        .values({
          ...data,
        })
        .returning({
          questionBankId: questionBank.id,
        });

      const formattedChoices: Array<{
        choiceText: string;
        displayOrder: number;
        isCorrect: boolean;
        questionId: string;
      }> = data.choices.map((c) => ({
        choiceText: c.choiceText,
        displayOrder: c.displayOrder,
        isCorrect: c.isCorrect,
        questionId: questionBankData.questionBankId,
      }));

      await tx.insert(questionChoices).values(formattedChoices).returning({
        id: questionChoices.id,
      });
      const jobTitlesData = await tx
        .select()
        .from(JobTitlesSchema)
        .where(inArray(JobTitlesSchema.titleName, data.jobTitles));

      const formattedQuestionJobTitles = jobTitlesData.map((data) => ({
        jobTitleId: data.id,
        questionId: questionBankData.questionBankId,
      }));
      await tx.insert(questionJobTitles).values(formattedQuestionJobTitles);
      return questionBankData.questionBankId;
    });
  },
  updateQuestion: (
    id: string,
    data: z.infer<typeof QuestionBankEditSchema>,
  ) => {
    return db
      .update(questionBank)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(questionBank.id, id))
      .returning({
        id: questionBank.id,
      });
  },
  softDeleteQuestion: (id: string) => {
    return db
      .update(questionBank)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(questionBank.id, id))
      .returning({
        id: questionBank.id,
      });
  },
  deleteQuestion: (id: string) => {
    return db.delete(questionBank).where(eq(questionBank.id, id)).returning({
      id: questionBank.id,
    });
  },
  duplicateQuestion: async (id: string) => {
    const questionDetails = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.id, id));
    // .leftJoin(questionJobTitles, eq(questionJobTitles.questionId, id))
    // .leftJoin(questionChoices, eq(questionChoices.questionId, id));

    console.log(questionDetails);

    if (!questionDetails[0].id) {
      throw new HTTPException(403, {
        cause: "User Error ",
        message: "Question was not found to dublicate.",
      });
    }

    return questionDetails;

    // return db.insert();
  },
};
