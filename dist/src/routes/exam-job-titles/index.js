import { Hono } from "hono";
import { createExamJobTitle, deleteExamJobTitle, getExamJobTitlesById, getAllExamJobTitles, editExamJobTitle, } from "./examJobTitlesController.js";
export const examJobTitlesRouter = new Hono()
    .get("/", ...getAllExamJobTitles)
    .get("/:id", ...getExamJobTitlesById)
    .post("/:id/job-titles", ...createExamJobTitle)
    .patch("/:id/:job-titles/:jobTitleId", ...editExamJobTitle)
    .delete("/:id/job-titles/:jobTitleId", ...deleteExamJobTitle);
