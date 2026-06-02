import { createFactory } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { QuestionJobTitleSchema } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { QuestionJobTitlesRepo } from "./questionJobTitlesRepo.js";
import z from "zod";
const factory = createFactory();
export const getQuestionJobTitles = factory.createHandlers(sValidator("query", z.object({
    jobTitleId: z.string().optional(),
    questionId: z.string().optional(),
})), async (c) => {
    try {
        const { jobTitleId, questionId } = c.req.valid("query");
        const questions = await QuestionJobTitlesRepo.findAllQuestionJobTitlesByJobTitleId(jobTitleId);
        return c.json({
            data: questions,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        throw new HTTPException(500, {
            message: "failed to fetch question job titles",
            cause: "Internal Server Error",
        });
    }
});
export const createQuestionJobTitle = factory.createHandlers(sValidator("json", QuestionJobTitleSchema.array()), async (c) => {
    try {
        const questionJobTitles = c.req.valid("json");
        const createdQuestionJobTitles = await QuestionJobTitlesRepo.createQuestionJobTitle(questionJobTitles);
        return c.json({
            data: createdQuestionJobTitles,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        throw new HTTPException(500, {
            message: "failed to create question job title",
            cause: "Internal Server Error",
        });
    }
});
export const deleteQuestionJobTitle = factory.createHandlers(sValidator("param", z.object({ questionId: z.string() })), async (c) => {
    try {
        const { questionId } = c.req.valid("param");
        const deletedQuestionJobTitles = await QuestionJobTitlesRepo.deleteQuestionJobTitle(questionId);
        return c.json({
            data: deletedQuestionJobTitles,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        throw new HTTPException(500, {
            message: "failed to delete question job title",
            cause: "Internal Server Error",
        });
    }
});
