import { createFactory } from "hono/factory";
import { QuestionBankRepo } from "./questionBankRepo.js";
import { sValidator } from "@hono/standard-validator";
import {
  QuestionBankCreateSChema,
  QuestionBankEditSchema,
  QuestionBankSearchSchema,
} from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { ilike, isNull, or, isNotNull } from "drizzle-orm";
import { questionBank, user } from "@/src/db/schema.js";
import z from "zod";
import { hasPermission } from "@/src/middleware/auth.js";

const factory = createFactory<{}>();

export const getQuestions = factory.createHandlers(
  sValidator("query", QuestionBankSearchSchema),
  async (c) => {
    const { field, searchTerm, deleted } = c.req.valid("query");

    try {
      let conditions = [];

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;

        if (field === "all" || field === "question") {
          conditions.push(ilike(questionBank.question, searchPattern));
        }
        if (field === "all" || field === "category") {
          conditions.push(ilike(questionBank.category, searchPattern));
        }
      }
      if (deleted) {
        conditions.push(isNotNull(questionBank.deletedAt));
      } else {
        conditions.push(isNull(questionBank.deletedAt));
      }

      const questionsData = await QuestionBankRepo.findAllQuestions(
        conditions.length > 0 ? or(...conditions) : undefined,
      );

      return c.json(
        {
          data: questionsData,
          success: true,
          total: questionsData.length,
        },
        {
          status: questionsData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching questions",
      });
    }
  },
);

export const getQuestionById = factory.createHandlers(
  sValidator("param", z.object({ id: z.uuid() })),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const question = await QuestionBankRepo.findQuestionById(id);
      return c.json(
        {
          data: question,
          success: true,
        },
        {
          status: question?.id ? 200 : 404,
        },
      );
    } catch (err) {
      console.log("Error fetching question : " + err);
      throw new HTTPException(500, {
        message: "failed to fetch question",
        cause: "Internal Server Error",
      });
    }
  },
);

export const createQuestion = factory.createHandlers(
  hasPermission({
    resource: "question",
    action: "create",
  }),
  sValidator("json", QuestionBankCreateSChema),
  async (c) => {
    const { id: userId, role: userRole } = c.get("user" as any);

    if (userRole === "CANDIDATE") {
      throw new HTTPException(403, {
        message: "Current user is not allowed to store question",
        cause: "Unauthorized Access ",
      });
    }

    const validData = c.req.valid("json");
    console.log("Valid Data: ", validData);
    try {
      const newQuestionId = await QuestionBankRepo.createQuestionBank({
        ...validData,
        createdBy: userId,
      });

      if (!newQuestionId) {
        throw new HTTPException(500, {
          message: "Something went wrong",
          cause: "unknown error occured",
        });
      }
      return c.json({
        data: {
          questionId: newQuestionId,
        },
        success: true,
        message: `A question with id ${newQuestionId} is created successfully.`,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating questions",
      });
    }
  },
);

export const createQuestionInBatch = factory.createHandlers(
  sValidator("json", z.array(QuestionBankCreateSChema)),
  async (c) => {
    const { id: userId, role: userRole } = c.get("user" as any);

    if (userRole === "CANDIDATE") {
      throw new HTTPException(403, {
        message: "Current user is not allowed to store question",
        cause: "Unauthorized Access ",
      });
    }

    const validData = c.req.valid("json");
    try {
      let newQuestionId = [];
      for (const question of validData) {
        const newQuestion = await QuestionBankRepo.createQuestionBank({
          ...question,
          createdBy: userId,
        });
        newQuestionId.push(newQuestion);
      }

      return c.json({
        data: {
          questionId: newQuestionId,
        },
        success: true,
        message: `A question with id ${newQuestionId.map((id) => id)} are created successfully.`,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating questions",
      });
    }
  },
);

export const updateQuestion = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      id: z.uuid(),
    }),
  ),
  sValidator("json", QuestionBankEditSchema),
  async (c) => {
    const validData = c.req.valid("json");
    const { id } = c.req.valid("param");

    try {
      const edit_question = await QuestionBankRepo.updateQuestion(
        id,
        validData,
      );

      return c.json({
        data: edit_question,
        success: true,
        message: `A question with id ${edit_question[0].id} is edited successfully.`,
      });
    } catch (err) {
      console.log("Error Editing question bank record : ", err);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: `Failed to edit question record with id : ${id}`,
      });
    }
  },
);
// Soft Delete a Question
export const softDeleteQuestion = factory.createHandlers(
  sValidator("param", z.object({ id: z.string().min(1) })),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const delete_question = await QuestionBankRepo.softDeleteQuestion(id);

      return c.json({
        data: delete_question,
        success: true,
        message: `A question with id ${delete_question[0].id} is deleted successfully.`,
      });
    } catch (err) {
      console.log("Error deleting question record : ", err);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: `Failed to deleting question record with id : ${id}`,
      });
    }
  },
);

export const deleteQuestion = factory.createHandlers(
  sValidator("param", z.object({ id: z.string().min(1) })),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const delete_question = await QuestionBankRepo.deleteQuestion(id);

      return c.json({
        data: delete_question,
        success: true,
        message: `A question with id ${delete_question[0].id} is deleted successfully.`,
      });
    } catch (err) {
      console.log("Error deleting question record : ", err);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: `Failed to deleting question record with id : ${id}`,
      });
    }
  },
);
