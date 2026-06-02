import { Hono } from "hono";
import { createQuestion, createQuestionInBatch, softDeleteQuestion, getQuestionById, getQuestions, updateQuestion, } from "./questionBankControllers.js";
import { deleteQuestionChoice, getQuestionChoicesByQuestionId, insertQuestionChoice, updateQuestionChoice, } from "../choices/questionChoicesController.js";
export const questionBankRouter = new Hono()
    .get("/", ...getQuestions)
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
    .delete("choices/:choiceId", ...deleteQuestionChoice);
