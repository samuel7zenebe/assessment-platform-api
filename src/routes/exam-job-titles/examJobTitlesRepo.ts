import { db } from "@/src/db/index.js";
import { examJobTitles, exams, jobTitles } from "@/src/db/schema.js";
import { eq, and } from "drizzle-orm";

export const examJobTitlesRepo = {
  findAll: () => {
    return db.select().from(examJobTitles);
  },
  findExamJobTitles: (examId: string) => {
    return db
      .select({
        id: examJobTitles.id,
        examId: examJobTitles.examId,
        jobTitleId: examJobTitles.jobTitleId,
        weightPercentage: examJobTitles.weightPercentage,
        isPrimary: examJobTitles.isPrimary,
        questionCount: examJobTitles.questionCount,
        createdAt: examJobTitles.createdAt,
        jobTitleName: jobTitles.titleName,
      })
      .from(examJobTitles)
      .innerJoin(jobTitles, eq(examJobTitles.jobTitleId, jobTitles.id))
      .where(eq(examJobTitles.examId, examId));
  },

  findExamJobTitlesByJobTitleId: (jobTitleId: string) => {
    return db
      .select()
      .from(examJobTitles)
      .where(eq(examJobTitles.jobTitleId, jobTitleId));
  },

  findExamJobTitlesByExamId: (examId: string) => {
    return db
      .select()
      .from(examJobTitles)
      .where(eq(examJobTitles.examId, examId));
  },
  findById: (id: string) => {
    return db
      .select()
      .from(examJobTitles)
      .where(and(eq(examJobTitles.id, id)));
  },

  create: (data: {
    examId: string;
    jobTitleId: string;
    weightPercentage?: number;
    isPrimary?: boolean;
    questionCount?: number;
  }) => {
    return db
      .insert(examJobTitles)
      .values({
        examId: data.examId,
        jobTitleId: data.jobTitleId,
        weightPercentage: data.weightPercentage ?? 100,
        isPrimary: data.isPrimary ?? false,
        questionCount: data.questionCount,
      })
      .returning();
  },

  update: (
    examId: string,
    jobTitleId: string,
    data: {
      weightPercentage?: number;
      isPrimary?: boolean;
      questionCount?: number;
    },
  ) => {
    return db
      .update(examJobTitles)
      .set({
        weightPercentage: data.weightPercentage,
        isPrimary: data.isPrimary,
        questionCount: data.questionCount,
      })
      .where(
        and(
          eq(examJobTitles.examId, examId),
          eq(examJobTitles.jobTitleId, jobTitleId),
        ),
      )
      .returning();
  },

  delete: async (examId: string, jobTitleId: string) => {
    const result = await db
      .delete(examJobTitles)
      .where(
        and(
          eq(examJobTitles.examId, examId),
          eq(examJobTitles.jobTitleId, jobTitleId),
        ),
      )
      .returning();
    return result;
  },
};
