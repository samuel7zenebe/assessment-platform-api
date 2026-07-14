import z from "zod";
import {
  USER_ROLE_VALUES,
  QUESTION_TYPE_VALUES,
  DIFFICULTY_LABEL_VALUES,
  EXAM_GENERATION_MODE_VALUES,
  EXAM_STATUS_VALUES,
  ASSIGNMENT_STATUS_VALUES,
  ATTEMPT_STATUS_VALUES,
  SEARCH_OPERATOR_VALUES,
  FILTER_OPERATOR_VALUES,
  SORT_DIRECTION_VALUES,
  USER_FIELDS_VALUES,
  RESOURCE_TYPE_VALUES,
  RESOURCE_PERMISSION_VALUES,
  PERMISSION_SCOPE_VALUES,
} from "@/src/lib/schemas/enums.js";

export const userRoleSchema = z.enum(USER_ROLE_VALUES);
export const questionTypeSchema = z.enum(QUESTION_TYPE_VALUES);
export const difficultyLabelSchema = z.enum(DIFFICULTY_LABEL_VALUES);
export const ExamGenerationMode = z.enum(EXAM_GENERATION_MODE_VALUES);
export const examStatusSchema = z.enum(EXAM_STATUS_VALUES);
export const assignmentStatusSchema = z.enum(ASSIGNMENT_STATUS_VALUES);
export const attemptStatusSchema = z.enum(ATTEMPT_STATUS_VALUES);
export const searchOperatorSchema = z.enum(SEARCH_OPERATOR_VALUES);
export const filterOperatorSchema = z.enum(FILTER_OPERATOR_VALUES);
export const strictBooleanSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z.boolean());
export const sortDirectionSchema = z.enum(SORT_DIRECTION_VALUES);
export const userFieldsSchema = z.enum(USER_FIELDS_VALUES);
export const ResourceTypeSchema = z.enum(RESOURCE_TYPE_VALUES);
export const ResourcePermissionSchema = z.enum(RESOURCE_PERMISSION_VALUES);
export const permissionScopeEnum = z.enum(PERMISSION_SCOPE_VALUES);
