import { db } from "@/src/db/index.js";
import { auditLogs } from "@/src/db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { APIError } from "better-auth";
export const auditLogsRepo = {
    // ── GET  /api/audit-logs    # Filter by entityName, entityId, userId, date range
    getAuditLogs: async (filters) => {
        // Build WHERE conditions properly
        const conditions = [];
        if (filters.entityName) {
            conditions.push(eq(auditLogs.entityName, filters.entityName));
        }
        if (filters.entityId) {
            conditions.push(eq(auditLogs.entityId, filters.entityId));
        }
        if (filters.userId) {
            conditions.push(eq(auditLogs.userId, filters.userId));
        }
        if (filters.startDate) {
            conditions.push(sql `${auditLogs.createdAt} >= ${filters.startDate}`);
        }
        if (filters.endDate) {
            conditions.push(sql `${auditLogs.createdAt} <= ${filters.endDate}`);
        }
        const logs = await db
            .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            entityName: auditLogs.entityName,
            entityId: auditLogs.entityId,
            action: auditLogs.action,
            changes: auditLogs.changes,
            createdAt: auditLogs.createdAt,
        })
            .from(auditLogs)
            .where(and(...conditions))
            .orderBy(desc(auditLogs.createdAt))
            .limit(filters.limit ?? 100)
            .offset(filters.offset ?? 0);
        return logs;
    },
};
