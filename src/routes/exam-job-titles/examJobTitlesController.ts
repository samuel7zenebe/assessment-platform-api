import { createFactory } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { HTTPException } from "hono/http-exception";
import { examJobTitlesRepo } from "./examJobTitlesRepo.js";
import {
  CreateExamJobTitleSchema,
  DeleteExamJobTitleSchema,
  ExamJobTitleIdSchema,
  UpdateExamJobTitleSchema,
} from "./schema.js";
import { IdParamSchema } from "@/src/lib/schemas/common.js";
import z from "zod";

const factory = createFactory();

// ── GET  /exam-job-titles  → list all ─────────────────────────────────────
export const getAllExamJobTitles = factory.createHandlers(async (c) => {
  try {
    const examJobTitles = await examJobTitlesRepo.findAll();

    return c.json({ data: examJobTitles, success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      cause: "Internal Server Error",
      message: "An error occurred while fetching exam-job-titles",
    });
  }
});

// ── GET  /:id  → get exam job titles by exam id ─────────────────────────────
export const getExamJobTitlesByExamId = factory.createHandlers(
  sValidator("param", z.object({ examId: z.uuid() })),
  async (c) => {
    try {
      const { examId } = c.req.valid("param");
      const data = await examJobTitlesRepo.findExamJobTitles(examId);
      return c.json(
        {
          data,
          success: true,
        },
        { status: data.length > 0 ? 200 : 404 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching exam job titles",
      });
    }
  },
);

// ── GET  /:id  → get exam job titles by job title id ───────────────────────
export const getExamJobTitlesByJobTitleId = factory.createHandlers(
  sValidator("param", z.object({ jobTitleId: z.uuid() })),
  async (c) => {
    try {
      const { jobTitleId } = c.req.valid("param");
      const data =
        await examJobTitlesRepo.findExamJobTitlesByJobTitleId(jobTitleId);
      return c.json(
        {
          data,
          success: true,
        },
        { status: data.length > 0 ? 200 : 404 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching exam job titles",
      });
    }
  },
);

// ── GET  /:id  → get exam job title by id ───────────────────────────────────
export const getExamJobTitlesById = factory.createHandlers(
  sValidator("param", IdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const data = await examJobTitlesRepo.findById(id);
      if (!data.length) {
        throw new HTTPException(404, {
          message: "Exam job title not found",
        });
      }
      return c.json({ data, success: true }, { status: 200 });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching exam-job-title",
      });
    }
  },
);

// ── POST  /:examId/:jobTitleId  → create exam job title ───────────────────────
export const createExamJobTitle = factory.createHandlers(
  sValidator(
    "param",
    CreateExamJobTitleSchema.pick({
      examId: true,
      jobTitleId: true,
    }),
  ),
  sValidator(
    "json",
    CreateExamJobTitleSchema.omit({
      examId: true,
      jobTitleId: true,
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const { examId, jobTitleId } = c.req.valid("param");
      const result = await examJobTitlesRepo.create({
        ...data,
        examId,
        jobTitleId,
      });

      return c.json(
        {
          data: result,
          success: true,
          message: "Exam job title added successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating exam job title",
      });
    }
  },
);

// ── POST   /:id  → add job title to exam ─────────────────────────────────────
export const addJobTitle = factory.createHandlers(
  sValidator("param", IdParamSchema),
  sValidator(
    "json",
    CreateExamJobTitleSchema.pick({
      jobTitleId: true,
      weightPercentage: true,
      isPrimary: true,
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const { id } = c.req.valid("param");
      const result = await examJobTitlesRepo.create({
        ...data,
        examId: id,
      });
      return c.json(
        {
          data: result,
          success: true,
          message: " New job-title has been added successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while adding job title to exam-job-titles",
      });
    }
  },
);

// ── PATCH  /:id/:jobTitleId  → edit exam job title ──────────────────────────
export const editExamJobTitle = factory.createHandlers(
  sValidator("param", ExamJobTitleIdSchema),
  sValidator(
    "json",
    UpdateExamJobTitleSchema.omit({
      examId: true,
      jobTitleId: true,
    }),
  ),
  async (c) => {
    try {
      const { examId, jobTitleId } = c.req.valid("param");

      const data = c.req.valid("json");

      const result = await examJobTitlesRepo.update(examId, jobTitleId, {
        ...data,
      });
      if (!result.length) {
        throw new HTTPException(404, {
          message: "Exam job title not found",
        });
      }
      return c.json(
        {
          data: result,
          success: true,
          message: "Exam job title updated successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while updating exam job title",
      });
    }
  },
);

// ── DELETE /:id/:jobTitleId  → delete exam job title ─────────────────────────
export const deleteExamJobTitle = factory.createHandlers(
  sValidator("param", ExamJobTitleIdSchema),
  async (c) => {
    try {
      const { examId, jobTitleId } = c.req.valid("param");
      const result = await examJobTitlesRepo.delete(examId, jobTitleId);
      if (!result.length) {
        throw new HTTPException(404, {
          message: "Exam job title not found",
        });
      }
      return c.json(
        {
          data: result,
          success: true,
          message: "Exam job title deleted successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while deleting exam job title",
      });
    }
  },
);