import {
  userFieldsSchema,
  searchOperatorSchema,
  sortDirectionSchema,
  userRoleSchema,
  filterOperatorSchema,
} from "@/src/lib/schema.js";
import z from "zod";

export const UserSchema = z.object({
  id: z.string().min(1), // text primary key

  firstName: z.string().max(255).nullable().optional(),
  lastName: z.string().max(255).nullable().optional(),

  name: z.string().min(1),

  email: z.string().email().min(1),

  emailVerified: z.boolean().default(false),

  image: z.string().url().nullable().optional(),

  passwordHash: z.string().nullable().optional(),

  role: userRoleSchema.default("CANDIDATE"),

  isActive: z.boolean().default(true),

  banned: z.boolean().nullable().optional(),
  banReason: z.string().nullable().optional(),
  banExpires: z.date().nullable().optional(), // or z.string().datetime() if using strings

  // Username plugin fields
  username: z.string().max(255).nullable().optional(),
  displayUsername: z.string().nullable().optional(),

  temporaryCandidate: z.boolean().default(false),

  departmentId: z.string().optional(),

  jobTitleId: z.string().optional(),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable().optional(),
});
//
// export const GenerateCandidateSchema

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).extend({
  password: z.string().min(8).max(255),
});

const GetUsersQuerySchema = z.object({
  limit: z.coerce.number().optional().default(100),
  offset: z.coerce.number().optional().default(0),
  searchValue: z.string().optional(),
  searchField: userFieldsSchema.optional(),
  searchOperator: searchOperatorSchema.optional(),
  filterField: userFieldsSchema.optional(),
  filterValue: z.string().optional(),
  filterOperator: filterOperatorSchema.optional(),
  sortBy: userFieldsSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  role: z.array(userRoleSchema).optional(),
});

const GetUserParamsSchema = z.object({
  id: z.string(),
});

const banUserBodySchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
  // Number of hours to ban user
  expiresIn: z.coerce.number().optional(),
});

const unbanUserBodySchema = z.object({
  id: z.string(),
});

const updateUserBodySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().max(255).nullable().optional(),
  displayUsername: z.string().nullable().optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  temporaryCandidate: z.boolean().optional(),
  departmentId: z.string().optional(),
  jobTitleId: z.string().optional(),
});

const deleteUserParamsSchema = z.object({
  id: z.string(),
});

const setRoleBodySchema = z.object({
  id: z.string(),
  role: userRoleSchema,
});

const revokeUserSessionsParamSchema = z.object({
  id: z.string(),
});

const setPasswordBodySchema = z.object({
  id: z.string(),
  newPassword: z.string(),
});

const revokeSessionBodySchema = z.object({
  sessionToken: z.string(),
});

export const usersSchemas = {
  CreateUserSchema,
  GetUsersQuerySchema,
  GetUserParamsSchema,
  banUserBodySchema,
  unbanUserBodySchema,
  updateUserBodySchema,
  deleteUserParamsSchema,
  setRoleBodySchema,
  setPasswordBodySchema,
  revokeSessionBodySchema,
  revokeUserSessionsParamSchema,
};

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type UpdateUserType = z.infer<typeof updateUserBodySchema>;
