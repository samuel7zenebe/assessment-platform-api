import { db } from "@/src/db/index.js";
import {
  permissionPolicies,
  permissionResourceEnum,
  permissionActionEnum,
  permissionScopeEnum,
  user,
  jobTitles,
} from "@/src/db/schema.js";
import { and, eq, isNull, gt, or } from "drizzle-orm";
import type {
  CreatePermissionPolicy,
  UpdatePermissionPolicy,
  PermissionPolicyFilter,
  PermissionScopeType,
} from "./schema.js";
import { userRepo } from "../users/usersRepo.js";

export const permissionPoliciesRepo = {
  // ── Create a permission policy ───────────────────────────────────────────
  create: async (data: CreatePermissionPolicy) => {
    const [result] = await db
      .insert(permissionPolicies)
      .values({
        ...data,
        scope: data.scope as any,
      })
      .returning();
    return result;
  },

  // ── Bulk create permission policies ──────────────────────────────────────────
  bulkCreate: async (data: CreatePermissionPolicy[]) => {
    const results = await db
      .insert(permissionPolicies)
      .values(
        data.map((d) => ({
          ...d,
          scope: d.scope as any,
        })),
      )
      .returning();
    return results;
  },

  // ── Update a permission policy ───────────────────────────────────────────────
  update: async (id: string, data: UpdatePermissionPolicy) => {
    const [result] = await db
      .update(permissionPolicies)
      .set(data)
      .where(eq(permissionPolicies.id, id))
      .returning();
    return result;
  },

  // ── Delete a permission policy ───────────────────────────────────────────────
  delete: async (id: string) => {
    const [result] = await db
      .delete(permissionPolicies)
      .where(eq(permissionPolicies.id, id))
      .returning();
    return result;
  },

  // ── Find by ID ───────────────────────────────────────────────────────────────
  findById: async (id: string) => {
    const [result] = await db
      .select()
      .from(permissionPolicies)
      .where(eq(permissionPolicies.id, id));
    return result;
  },

  // ── Find many with filters ─────────────────────────────────────────────────────
  findMany: async (filters: PermissionPolicyFilter) => {
    let conditions: any[] = [];

    if (filters.userId) {
      conditions.push(eq(permissionPolicies.userId, filters.userId));
    }
    if (filters.resource) {
      conditions.push(eq(permissionPolicies.resource, filters.resource as any));
    }
    if (filters.scope) {
      conditions.push(eq(permissionPolicies.scope, filters.scope as any));
    }
    if (filters.scopeId) {
      conditions.push(eq(permissionPolicies.scopeId, filters.scopeId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(permissionPolicies)
      .where(whereClause);
    return results;
  },

  // ── Find by user ───────────────────────────────────────────────────────────────
  findByUser: async (userId: string) => {
    const results = await db
      .select()
      .from(permissionPolicies)
      .where(eq(permissionPolicies.userId, userId));
    return results;
  },

  // ── Find by scope ───────────────────────────────────────────────────────────────
  findByScope: async (scope: PermissionScopeType, scopeId: string) => {
    const results = await db
      .select()
      .from(permissionPolicies)
      .where(
        and(
          eq(permissionPolicies.scope, scope as any),
          eq(permissionPolicies.scopeId, scopeId),
        ),
      );
    return results;
  },

  // ── Get accessible scope ids for a user based on VIEW permissions ──────────
  getAccessibleScopes: async (
    userId: string,
  ): Promise<{ jobTitleIds: string[]; departmentIds: string[] }> => {
    const now = new Date();

    const [userDetails] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    const rows = await db
      .select()
      .from(permissionPolicies)
      .where(
        and(
          eq(permissionPolicies.userId, userId),
          or(
            isNull(permissionPolicies.expiresAt),
            gt(permissionPolicies.expiresAt, now),
          ),
        ),
      );

    const jobTitleIds = new Set<string>();
    const departmentIds = new Set<string>();

    for (const row of rows) {
      const actions = row.actions as string[];
      const hasView = actions.some((a) => a.startsWith("VIEW"));
      if (!hasView) continue;

      if (row.scope === "JOB_TITLE") jobTitleIds.add(row.scopeId);
      if (row.scope === "DEPARTMENT") departmentIds.add(row.scopeId);
    }

    const jbs = await db
      .select()
      .from(jobTitles)
      .where(eq(jobTitles.departmentId, userDetails.departmentId ?? ""));

    if (jbs.length > 0) {
      for (let jb of jbs) {
        jobTitleIds.add(jb.id);
      }
    }
    if (userDetails.departmentId) {
      departmentIds.add(userDetails.departmentId);
    }

    if (userDetails.role === "ADMIN") {
    }
    return {
      jobTitleIds: [...jobTitleIds],
      departmentIds: [...departmentIds],
    };
  },

  // ── Check if permission policy exists ───────────────────────────────────────
  exists: async ({
    userId,
    resource,
    action,
    scope,
    scopeId,
  }: {
    userId: string;
    resource: string;
    action: string;
    scope?: string;
    scopeId?: string;
  }) => {
    const now = new Date();

    let conditions: any[] = [
      eq(permissionPolicies.userId, userId),
      eq(permissionPolicies.resource, resource as any),
    ];

    if (scope && scopeId) {
      conditions.push(eq(permissionPolicies.scope, scope as any));
      conditions.push(eq(permissionPolicies.scopeId, scopeId));
    }

    // Check expiresAt - either null OR greater than now
    conditions.push(
      or(
        isNull(permissionPolicies.expiresAt),
        gt(permissionPolicies.expiresAt, now),
      ),
    );

    const [result] = await db
      .select()
      .from(permissionPolicies)
      .where(and(...conditions));

    if (!result) return false;

    return (result.actions as string[]).includes(action);
  },
};
