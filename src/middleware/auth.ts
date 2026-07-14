import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type z from "zod";
import {
  ResourcePermissionSchema,
  ResourceTypeSchema,
  permissionScopeEnum,
} from "../lib/schema.js";
import { db } from "../db/index.js";
import { permissionPolicies, jobTitles } from "../db/schema.js";
import { and, eq, isNull, gt, or } from "drizzle-orm";

export type Permission = {
  resource: z.infer<typeof ResourceTypeSchema>;
  permission: z.infer<typeof ResourcePermissionSchema>;
  scope?: z.infer<typeof permissionScopeEnum>;
  scopeId?: string;
};

type PermissionCheckParams = {
  userId: string;
  resource: z.infer<typeof ResourceTypeSchema>;
  action: z.infer<typeof ResourcePermissionSchema>;
  scope?: z.infer<typeof permissionScopeEnum>;
  scopeId?: string;
};

export const getPermissionErrorMessage = (permission: Permission) => {
  const actionVerbs: Record<
    z.infer<typeof ResourcePermissionSchema>,
    string
  > = {
    CREATE: "create",
    VIEW: "view",
    UPDATE: "edit",
    DELETE: "remove",
    ASSIGN: "assign",
    PUBLISH: "publish",
  };

  const actionText = actionVerbs[permission.permission] || permission.resource;
  const resourceText = permission.resource.toLowerCase();

  return `Access Denied: You lack the required permissions to ${actionText} ${resourceText}. Please contact your system administrator if you believe you should have access.`;
};

export const checkPermission = async ({
  userId,
  resource,
  action,
  scope,
  scopeId,
}: PermissionCheckParams): Promise<boolean> => {
  const now = new Date();

  // Look up a policy that grants `action` on `resource` for the given user,
  // optionally restricted to a (scope, scopeId) pair, and not expired.
  const policyGrantsAction = async (
    checkScope?: z.infer<typeof permissionScopeEnum>,
    checkScopeId?: string,
  ): Promise<boolean> => {
    const conditions: any[] = [
      eq(permissionPolicies.userId, userId),
      eq(permissionPolicies.resource, resource),
    ];

    if (checkScope && checkScopeId) {
      conditions.push(eq(permissionPolicies.scope, checkScope as any));
      conditions.push(eq(permissionPolicies.scopeId, checkScopeId));
    }

    conditions.push(
      or(
        isNull(permissionPolicies.expiresAt),
        gt(permissionPolicies.expiresAt, now),
      ),
    );

    const [policy] = await db
      .select()
      .from(permissionPolicies)
      .where(and(...conditions));

    if (!policy) return false;

    return (policy.actions as string[]).includes(action as string);
  };

  // 1) Direct match at the requested scope.
  if (await policyGrantsAction(scope, scopeId)) return true;

  // 2) Hierarchical inheritance: a JOB_TITLE target inherits any permission
  //    granted at the DEPARTMENT that owns the job title. E.g. CREATE on
  //    QUESTION @ DEPARTMENT "DEP" also grants CREATE on QUESTION for every
  //    job title under "DEP".
  if (scope === "JOB_TITLE" && scopeId) {
    const [jobTitle] = await db
      .select({ departmentId: jobTitles.departmentId })
      .from(jobTitles)
      .where(eq(jobTitles.id, scopeId))
      .limit(1);

    if (jobTitle?.departmentId) {
      if (await policyGrantsAction("DEPARTMENT", jobTitle.departmentId))
        return true;
    }
  }

  return false;
};

export const checkPermissions = async (
  permissions: PermissionCheckParams[],
): Promise<boolean> => {
  for (const permission of permissions) {
    const hasAccess = await checkPermission(permission);
    if (!hasAccess) return false;
  }
  return true;
};

export const hasPermission = function (permission: Permission) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, {
        message: "Unauthorized: Authentication required",
      });
    }

    const userId = user.id;
    const userRole = user.role;

    if (userRole === "SUPER_ADMIN") {
      await next();
      return;
    }

    const hasAccess = await checkPermission({
      userId,
      resource: permission.resource,
      action: permission.permission,
      scope: permission.scope,
      scopeId: permission.scopeId,
    });

    if (!hasAccess) {
      throw new HTTPException(403, {
        message: getPermissionErrorMessage(permission),
        cause: "Unauthorized access",
      });
    }

    await next();
  });
};

export const hasPermissions = function (permissions: Permission[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, {
        message: "Unauthorized: Authentication required",
      });
    }

    if (user.role === "SUPER_ADMIN") {
      await next();
      return;
    }

    const allAllowed = await checkPermissions(
      permissions.map((p) => ({
        userId: user.id,
        resource: p.resource,
        action: p.permission,
        scope: p.scope,
        scopeId: p.scopeId,
      })),
    );

    if (!allAllowed) {
      throw new HTTPException(403, {
        message: getPermissionErrorMessage(permissions[0]),
        cause: "Unauthorized access",
      });
    }

    await next();
  });
};

export const hasScopedPermissions = (options: {
  resource: z.infer<typeof ResourceTypeSchema>;
  permission: z.infer<typeof ResourcePermissionSchema>;
  scope: z.infer<typeof permissionScopeEnum>;
  field: string;
}) => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, {
        message: "Unauthorized: Authentication required",
      });
    }

    if (user.role === "SUPER_ADMIN") {
      await next();
      return;
    }

    const json = await c.req.json();
    const items = (json as any)?.[options.field] || [];

    for (const item of items) {
      const scopeId = typeof item === "string" ? item : item.id;
      const hasAccess = await checkPermission({
        userId: user.id,
        resource: options.resource,
        action: options.permission,
        scope: options.scope,
        scopeId,
      });
      if (!hasAccess) {
        throw new HTTPException(403, {
          message: `Access Denied: You lack the required permissions for one or more ${options.field}`,
          cause: "Unauthorized access",
        });
      }
    }

    await next();
  });
};
