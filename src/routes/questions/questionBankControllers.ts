import { createFactory } from "hono/factory";
import { QuestionBankRepo } from "./questionBankRepo.js";
import { sValidator } from "@hono/standard-validator";
import {
  QuestionBankCreateSchema,
  QuestionBankSearchSchema,
  UpdateQuestionBankSchema,
} from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { db } from "@/src/db/index.js";
import { ilike, isNull, and, isNotNull, inArray, eq, or } from "drizzle-orm";
import {
  questionBank,
  user,
  questionJobTitles,
  jobTitles,
} from "@/src/db/schema.js";
import z from "zod";
import { hasPermission } from "@/src/middleware/auth.js";
import { parseQuestionBankExcel } from "@/src/lib/parse-excel-questions.js";
import { getJobTitleIds, getUserByEmail } from "@/src/lib/helper-funs.js";

const factory = createFactory<{}>();

export const getQuestions = factory.createHandlers(
  sValidator("query", QuestionBankSearchSchema),
  async (c) => {
    const {
      field = "all",
      searchTerm,
      includeDeleted,
      jobTitleId,
      category,
      pageSize = 10,
      pageNumber = 1,
    } = c.req.valid("query");

    try {
      let conditions = [];

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;

        if (field === "question") {
          conditions.push(ilike(questionBank.question, searchPattern));
        }
        if (field === "category") {
          conditions.push(ilike(questionBank.category, searchPattern));
        }
        if (field === "all") {
          conditions.push(
            or(
              ilike(questionBank.category, searchPattern),
              ilike(questionBank.question, searchPattern),
            ),
          );
        }
      }
      if (category) {
        conditions.push(eq(questionBank.category, category));
      }
      if (!includeDeleted) {
        conditions.push(isNull(questionBank.deletedAt));
      }
      if (jobTitleId) {
        conditions.push(
          inArray(
            questionBank.id,
            db
              .select({ id: questionJobTitles.questionId })
              .from(questionJobTitles)
              .where(eq(questionJobTitles.jobTitleId, jobTitleId)),
          ),
        );
      }

      // For testing it shall be enabled later
      // const { id: userId } = c.get("user");

      // conditions.push(eq(questionBank.createdBy, userId));

      const questionsData = await QuestionBankRepo.findAllQuestions({
        pageSize: Number(pageSize),
        pageNumber: Number(pageNumber),
        conditions: conditions.length > 0 ? and(...conditions) : undefined,
      });

      const totalQuestions = await db.select().from(questionBank);

      return c.json({
        data: questionsData,
        success: true,
        total: totalQuestions.length,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching questions",
      });
    }
  },
);

export const getAllCategories = factory.createHandlers(async (c) => {
  try {
    const categories = await QuestionBankRepo.getAllCategories();

    return c.json(
      {
        data: categories,
        success: true,
        total: categories.length,
      },
      {
        status: categories.length > 0 ? 200 : 404,
      },
    );
  } catch (error) {
    throw new HTTPException(500, {
      cause: "Internal Server Error",
      message: "An error occurred while fetching categories",
    });
  }
});

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
  sValidator(
    "json",
    QuestionBankCreateSchema.omit({
      createdBy: true,
    }),
  ),
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
      const newQuestionId = await QuestionBankRepo.createQuestionBankRecord({
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
  hasPermission({
    resource: "question",
    action: "create",
  }),
  sValidator("json", z.array(QuestionBankCreateSchema)),
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
        const newQuestion = await QuestionBankRepo.createQuestionBankRecord({
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

export const createQuestionInBatchExcel = factory.createHandlers(
  hasPermission({
    resource: "question",
    action: "create",
  }),
  sValidator(
    "form",
    z.object({
      file: z
        .file()
        .refine(
          (file) =>
            file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          {
            message: "Only Excel files are allowed",
          },
        ),
    }),
  ),
  async (c) => {
    const { id: userId, role: userRole } = c.get("user" as any);

    if (userRole === "CANDIDATE") {
      throw new HTTPException(403, {
        message: "Current user is not allowed to store question",
        cause: "Unauthorized Access ",
      });
    }

    const file = c.req.valid("form").file;
    try {
      const { questions, errors, summary } = await parseQuestionBankExcel(file);

      if (errors.length > 0) {
        return c.json(
          {
            data: {
              questions,
              errors,
              summary,
            },
            success: false,
            message: `Some questions failed to parse. Please check the errors for details.`,
          },
          { status: 400 },
        );
      }

      let newQuestionId = [];
      for (const question of questions) {
        const creator = await getUserByEmail({
          email: question.createdBy,
        });
        if (!creator?.data?.id) {
          return c.json(
            {
              message: "Creator is unknown",
              success: false,
              data: null,
            },
            {
              status: 400,
            },
          );
        }

        const jobTitleIds = await getJobTitleIds({
          titleNames: question.jobTitles,
        });

        if (
          !jobTitleIds?.data.jobTitleIds?.length ||
          jobTitleIds.data.jobTitleIds.length < 1
        ) {
          return c.json(
            {
              message: "Invalid or missing jobtitles.",
              success: false,
              data: null,
            },
            {
              status: 400,
            },
          );
        }

        const newQuestion = await QuestionBankRepo.createQuestionBankRecord({
          ...question,
          createdBy: creator.data?.id,
          jobTitles: jobTitleIds.data.jobTitleIds,
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
  sValidator("json", UpdateQuestionBankSchema),
  async (c) => {
    const validData = c.req.valid("json");
    const { id } = c.req.valid("param");
    console.log("Valid Data: ", validData);
    console.log(validData);
    try {
      const edit_question = await QuestionBankRepo.updateQuestion(id, {
        ...validData,
        updatedAt: new Date(),
      });

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
