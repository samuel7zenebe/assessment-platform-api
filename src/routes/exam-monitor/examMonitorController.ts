import { type Context } from "hono";
import { createFactory } from "hono/factory";
import { examMonitorRepo } from "./examMonitorRepo.js";
import { ExamMonitorQuerySchema } from "./schema.js";
import { sValidator } from "@hono/standard-validator";
import { APIError } from "better-auth";
import { isAdmin } from "@/src/lib/roles.js";
import { IdParamSchema } from "@/src/lib/schemas/common.js";

const factory = createFactory();

/** Exam monitoring is admin/reviewer-only. */
const assertAdmin = (c: Context): void => {
  const user = c.get("user");
  if (!user)
    throw new APIError("UNAUTHORIZED", {
      message: "Authentication required",
      status: 401,
    });
  if (!isAdmin(user.role))
    throw new APIError("FORBIDDEN", {
      message: "Admin access required",
      status: 403,
    });
};

// GET /api/exam-monitor/:id  → live view of everything happening in an exam
export const getExamMonitor = factory.createHandlers(
  sValidator("param", IdParamSchema),
  sValidator("query", ExamMonitorQuerySchema),
  async (c) => {
    assertAdmin(c);
    const { id: examId } = c.req.valid("param");
    const { status, idleMinutes, includeQuestions } = c.req.valid("query");
    try {
      const data = await examMonitorRepo.getExamMonitor(examId, {
        status,
        idleMinutes,
        includeQuestions,
      });
      return c.json({ data, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch exam monitor",
        cause: err,
      });
    }
  },
);
