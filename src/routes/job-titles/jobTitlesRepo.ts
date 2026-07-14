import { db } from "@/src/db/index.js";
import { jobTitles } from "@/src/db/schema.js";
import { desc, eq, inArray, or } from "drizzle-orm";
import { CreateJobTitleSchema } from "./schema.js";
import z from "zod";

export const jobTitlesRepo = {
  findAllJobTitles: () => {
    return db.select().from(jobTitles).orderBy(desc(jobTitles.titleName));
  },
  findAccessibleJobTitles: ({
    jobTitleIds,
    departmentIds,
  }: {
    jobTitleIds: string[];
    departmentIds: string[];
  }) => {
    if (jobTitleIds.length === 0 && departmentIds.length === 0) return [];

    const conditions = [];
    if (jobTitleIds.length > 0) {
      conditions.push(inArray(jobTitles.id, jobTitleIds));
    }
    if (departmentIds.length > 0) {
      conditions.push(inArray(jobTitles.departmentId, departmentIds));
    }

    return db
      .select()
      .from(jobTitles)
      .where(or(...conditions))
      .orderBy(desc(jobTitles.titleName));
  },
  findJobTitleById: (id: string) => {
    return db.select().from(jobTitles).where(eq(jobTitles.id, id));
  },
  findJobTitleByTitle: (title: string) => {
    return db.select().from(jobTitles).where(eq(jobTitles.titleName, title));
  },
  createJobTitle: (titleName: string, departmentId?: string | null) => {
    return db
      .insert(jobTitles)
      .values({ titleName, departmentId })
      .returning({ id: jobTitles.id });
  },
  updateJobTitle: (id: string, data: { titleName: string; departmentId?: string | null }) => {
    const { titleName, departmentId } = data;
    return db
      .update(jobTitles)
      .set({
        titleName,
        departmentId,
      })
      .where(eq(jobTitles.id, id))
      .returning();
  },

  deleteJobTitle: (id: string) => {
    return db.delete(jobTitles).where(eq(jobTitles.id, id)).returning({
      id: jobTitles.id,
    });
  },
};
