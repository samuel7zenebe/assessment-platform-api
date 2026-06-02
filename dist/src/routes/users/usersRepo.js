import { auth } from "@/src/lib/auth.js";
import { usersSchemas } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { bodyLimit } from "hono/body-limit";
import { db } from "@/src/db/index.js";
import { user } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";
export const userRepo = {
    getAllUsers: async ({ c, queryParams, }) => {
        const { limit, offset, searchValue, searchField, searchOperator, filterField, filterValue, filterOperator, sortBy, sortDirection, } = queryParams;
        return auth.api.listUsers({
            headers: c.req.raw.headers,
            query: {
                limit,
                offset,
                searchValue,
                filterField,
                filterValue,
                filterOperator,
                sortBy,
                sortDirection,
                searchField,
                searchOperator,
            },
        });
    },
    getUserById: async (id, c) => {
        return auth.api.getUser({
            headers: c.req.raw.headers,
            query: {
                id,
            },
        });
    },
    getMe: async (id) => db.select().from(user).where(eq(user.id, id)),
    banUser: async (body, c) => {
        return auth.api.banUser({
            headers: c.req.raw.headers,
            body: {
                userId: body.id,
                banReason: body.reason,
                banExpiresIn: body.expiresIn ? body.expiresIn * 60 * 60 : undefined,
            },
        });
    },
    unbanUser: async (body, c) => {
        return auth.api.unbanUser({
            headers: c.req.raw.headers,
            body: {
                userId: body.id,
            },
        });
    },
    updateUser: async (data, c) => {
        return auth.api.adminUpdateUser({
            headers: c.req.raw.headers,
            body: {
                userId: data.id,
                data: {
                    ...data,
                },
            },
        });
    },
    deleteUser: async (id, c) => {
        return auth.api.removeUser({
            headers: c.req.raw.headers,
            body: {
                userId: id,
            },
        });
    },
    setRole: async (body, c) => {
        return auth.api.setRole({
            headers: c.req.raw.headers,
            body: {
                userId: body.id,
                role: body.role,
            },
        });
    },
    setPassword: async (body, c) => {
        return auth.api.setUserPassword({
            headers: c.req.raw.headers,
            body: {
                userId: body.id,
                newPassword: body.newPassword,
            },
        });
    },
    revokeSession: async (body, c) => {
        return auth.api.revokeSession({
            headers: c.req.raw.headers,
            body: {
                token: body.sessionToken,
            },
        });
    },
    revokeUserSessions: async (id, c) => {
        return auth.api.revokeUserSessions({
            headers: c.req.raw.headers,
            body: {
                userId: id,
            },
        });
    },
};
