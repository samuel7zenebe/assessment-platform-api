import z from "zod";
/** Audit logs query filters */
export const AuditLogsQuerySchema = z.object({
    entityName: z.string().optional(),
    entityId: z.string().optional(), // Keeping as string for flexibility, though it's UUID in DB
    userId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.number().int().positive().optional().default(100),
    offset: z.number().int().nonnegative().optional().default(0),
});
