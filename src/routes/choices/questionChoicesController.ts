import { createFactory } from "hono/factory";
import { QuestionChoicesRepo } from "./questionChoicesRepo.js";
import { sValidator } from "@hono/standard-validator";
import z from "zod";
import { HTTPException } from "hono/http-exception";
import {
  CreateQuestionChoiceSchema,
  QuestionChoiceSchema,
  QuestionChoiceUpdateSchema,
} from "./schema.js";
import { db } from "@/src/db/index.js";
import { questionBank, questionChoices } from "@/src/db/schema.js";
import { and, eq, not } from "drizzle-orm";

const factory = createFactory({});

export const getQuestionChoicesByQuestionId = factory.createHandlers(
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const choices =
        await QuestionChoicesRepo.findQuestionChoicesByQuestionId(id);

      if (choices.length === 0) {
        throw new HTTPException(404, {
          message: "No question choices found for the given question id",
          cause: "Not Found",
        });
      }

      return c.json(
        {
          data: choices,
          success: true,
          message: "Question choices fetched successfully",
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      console.log(error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "Failed to fetch question choices",
        cause: "Internal Server Error",
      });
    }
  },
);
export const getQuestionChoiceById = factory.createHandlers(
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const [choice] = await QuestionChoicesRepo.getQuestionChoiceById(id);

      return c.json(
        {
          data: choice,
          success: true,
          message: "Choice was fetched successfully",
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      console.log(error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "Failed to fetch question choice.",
        cause: "Internal Server Error",
      });
    }
  },
);

export const getAllQuestionChoices = factory.createHandlers(async (c) => {
  try {
    const choices = await QuestionChoicesRepo.getAllQuestionChoices();

    return c.json(
      {
        data: choices,
        success: true,
        message: "Choice was fetched successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to fetch question choice.",
      cause: "Internal Server Error",
    });
  }
});
export const updateQuestionChoice = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      choiceId: z.string(),
    }),
  ),

  sValidator(
    "json",
    QuestionChoiceUpdateSchema.omit({
      choiceId: true,
    }).extend({
      questionId: z.string(),
    }),
  ),
  async (c) => {
    const { choiceId } = c.req.valid("param");
    const { choiceText, displayOrder, isCorrect, questionId } =
      c.req.valid("json");
    try {
      if (isCorrect) {
        await db
          .update(questionChoices)
          .set({
            isCorrect: false,
          })
          .where(
            and(
              eq(questionChoices.isCorrect, true),
              eq(questionChoices.questionId, questionId),
            ),
          );
      }
      const [choice] = await QuestionChoicesRepo.updateQuestionChoice({
        choiceText,
        displayOrder,
        isCorrect,
        questionId,
        choiceId,
      });
      return c.json(
        {
          data: choice,
          success: true,
          message: "Question choice updated successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        message: "Failed to update question choice",
        cause: "Internal Server Error",
      });
    }
  },
);

export const insertQuestionChoice = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  sValidator("json", CreateQuestionChoiceSchema),
  async (c) => {
    const { choiceText, displayOrder, isCorrect } = c.req.valid("json");
    const { id: questionId } = c.req.valid("param");
    try {
      const [questionBankRecord] = await db
        .select()
        .from(questionBank)
        .leftJoin(
          questionChoices,
          eq(questionBank.id, questionChoices.questionId),
        )
        .where(eq(questionBank.id, questionId));

      if (
        isCorrect &&
        !questionBankRecord.question_bank.questionData?.multipleSelection
      ) {
        await db
          .update(questionChoices)
          .set({
            isCorrect: false,
          })
          .where(eq(questionChoices.questionId, questionId));
      }

      const choice = await QuestionChoicesRepo.addQuestionChoice({
        choiceText,
        displayOrder,
        isCorrect,
        questionId,
      });
      return c.json(
        {
          data: choice,
          success: true,
          message: "Question choice inserted successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        message: "Failed to insert question choice",
        cause: "Internal Server Error",
      });
    }
  },
);

// Delete Question Choice
export const deleteQuestionChoice = factory.createHandlers(
  sValidator("param", z.object({ choiceId: z.uuid() })),
  async (c) => {
    const { choiceId } = c.req.valid("param");
    try {
      const choice =
        await QuestionChoicesRepo.deleteQuestionChoiceById(choiceId);
      return c.json(
        {
          data: choice,
          success: true,
          message: "Question choice deleted successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        message: "Failed to delete question choice",
        cause: "Internal Server Error",
      });
    }
  },
);
