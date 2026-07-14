export const USER_ROLE_VALUES = [
  "CANDIDATE",
  "BUILDER",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export const QUESTION_TYPE_VALUES = [
  "CHOICE",
  "MATCH",
  "ESSAY",
  "TRUE_FALSE",
] as const;

export const DIFFICULTY_LABEL_VALUES = ["EASY", "MEDIUM", "HARD"] as const;

export const EXAM_GENERATION_MODE_VALUES = [
  "QUESTION_COUNT",
  "POINT_TARGET",
  "HYBRID",
] as const;

export const EXAM_STATUS_VALUES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "ACTIVE",
  "CLOSED",
] as const;

export const ASSIGNMENT_STATUS_VALUES = [
  "ASSIGNED",
  "STARTED",
  "COMPLETED",
  "EXPIRED",
] as const;

export const ATTEMPT_STATUS_VALUES = [
  "IN_PROGRESS",
  "SUBMITTED",
  "GRADED",
  "EXPIRED",
] as const;

export const SEARCH_OPERATOR_VALUES = [
  "contains",
  "starts_with",
  "ends_with",
] as const;

export const FILTER_OPERATOR_VALUES = [
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
] as const;

export const SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

export const USER_FIELDS_VALUES = ["name", "email"] as const;

export const RESOURCE_TYPE_VALUES = [
  "QUESTION",
  "EXAM",
  "CANDIDATE",
] as const;

export const RESOURCE_PERMISSION_VALUES = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
  "PUBLISH",
  "ASSIGN",
] as const;

export const PERMISSION_SCOPE_VALUES = ["JOB_TITLE", "DEPARTMENT", "FACTORY"] as const;
