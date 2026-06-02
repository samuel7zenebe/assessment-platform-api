import { createFactory } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { HTTPException } from "hono/http-exception";
import { hasPermission } from "@/src/middleware/auth.js";
import { examJobTitlesRepo } from "./examJobTitlesRepo.js";
import { CreateExamJobTitleSchema, DeleteExamJobTitleSchema, UpdateExamJobTitleSchema, } from "./schema.js";
import z from "zod";
const factory = createFactory();
const GetExamJobTitlesSchema = z.object({
    id: z.string().uuid(),
});
export const getAllExamJobTitles = factory.createHandlers(hasPermission({ resource: "exam", action: "read" }), async (c) => {
    try {
        const examJobTitles = await examJobTitlesRepo.findAll();
        return c.json({ data: examJobTitles, success: true }, { status: 200 });
    }
    catch (error) {
        if (error instanceof HTTPException)
            throw error;
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while fetching exam-job-titles",
        });
    }
});
export const getExamJobTitlesByExamId = factory.createHandlers(hasPermission({ resource: "exam", action: "read" }), sValidator("param", GetExamJobTitlesSchema), async (c) => {
    try {
        const { id: examId } = c.req.valid("param");
        const data = await examJobTitlesRepo.findExamJobTitles(examId);
        return c.json({
            data,
            success: true,
        }, { status: data.length > 0 ? 200 : 404 });
    }
    catch (error) {
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while fetching exam job titles",
        });
    }
});
export const getExamJobTitlesByJobTitleId = factory.createHandlers(hasPermission({ resource: "exam", action: "read" }), sValidator("param", GetExamJobTitlesSchema), async (c) => {
    try {
        const { id: jobTitleId } = c.req.valid("param");
        const data = await examJobTitlesRepo.findExamJobTitlesByJobTitleId(jobTitleId);
        return c.json({
            data,
            success: true,
        }, { status: data.length > 0 ? 200 : 404 });
    }
    catch (error) {
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while fetching exam job titles",
        });
    }
});
export const getExamJobTitlesById = factory.createHandlers(hasPermission({ resource: "exam", action: "read" }), sValidator("param", z.object({
    id: z.string(),
})), async (c) => {
    try {
        const { id } = c.req.valid("param");
        const data = await examJobTitlesRepo.findById(id);
        if (!data.length) {
            throw new HTTPException(404, {
                message: "Exam job title not found",
            });
        }
        return c.json({ data, success: true }, { status: 200 });
    }
    catch (error) {
        if (error instanceof HTTPException)
            throw error;
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while fetching exam-job-title",
        });
    }
});
export const createExamJobTitle = factory.createHandlers(hasPermission({ resource: "exam", action: "create" }), sValidator("param", CreateExamJobTitleSchema.pick({
    examId: true,
    jobTitleId: true,
})), sValidator("json", CreateExamJobTitleSchema.omit({
    examId: true,
    jobTitleId: true,
})), async (c) => {
    try {
        const data = c.req.valid("json");
        const { examId, jobTitleId } = c.req.valid("param");
        const result = await examJobTitlesRepo.create({
            ...data,
            examId,
            jobTitleId,
        });
        return c.json({
            data: result,
            success: true,
            message: "Exam job title added successfully",
        }, { status: 201 });
    }
    catch (error) {
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while creating exam job title",
        });
    }
});
// Adding job-title to an existing exam-jobtitles
export const addJobTitle = factory.createHandlers(hasPermission({ resource: "exam", action: "create" }), sValidator("param", z.object({
    id: z.uuid(),
})), sValidator("json", CreateExamJobTitleSchema.pick({
    jobTitleId: true,
    weightPercentage: true,
    isPrimary: true,
})), async (c) => {
    try {
        const data = c.req.valid("json");
        const { id } = c.req.valid("param");
        const result = await examJobTitlesRepo.create({
            ...data,
            examId: id,
        });
        return c.json({
            data: result,
            success: true,
            message: " New job-title has been added successfully",
        }, { status: 201 });
    }
    catch (error) {
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while adding job title to exam-job-titles",
        });
    }
});
export const editExamJobTitle = factory.createHandlers(sValidator("param", z.object({
    id: z.string(),
    jobTitleId: z.string(),
})), sValidator("json", UpdateExamJobTitleSchema.omit({
    examId: true,
    jobTitleId: true,
})), async (c) => {
    try {
        const { id, jobTitleId } = c.req.valid("param");
        const data = c.req.valid("json");
        const result = await examJobTitlesRepo.update(id, jobTitleId, {
            ...data,
        });
        if (!result.length) {
            throw new HTTPException(404, {
                message: "Exam job title not found",
            });
        }
        return c.json({
            data: result,
            success: true,
            message: "Exam job title updated successfully",
        }, { status: 200 });
    }
    catch (error) {
        if (error instanceof HTTPException)
            throw error;
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while updating exam job title",
        });
    }
});
export const deleteExamJobTitle = factory.createHandlers(hasPermission({ resource: "exam", action: "delete" }), sValidator("param", z.object({
    id: z.uuid(),
    jobTitleId: z.uuid(),
})), async (c) => {
    try {
        const { id, jobTitleId } = c.req.valid("param");
        const result = await examJobTitlesRepo.delete(id, jobTitleId);
        if (!result.length) {
            throw new HTTPException(404, {
                message: "Exam job title not found",
            });
        }
        return c.json({
            data: result,
            success: true,
            message: "Exam job title deleted successfully",
        }, { status: 200 });
    }
    catch (error) {
        if (error instanceof HTTPException)
            throw error;
        throw new HTTPException(500, {
            cause: "Internal Server Error",
            message: "An error occurred while deleting exam job title",
        });
    }
});
