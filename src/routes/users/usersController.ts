import { createFactory } from "hono/factory";
import { userRepo } from "./usersRepo.js";
import { sValidator } from "@hono/standard-validator";
import { usersSchemas } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { APIError } from "better-auth";
import z from "zod";
import { examRepo } from "../exams/examsRepo.js";
import { examCandidatesRepo } from "../exam-candidates/examCandidatesRepo.js";
import { candidateImportMiddleware } from "@/src/middleware/paseCandidate.js";

const factory = createFactory<{}>();

// ── GET    /users  → list users ───────────────────────────────────────────────
export const listUsers = factory.createHandlers(
  sValidator("query", usersSchemas.GetUsersQuerySchema),
  async (c) => {
    const userRole = c.get("user").role;
    console.log("userRole", userRole);
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
        data: {
          users: data.users
            .filter((user) =>
              userRole === "SUPER_ADMIN" ? user.role !== "CANDIDATE" : true,
            )
            .filter((user) => user.id !== c.get("user").id),
          total: data.users
            .filter((user) =>
              userRole === "SUPER_ADMIN" ? user.role !== "CANDIDATE" : true,
            )
            .filter((user) => user.id !== c.get("user").id).length,
        },
        message: "users ",
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Internal Server Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

export const createUser = factory.createHandlers(
  sValidator("json", usersSchemas.CreateUserSchema),
  async (c) => {
    const userRole = c.get("user").role;
    console.log("userRole", userRole);
    const userDetails = c.req.valid("json");
    try {
      const createdUser = await userRepo.createUser({ ...userDetails });

      return c.json({
        data: {
          id: createdUser.user.id,
        },
        message: "user created successfully",
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Internal Server Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── GET    /users/db → list users from DB with pagination + role filtering ─────
export const listUsersByDb = factory.createHandlers(
  sValidator("query", usersSchemas.GetUsersQuerySchema),
  async (c) => {
    const queryParams = c.req.valid("query");
    try {
      const userRole = c.get("user").role;
      if (userRole === "SUPER_ADMIN") {
        queryParams.role;
      }
      const data = await userRepo.getUsersByDb(queryParams);
      return c.json({
        data,
        message: "users fetched from database",
        success: true,
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Internal Server Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── GET    /users/me  → get current user ──────────────────────────────────────
export const getMe = factory.createHandlers(async (c) => {
  // No permission needed - user viewing their own profile
  const userId = c.get("user").id;
  try {
    const user = await userRepo.getMe(userId);
    return c.json({
      data: user,
      message: "user was successfully fetched",
      success: true,
    });
  } catch (err) {
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

// ── GET    /users/:id  → get user by id ──────────────────────────────────────
export const getUser = factory.createHandlers(
  sValidator("param", usersSchemas.GetUserParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const [user] = await userRepo.getUserById(id, c);
      if (!user) {
        return c.json(
          {
            data: null,
            message: "No user was found by that id",
            success: true,
          },
          {
            status: 404,
          },
        );
      }
      return c.json({
        data: user,
        message: "user was successfully fetched",
        success: true,
      });
    } catch (err) {
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
  },
);
// ── GET    /users/:id  → get user by id ──────────────────────────────────────
export const getUserByUsername = factory.createHandlers(
  sValidator(
    "param",
    z.object({
      username: z.string(),
    }),
  ),
  async (c) => {
    const { username } = c.req.valid("param");
    try {
      const [user] = await userRepo.getUserByUsername(username);
      if (!user) {
        return c.json({
          data: null,
          message: "No user was found by that username",
          success: true,
        });
      }
      return c.json({
        data: user,
        message: "user was successfully fetched",
        success: true,
      });
    } catch (err) {
      console.log(err);
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
  },
);
// ── GET    /users/exams  → get user exams ─────────────────────────────────────
export const getUserExams = factory.createHandlers(async (c) => {
  // No permission needed - user viewing their own exams
  try {
    const { id } = c.get("user");
    const userExams = await userRepo.userExams(id);

    return c.json({
      data: userExams,
      message: "user exams were successfully fetched",
      success: true,
    });
  } catch (err) {
    console.log(err);
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

// ── POST   /users/ban  → ban user ─────────────────────────────────────────────
export const banUser = factory.createHandlers(
  sValidator(
    "json",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await userRepo.banUser(body, c);
      return c.json({
        data: user,
        message: "user was successfully banned",
        success: true,
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── POST   /users/unban  → unban user ─────────────────────────────────────────
export const unbanUser = factory.createHandlers(
  sValidator("json", usersSchemas.unbanUserBodySchema),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await userRepo.unbanUser(body, c);
      return c.json({
        data: user,
        message: "user was successfully unbanned",
        success: true,
      });
    } catch (err) {
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── PUT    /users  → update user ──────────────────────────────────────────────
export const updateUser = factory.createHandlers(
  sValidator("json", usersSchemas.updateUserBodySchema),
  async (c) => {
    const body = c.req.valid("json");
    console.log(body);
    try {
      const user = await userRepo.updateUser(body, c);
      console.log("Updated", user);
      return c.json({
        data: user,
        message: "user was successfully updated",
        success: true,
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: err instanceof APIError ? err.message : "unknown error",
        cause: err instanceof APIError ? err.cause : "unknown cause",
      });
    }
  },
);

// ── DELETE /users/:id  → delete user ──────────────────────────────────────────
export const deleteUser = factory.createHandlers(
  sValidator("param", usersSchemas.deleteUserParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const user = await userRepo.deleteUser(id, c);
      return c.json({
        data: user,
        message: "user was successfully deleted",
        success: true,
      });
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── POST   /users/set-password  → set user password ───────────────────────────
export const setUserPassword = factory.createHandlers(
  sValidator("json", usersSchemas.setPasswordBodySchema),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await userRepo.setPassword(body, c);
      return c.json({
        data: user,
        message: "user password was successfully updated",
        success: true,
      });
    } catch (err) {
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── POST   /users/set-role  → set user role ───────────────────────────────────
export const setUserRole = factory.createHandlers(
  sValidator("json", usersSchemas.setRoleBodySchema),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await userRepo.setRole(body, c);
      return c.json({
        data: user,
        message: "user role was successfully updated",
        success: true,
      });
    } catch (err) {
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── POST   /users/revoke-session  → revoke session ─────────────────────────────
export const revokeUserSession = factory.createHandlers(
  sValidator("json", usersSchemas.revokeSessionBodySchema),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await userRepo.revokeSession(body, c);
      return c.json({
        data: user,
        message: "user session was successfully revoked",
        success: true,
      });
    } catch (err) {
      throw new HTTPException(500, {
        message: "Internal Sever Error",
        cause: err instanceof Error ? err.cause : "unknown",
      });
    }
  },
);

// ── POST   /users/revoke-user-sessions/:id  → revoke all sessions ─────────────
export const revokeUserSessions = factory.createHandlers(
  sValidator("param", usersSchemas.revokeUserSessionsParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const user = await userRepo.revokeUserSessions(id, c);
      return c.json({
        data: user,
        message: "all user sessions were successfully revoked",
        success: true,
      });
    } catch (err) {
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
  },
);

// ── POST   /users/generate-fake-candidate  → generate fake candidate ───────────
export const generateFakeCandidate = factory.createHandlers(async (c) => {
  try {
    const generateCandidate = await userRepo.generateFakeCandidate(c);
    return c.json({
      data: generateCandidate,
      message: "candidate was generate successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
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

// ── POST   /users/import-cadidates  → import and register temporary candidates  ───────────
export const registerCandidates = factory.createHandlers(
  candidateImportMiddleware(),
  sValidator(
    "query",
    z.object({
      assignToExam: z.coerce.boolean(),
      id: z.string().optional(),
    }),
  ),
  async (c) => {
    const { assignToExam, id: examId } = c.req.valid("query");
    const candidates = c.get("candidates");

    console.log(assignToExam);
    try {
      const registerdCandidates = [];
      const assignedCandidates = [];

      for (let candidate of candidates) {
        const registerCandidate = await userRepo.createCandidate(
          {
            email: candidate.email,
            name: candidate.fullName,
          },
          c,
        );

        if (registerCandidate.id) {
          registerdCandidates.push(registerCandidate.id);
        }
      }
      if (assignToExam) {
        let id = examId ?? "";
        if (!examId) {
          const exam = await examRepo.getExamByTitle(candidates[0].examTitle);
          if (exam.length < 1) {
            console.log("Exam  was not found.");
            return c.json({
              data: {
                registerdCandidates,
                examFound: false,
              },
              message: "Exam was not found",
            });
          }
          id = exam[0].id;
        }
        const examExists = await examRepo.getExam(id);
        if (!examExists) {
          console.log("Exam  was not found.");
          return c.json({
            data: {
              registerdCandidates,
              examFound: false,
            },
            message: "Exam was not found",
          });
        }
        const assigned = await examCandidatesRepo.assignCandidates(id, {
          candidates: registerdCandidates.map((c) => ({ candidateId: c })),
        });

        for (let assignedCandidate of assigned) {
          assignedCandidates.push(assignedCandidate.candidateId);
        }
      }
      return c.json({
        data: {
          registerdCandidates,
          assignedCandidates,
        },
        message: "Candidates were created and assigned",
        success: true,
      });
    } catch (err) {
      console.log(err);
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
  },
);
