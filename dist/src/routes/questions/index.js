import { Hono } from "hono";
import { createQuestion, createQuestionInBatch, softDeleteQuestion, getQuestionById, getQuestions, updateQuestion, getAllCategories, } from "./questionBankControllers.js";
import { deleteQuestionChoice, getQuestionChoicesByQuestionId, insertQuestionChoice, updateQuestionChoice, } from "../choices/questionChoicesController.js";
import { deleteQuestionJobTitle, getQuestionJobTitles, createQuestionJobTitle, } from "../question-jobtitles/questionJobTitlesController.js";
export const questionBankRouter = new Hono()
    .get("/", ...getQuestions)
    .get("/categories", ...getAllCategories)
    .get("/:id", ...getQuestionById)
    .post("/", ...createQuestion)
    .post("/batch", ...createQuestionInBatch)
    // .post("/:id/duplicate", )   /// Not implemented yet
    .patch("/:id", ...updateQuestion)
    .delete("/:id", ...softDeleteQuestion)
    /// Question Choices
    .get("/:id/choices", ...getQuestionChoicesByQuestionId)
    .post("/:id/choices", ...insertQuestionChoice)
    .patch("choices/:choiceId", ...updateQuestionChoice)
    .delete("choices/:choiceId", ...deleteQuestionChoice)
    // Question Jobtitles
    .get("/:id/job-titles", ...getQuestionJobTitles)
    .delete("/:questionId/job-titles/:jobTitleId", ...deleteQuestionJobTitle)
    .post("/:questionId/job-titles/:jobTitleId", ...createQuestionJobTitle);
