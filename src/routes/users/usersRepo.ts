import { auth } from "@/src/lib/auth.js";
import type { Context } from "hono";
import { usersSchemas } from "./schema.js";
import type z from "zod";
import { db } from "@/src/db/index.js";
import { examCandidates, exams, user } from "@/src/db/schema.js";
import { count, eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

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
    // return auth.api.getUser({
    //   headers: c.req.raw.headers,
    //   query: {
    //     id,
    //   },
    // });
    return db.select().from(user).where(eq(user.id, id));
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

  userExams: async (id: string) => {
    return db
      .select({
        id: examCandidates.candidateId,
        examId: examCandidates.examId,
      })
      .from(examCandidates)
      .where(eq(examCandidates.candidateId, id));
  },

  generateFakeCandidate: async (
    c: Context,
  ): Promise<{
    id: string;
    password: string;
    username: string;
  }> => {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const email = faker.internet.email({ firstName, lastName });
    const name = faker.person.fullName({
      firstName,
      lastName,
    });
    const username =
      usernameGenerator() +
      faker.internet.username({
        firstName,
        lastName,
      });
    const password = faker.internet.password();
    const image = faker.image.avatar();
    const user = await auth.api.createUser({
      headers: c.req.raw.headers,
      body: {
        email,
        name,
        password,
        data: {
          image,
          username,
        },
      },
    });

    return {
      id: user.user.id,
      password,
      username,
    };
  },
};

function usernameGenerator() {
  const year = new Date().getFullYear();
  const randomString = Math.floor(Math.random() * 10000);
  return "m_can_" + year.toString() + "_" + randomString;
}
