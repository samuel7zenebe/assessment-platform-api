import z from "zod";
import { attemptStatusSchema } from "@/src/lib/schema.js";
/** Exam analytics summary query */
export const ExamAnalyticsSummarySchema = z.object({});
/** Exam analytics questions query */
export const ExamAnalyticsQuestionsSchema = z.object({});
/** Candidate analytics query */
export const CandidateAnalyticsSchema = z.object({});
/** Platform overview analytics query */
export const PlatformOverviewSchema = z.object({});
