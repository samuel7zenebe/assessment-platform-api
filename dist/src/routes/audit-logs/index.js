import { Hono } from "hono";
import { getAuditLogs } from "./auditLogsController.js";
export const auditLogsRouter = new Hono()
    .get("/", ...getAuditLogs);
