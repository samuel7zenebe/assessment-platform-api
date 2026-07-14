import { createFactory } from "hono/factory";
import { auditLogsRepo } from "./auditLogs.Repo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { APIError } from "better-auth";
import { AuditLogsQuerySchema } from "./schema.js";
import { isAdmin } from "@/src/lib/roles.js";

const factory = createFactory();

// ── GET  /api/audit-logs    # Filter by entityName, entityId, userId, date range
export const getAuditLogs = factory.createHandlers(
  sValidator("query", AuditLogsQuerySchema),
  async (c) => {
    const {
      entityName,
      entityId,
      userId,
      startDate,
      endDate,
      limit,
      offset,
    } = c.req.valid("query");
    const authUserId = c.get("user").id;
    const role = c.get("user").role;

    // Authorization: Only ADMIN can access audit logs
    if (!isAdmin(role)) {
      throw new APIError("FORBIDDEN", { message: "Access denied", status: 403 });
    }

    try {
      const logs = await auditLogsRepo.getAuditLogs({
        entityName,
        entityId,
        userId,
        startDate,
        endDate,
        limit,
        offset,
      });
      return c.json({ data: logs, success: true });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", { 
        message: "Failed to fetch audit logs", 
        cause: err 
      });
    }
  },
);