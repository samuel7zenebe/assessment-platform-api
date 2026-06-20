import { examStatusEnum } from "@/src/db/schema.js";
import z from "zod";
import { CreateExamJobTitleSchema } from "../exam-job-titles/schema.js";

export const ExamSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  category: z.string().nullable(),
  examMetaData: z.object().nullable(),
  description: z.string().nullable(),
  estimatedTimeMinutes: z.number(),
  scheduledTime: z.string().nullable(),
  lateEntryGraceMinutes: z.number().default(15),
  passPercentage: z.number(),
  totalQuestions: z.number(),
  difficultyLevel: z.number(),
  status: z.enum(examStatusEnum.enumValues),
  createdBy: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export const JobTitleCreateExamSchema = z.object({
  id: z.uuid(),
  weight: z.coerce.number<number>().min(1).max(100).default(100),
});

export const CreateExamSchema = ExamSchema.omit({
  createdAt: true,
  deletedAt: true,
  id: true,
  updatedAt: true,
})
  .extend({
    jobTitles: z.array(
      JobTitleCreateExamSchema.extend({
        isPrimary: z.boolean().optional(),
      }),
    ),
  })
  .omit({
    createdBy: true,
  });

export const UpdateExamSchema = CreateExamSchema.omit({
  jobTitles: true,
}).extend({
  id: z.uuid(),
});

export const DeleteExamSchema = ExamSchema.pick({
  id: true,
});

export const GetExamSchema = ExamSchema.pick({
  id: true,
});

export const PublishExamSchema = z.object({});
export const ArchiveExamSchema = z.object({});

export const GenerateExamQuestionsSchema = ExamSchema.pick({
  id: true,
  totalQuestions: true,
  difficultyLevel: true,
}).extend({
  jobTitles: z.array(
    z.object({
      id: z.string(),
      weight: z.number().min(0).max(100),
    }),
  ),
});

export const ExamStatisticsSchema = z.object({});
