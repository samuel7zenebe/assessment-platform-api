import { Hono } from "hono";
import {
  createQuestionJobTitle,
  deleteQuestionJobTitle,
  getQuestionJobTitles,
  getQuestionsJobTitles,
  availableQuestions,
} from "./questionJobTitlesController.js";

export const questionJobTitlesRouter = new Hono();

questionJobTitlesRouter.get("/", ...getQuestionsJobTitles);
questionJobTitlesRouter.post(
  "/available-questions/:jobTitleId",
  ...availableQuestions,
);
questionJobTitlesRouter.get("/:id/job-titles", ...getQuestionJobTitles);
questionJobTitlesRouter.post("/", ...createQuestionJobTitle);
questionJobTitlesRouter.delete(
  "/:questionId/:jobTitleId",
  ...deleteQuestionJobTitle,
);
