import { createFactory } from "hono/factory";
import { userRepo } from "./usersRepo.js";
import { sValidator } from "@hono/standard-validator";
import { usersSchemas } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { APIError } from "better-auth";
const factory = createFactory();
export const listUsers = factory.createHandlers(sValidator("query", usersSchemas.GetUsersQuerySchema), async (c) => {
    const queryParams = c.req.valid("query");
    try {
        const data = await userRepo.getAllUsers({
            c,
            queryParams: {
                limit: queryParams.limit,
                offset: queryParams.offset,
                searchValue: queryParams.searchValue,
                searchField: queryParams.searchField,
                searchOperator: queryParams.searchOperator,
                filterField: queryParams.filterField,
                filterValue: queryParams.filterValue,
                filterOperator: queryParams.filterOperator,
                sortBy: queryParams.sortBy,
                sortDirection: queryParams.sortDirection,
            },
        });
        return c.json({
            data,
            message: "users ",
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Server Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const getUser = factory.createHandlers(sValidator("param", usersSchemas.GetUserParamsSchema), async (c) => {
    const { id } = c.req.valid("param");
    try {
        const user = await userRepo.getUserById(id, c);
        return c.json({
            data: user,
            message: "user was successfully fetched",
            success: true,
        });
    }
    catch (err) {
        if (err instanceof APIError) {
            throw new HTTPException(403, {
                message: err.message,
                cause: err.body,
            });
        }
        console.log("Error Occured : ");
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const banUser = factory.createHandlers(sValidator("json", usersSchemas.banUserBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.banUser(body, c);
        return c.json({
            data: user,
            message: "user was successfully banned",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const unbanUser = factory.createHandlers(sValidator("json", usersSchemas.unbanUserBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.unbanUser(body, c);
        return c.json({
            data: user,
            message: "user was successfully unbanned",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const updateUser = factory.createHandlers(sValidator("json", usersSchemas.updateUserBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.updateUser(body, c);
        return c.json({
            data: user,
            message: "user was successfully updated",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: err instanceof APIError ? err.message : "unknown error",
            cause: err instanceof APIError ? err.cause : "unknown cause",
        });
    }
});
export const deleteUser = factory.createHandlers(sValidator("param", usersSchemas.deleteUserParamsSchema), async (c) => {
    const { id } = c.req.valid("param");
    try {
        const user = await userRepo.deleteUser(id, c);
        return c.json({
            data: user,
            message: "user was successfully deleted",
            success: true,
        });
    }
    catch (err) {
        console.log(err);
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const setUserPassword = factory.createHandlers(sValidator("json", usersSchemas.setPasswordBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.setPassword(body, c);
        return c.json({
            data: user,
            message: "user password was successfully updated",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const setUserRole = factory.createHandlers(sValidator("json", usersSchemas.setRoleBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.setRole(body, c);
        return c.json({
            data: user,
            message: "user role was successfully updated",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const revokeUserSession = factory.createHandlers(sValidator("json", usersSchemas.revokeSessionBodySchema), async (c) => {
    const body = c.req.valid("json");
    try {
        const user = await userRepo.revokeSession(body, c);
        return c.json({
            data: user,
            message: "user session was successfully revoked",
            success: true,
        });
    }
    catch (err) {
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const revokeUserSessions = factory.createHandlers(sValidator("param", usersSchemas.revokeUserSessionsParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    try {
        const user = await userRepo.revokeUserSessions(id, c);
        return c.json({
            data: user,
            message: "all user sessions were successfully revoked",
            success: true,
        });
    }
    catch (err) {
        if (err instanceof APIError) {
            throw new HTTPException(403, {
                message: err.message,
                cause: err.body,
            });
        }
        console.log("Error Occured : ");
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
export const getMe = factory.createHandlers(async (c) => {
    const userId = c.get("user").id;
    try {
        const user = await userRepo.getMe(userId);
        return c.json({
            data: user,
            message: "user was successfully fetched",
            success: true,
        });
    }
    catch (err) {
        if (err instanceof APIError) {
            throw new HTTPException(403, {
                message: err.message,
                cause: err.body,
            });
        }
        console.log("Error Occured : ");
        throw new HTTPException(500, {
            message: "Internal Sever Error",
            cause: err instanceof Error ? err.cause : "unknown",
        });
    }
});
