import { examStatusEnum } from "@/src/db/schema.js";
import z from "zod";
export const ExamSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    estimatedTimeMinutes: z.number(),
    scheduledTime: z.date().nullable(),
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
    weight: z.coerce.number().min(1).max(100).default(100),
});
export const CreateExamSchema = z.object({
    title: z.string(),
    description: z.string(),
    estimatedTimeMinutes: z.number(),
    scheduledTime: z.string(),
    passPercentage: z.number(),
    totalQuestions: z.number(),
    difficultyLevel: z.number(),
    status: z.enum(examStatusEnum.enumValues).default("DRAFT"),
    jobTitles: z.array(JobTitleCreateExamSchema),
});
export const UpdateExamSchema = z.object({
    id: z.uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    estimatedTimeMinutes: z.number().optional(),
    scheduledTime: z.string().optional(),
    passPercentage: z.number().optional(),
    totalQuestions: z.number().optional(),
    difficultyLevel: z.number().optional(),
    status: z.enum(examStatusEnum.enumValues).optional(),
    jobTitleIds: z.array(z.uuid()).optional(),
});
export const DeleteExamSchema = z.object({
    id: z.uuid(),
});
export const GetExamSchema = z.object({
    id: z.uuid(),
});
export const PublishExamSchema = z.object({});
export const ArchiveExamSchema = z.object({});
export const GenerateExamQuestionsSchema = z.object({
    totalQuestions: z.number().int().positive().optional(),
});
export const ExamStatisticsSchema = z.object({});
