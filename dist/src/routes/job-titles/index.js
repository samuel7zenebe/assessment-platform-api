import { Hono } from "hono";
import { createJobTitle, deleteJobTitle, getAllJobTitles, getJobTitleById, getJobTitleByTitle, updateJobTitle, createJobTitlesInBatch, } from "./job-titles-controllers.js";
export const jobTitlesRouter = new Hono()
    .get("/", ...getAllJobTitles)
    .get("/:jobTitleId", ...getJobTitleById)
    .get("/title/:titleName", ...getJobTitleByTitle)
    .post("/", ...createJobTitle)
    .post("/batch", ...createJobTitlesInBatch)
    .delete("/:jobTitleId", ...deleteJobTitle)
    .put("/:id", ...updateJobTitle);
