import { db } from "@/src/db/index.js";
import {
  questionBank,
  questionChoices,
  questionJobTitles,
  jobTitles as JobTitlesSchema,
  jobTitles,
} from "@/src/db/schema.js";
import {
  QuestionBankCreateSchema,
  UpdateQuestionBankSchema,
} from "./schema.js";
import type z from "zod";
import { desc, eq, inArray, isNull, count } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const QuestionBankRepo = {
  findAllQuestions: ({
    pageNumber,
    pageSize,
    conditions,
  }: {
    pageSize: number;
    pageNumber: number;
    conditions?: any;
  }) => {
    return db
      .select()
      .from(questionBank)
      .where(conditions)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .orderBy(desc(questionBank.createdAt));
  },

  getAllCategories: async () => {
    const result = await db
      .select({
        category: questionBank.category,
        total: count(questionBank.id),
      })
      .from(questionBank)
      .where(isNull(questionBank.deletedAt))
      .groupBy(questionBank.category)
      .orderBy(questionBank.category);

    return result;
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
  createQuestionBankRecord: async (
    data: z.infer<typeof QuestionBankCreateSchema>,
  ) => {
    const { choices, jobTitles, ...questionBankData } = data;

    console.log(" JobTitles: ", jobTitles);
    // console.log("Choices : ", choices);

    return db.transaction(async (tx) => {
      const [questionBankDataRow] = await tx
        .insert(questionBank)
        .values({
          audioUrl: questionBankData.audioUrl,
          category: questionBankData.category,
          question: questionBankData.question,
          createdBy: questionBankData.createdBy,
          difficultyLabel: questionBankData.difficultyLabel,
          estimatedTimeSeconds: questionBankData.estimatedTimeSeconds,
          explanation: questionBankData.explanation,
          imageUrl: questionBankData.imageUrl,
          isActive: questionBankData.isActive,
          isPublic: questionBankData.isPublic,
          points: questionBankData.points,
          title: questionBankData.title,
          type: questionBankData.type,
          version: questionBankData.version,
          videoUrl: questionBankData.videoUrl,
          updatedAt: questionBankData.updatedAt
            ? new Date(questionBankData.updatedAt)
            : new Date(),
        })
        .returning({
          questionBankId: questionBank.id,
        });

      const formattedChoices = choices.map((c) => ({
        choiceText: c.choiceText,
        displayOrder: c.displayOrder,
        isCorrect: c.isCorrect,
        questionId: questionBankDataRow.questionBankId,
      }));

      await tx.insert(questionChoices).values(formattedChoices).returning({
        id: questionChoices.id,
      });

      const formattedQuestionJobTitles = jobTitles.map((jt) => ({
        jobTitleId: jt,
        questionId: questionBankDataRow.questionBankId,
      }));

      await tx.insert(questionJobTitles).values(formattedQuestionJobTitles);
      return questionBankDataRow.questionBankId;
    });
  },
  updateQuestion: (
    id: string,
    data: z.infer<typeof UpdateQuestionBankSchema>,
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
