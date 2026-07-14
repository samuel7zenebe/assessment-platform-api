import { auth } from "@/src/lib/auth.js";
import type { Context } from "hono";
import { usersSchemas, type CreateUserType } from "./schema.js";
import type z from "zod";
import { db } from "@/src/db/index.js";
import { examCandidates, exams, user } from "@/src/db/schema.js";
import { count, eq, and, asc, desc, inArray } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import type { InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

export type UserRow = InferSelectModel<typeof user>;

type ListUsersDbQuery = z.infer<typeof usersSchemas.GetUsersQuerySchema>;

function buildSearchCondition(
  searchValue: string | undefined,
  searchField: string | undefined,
  searchOperator: string | undefined,
) {
  if (!searchValue || !searchField || !searchOperator) return undefined;

  const field = (user as any)[searchField];
  if (!field) return undefined;

  const term = `%${searchValue}%`;
  const rawTerm = searchValue;

  switch (searchOperator) {
    case "contains":
      return sql`${field}::text LIKE ${term}`;
    case "starts_with":
      return sql`${field}::text LIKE ${rawTerm}%`;
    case "ends_with":
      return sql`${field}::text LIKE %${rawTerm}`;
    default:
      return undefined;
  }
}

function buildFilterCondition(
  filterField: string | undefined,
  filterValue: string | undefined,
  filterOperator: string | undefined,
) {
  if (
    !filterField ||
    filterValue === undefined ||
    filterValue === "" ||
    !filterOperator
  ) {
    return undefined;
  }

  const field = (user as any)[filterField];
  if (!field) return undefined;

  switch (filterOperator) {
    case "eq":
      return sql`${field}::text = ${filterValue}`;
    case "ne":
      return sql`${field}::text <> ${filterValue}`;
    case "gt":
      return sql`${field}::text > ${filterValue}`;
    case "gte":
      return sql`${field}::text >= ${filterValue}`;
    case "lt":
      return sql`${field}::text < ${filterValue}`;
    case "lte":
      return sql`${field}::text <= ${filterValue}`;
    case "in": {
      const values = filterValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      if (values.length === 0) return undefined;
      return sql`${field}::text = ANY(${values})`;
    }
    case "not_in": {
      const values = filterValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      if (values.length === 0) return undefined;
      return sql`${field}::text <> ALL(${values})`;
    }
    case "starts_with":
      return sql`${field}::text LIKE ${filterValue}%`;
    case "ends_with":
      return sql`${field}::text LIKE %${filterValue}`;
    case "contains":
      return sql`${field}::text LIKE %${filterValue}%`;
    default:
      return undefined;
  }
}

function buildOrderBy(
  sortBy: string | undefined,
  sortDirection: "asc" | "desc" | undefined,
) {
  const direction = sortDirection === "desc" ? desc : asc;
  const column = sortBy ? (user as any)[sortBy] : user.createdAt;
  if (!column) return direction(user.createdAt);
  return direction(column);
}

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
  createUser: async (userDetails: CreateUserType) => {
    return auth.api.createUser({
      body: {
        email: userDetails.email,
        name: userDetails.name,
        password: userDetails.password,
        role: userDetails.role,
        data: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          image: userDetails.image,
          isActive: userDetails.isActive,
          departmentId: userDetails.departmentId,
          jobTitleId: userDetails.jobTitleId,
          displayUsername: userDetails.displayUsername,
        },
      },
    });
  },
  getUsersByDb: async ({
    limit = 100,
    offset = 0,
    searchValue,
    searchField,
    searchOperator,
    filterField,
    filterValue,
    filterOperator,
    sortBy,
    sortDirection,
    role,
  }: ListUsersDbQuery): Promise<{ users: UserRow[]; total: number }> => {
    const conditions: any[] = [];

    const searchCondition = buildSearchCondition(
      searchValue,
      searchField,
      (searchOperator = "contains"),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }

    const filterCondition = buildFilterCondition(
      filterField,
      filterValue,
      filterOperator,
    );
    if (filterCondition) {
      conditions.push(filterCondition);
    }

    if (Array.isArray(role) && role.length > 0) {
      conditions.push(inArray(user.role, role as any));
    } else if (role !== undefined && !Array.isArray(role)) {
      conditions.push(eq(user.role, role as any));
    }

    const baseQuery =
      conditions.length > 0
        ? db
            .select()
            .from(user)
            .where(and(...conditions))
        : db.select().from(user);

    const paginatedQuery = baseQuery
      .limit(limit)
      .offset(offset)
      .orderBy(buildOrderBy(sortBy, sortDirection));

    const [users, [{ total: totalCount }]] = await Promise.all([
      paginatedQuery,
      db
        .select({ total: count() })
        .from(user)
        .where(and(...conditions)),
    ]);

    return {
      users,
      total: totalCount ?? 0,
    };
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
  getUserByUsername: async (username: string) => {
    return db.select().from(user).where(eq(user.username, username));
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
    const { id, ...updateData } = data;
    return auth.api.adminUpdateUser({
      headers: c.req.raw.headers,
      body: {
        userId: id,
        data: updateData,
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
    console.log("Password", password);
    const image = faker.image.avatar();
    const user = await auth.api.createUser({
      headers: c.req.raw.headers,
      body: {
        email,
        name,
        password,
        data: {
          image,
          temporaryCandidate: true,
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
  createCandidate: async (
    userDetails: {
      name: string;
      email: string;
    },
    c: Context,
  ): Promise<{
    id: string;
    password: string;
    username: string;
  }> => {
    const firstName = userDetails.name.split(" ")[0];
    const lastName = userDetails.name.split(" ")[1];
    const username = await usernameGenerator();
    const password = faker.internet.password();

    const response = await auth.api.createUser({
      headers: c.req.raw.headers,
      body: {
        email: userDetails.email,
        name: userDetails.name,
        role: "CANDIDATE",
        password,
        data: {
          temporaryCandidate: true,
          username,
          isActive: true,
          firstName,
          lastName,
          displayUsername: username.toUpperCase(),
        },
      },
    });

    return {
      id: response.user.id,
      password,
      username,
    };
  },
};

export async function usernameGenerator(): Promise<string> {
  const year = new Date().getFullYear();
  const randomString = Math.floor(Math.random() * 10000);

  const username = "m_can_" + year.toString() + "_" + randomString;
  const usernameExists = await userRepo.getUserByUsername(username);

  if (usernameExists.length > 0) {
    usernameGenerator();
  }
  return username;
}
