import z from "zod";

export const userRoleSchema = z.enum([
  "CANDIDATE",
  "BUILDER",
  "ADMIN",
  "SUPER_ADMIN",
]);
export const questionTypeSchema = z.enum([
  "CHOICE",
  "MATCH",
  "ESSAY",
  "TRUE_FALSE",
]);
export const difficultyLabelSchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const ExamGenerationMode = z.enum([
  "QUESTION_COUNT",
  "POINT_TARGET",
  "HYBRID",
]);

export const examStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "ACTIVE",
  "CLOSED",
]);

export const assignmentStatusSchema = z.enum([
  "ASSIGNED",
  "STARTED",
  "COMPLETED",
  "EXPIRED",
]);

export const attemptStatusSchema = z.enum([
  "IN_PROGRESS",
  "SUBMITTED",
  "GRADED",
  "EXPIRED",
]);

export const resourceSchema = z.enum([
  "exam",
  "question",
  "user",
  "result",
  "candidate",
]);

export const actionSchema = z.enum([
  "create",
  "update",
  "delete",
  "read",
  "assign_exam",
  "unassign_exam",
  "list",
]);

export const searchOperatorSchema = z.enum([
  "contains",
  "starts_with",
  "ends_with",
]);

export const filterOperatorSchema = z.enum([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "starts_with",
  "ends_with",
  "contains",
]);
export const strictBooleanSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z.boolean());

export const sortDirectionSchema = z.enum(["asc", "desc"]);

export const userFieldsSchema = z.enum(["name", "email"]);
