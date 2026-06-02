import { Hono } from "hono";
import { createQuestionJobTitle, deleteQuestionJobTitle, getQuestionJobTitles, } from "./questionJobTitlesController.js";
export const questionJobTitlesRouter = new Hono();
questionJobTitlesRouter.get("/", ...getQuestionJobTitles);
questionJobTitlesRouter.post("/", ...createQuestionJobTitle);
questionJobTitlesRouter.delete("/:questionId", ...deleteQuestionJobTitle);
