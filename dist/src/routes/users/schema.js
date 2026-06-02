import { userFieldsSchema, searchOperatorSchema, sortDirectionSchema, userRoleSchema, filterOperatorSchema, } from "@/src/lib/schema.js";
import z from "zod";
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
    avatarUrl: z.string().url().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
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
