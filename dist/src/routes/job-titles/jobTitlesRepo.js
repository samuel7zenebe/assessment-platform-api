import { db } from "@/src/db/index.js";
import { jobTitles } from "@/src/db/schema.js";
import { desc, eq } from "drizzle-orm";
import { CreateJobTitleSchema } from "./schema.js";
import z from "zod";
export const jobTitlesRepo = {
    findAllJobTitles: () => {
        return db.select().from(jobTitles).orderBy(desc(jobTitles.titleName));
    },
    findJobTitleById: (id) => {
        return db.select().from(jobTitles).where(eq(jobTitles.id, id));
    },
    findJobTitleByTitle: (title) => {
        return db.select().from(jobTitles).where(eq(jobTitles.titleName, title));
    },
    createJobTitle: (titleName) => {
        return db
            .insert(jobTitles)
            .values({ titleName })
            .returning({ id: jobTitles.id });
    },
    updateJobTitle: (id, data) => {
        return db
            .update(jobTitles)
            .set({
            titleName: data.titleName,
        })
            .where(eq(jobTitles.id, id))
            .returning();
    },
    deleteJobTitle: (id) => {
        return db.delete(jobTitles).where(eq(jobTitles.id, id)).returning({
            id: jobTitles.id,
        });
    },
};
