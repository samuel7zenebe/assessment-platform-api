import { auth } from "@/src/lib/auth.js";
import type { Context } from "hono";
import { usersSchemas } from "./schema.js";
import type z from "zod";
import { HTTPException } from "hono/http-exception";
import { bodyLimit } from "hono/body-limit";
import { db } from "@/src/db/index.js";
import { user } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";

export const userRepo = {
  getAllUsers: async ({
    c,
    queryParams,
  }: {
    c: Context;
    queryParams: z.infer<typeof usersSchemas.GetUsersQuerySchema>;
  }) => {
    const {
      limit,
      offset,
      searchValue,
      searchField,
      searchOperator,
      filterField,
      filterValue,
      filterOperator,
      sortBy,
      sortDirection,
    } = queryParams;
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

  getUserById: async (id: string, c: Context) => {
    return auth.api.getUser({
      headers: c.req.raw.headers,
      query: {
        id,
      },
    });
  },

  getMe: async (id: string) => db.select().from(user).where(eq(user.id, id)),

  banUser: async (
    body: z.infer<typeof usersSchemas.banUserBodySchema>,
    c: Context,
  ) => {
    return auth.api.banUser({
      headers: c.req.raw.headers,
      body: {
        userId: body.id,
        banReason: body.reason,
        banExpiresIn: body.expiresIn ? body.expiresIn * 60 * 60 : undefined,
      },
    });
  },
  unbanUser: async (
    body: z.infer<typeof usersSchemas.unbanUserBodySchema>,
    c: Context,
  ) => {
    return auth.api.unbanUser({
      headers: c.req.raw.headers,
      body: {
        userId: body.id,
      },
    });
  },

  updateUser: async (
    data: z.infer<typeof usersSchemas.updateUserBodySchema>,
    c: Context,
  ) => {
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

  deleteUser: async (id: string, c: Context) => {
    return auth.api.removeUser({
      headers: c.req.raw.headers,
      body: {
        userId: id,
      },
    });
  },

  setRole: async (
    body: z.infer<typeof usersSchemas.setRoleBodySchema>,
    c: Context,
  ) => {
    return auth.api.setRole({
      headers: c.req.raw.headers,
      body: {
        userId: body.id,
        role: body.role,
      },
    });
  },

  setPassword: async (
    body: z.infer<typeof usersSchemas.setPasswordBodySchema>,
    c: Context,
  ) => {
    return auth.api.setUserPassword({
      headers: c.req.raw.headers,
      body: {
        userId: body.id,
        newPassword: body.newPassword,
      },
    });
  },

  revokeSession: async (
    body: z.infer<typeof usersSchemas.revokeSessionBodySchema>,
    c: Context,
  ) => {
    return auth.api.revokeSession({
      headers: c.req.raw.headers,
      body: {
        token: body.sessionToken,
      },
    });
  },

  revokeUserSessions: async (id: string, c: Context) => {
    return auth.api.revokeUserSessions({
      headers: c.req.raw.headers,
      body: {
        userId: id,
      },
    });
  },
};
