import { Hono } from "hono";
import { createJobTitle, deleteJobTitle, getAllJobTitles, getJobTitleById, updateJobTitle, createJobTitlesInBatch, } from "./job-titles-controllers.js";
export const jobTitlesRouter = new Hono()
    .get("/", ...getAllJobTitles)
    .get("/:jobTitleId", ...getJobTitleById)
    .post("/", ...createJobTitle)
    .post("/batch", ...createJobTitlesInBatch)
    .delete("/:jobTitleId", ...deleteJobTitle)
    .put("/", ...updateJobTitle);
