import { createMiddleware } from "hono/factory";
import { auth } from "@/src/lib/auth.js";
import { HTTPException } from "hono/http-exception";
import type z from "zod";
import type { actionSchema, resourceSchema } from "../lib/schema.js";

export type Permission = {
  resource: z.infer<typeof resourceSchema>;
  action: z.infer<typeof actionSchema>;
};

export const getPermissionErrorMessage = (permission: Permission) => {
  const actionVerbs = {
    create: "create a new",
    read: "view the",
    update: "make changes to the",
    delete: "remove the",
    assign_exam: "Assign exam",
    unassign_exam: "Unassign exam",
    list: "list",
  };

  const actionText = actionVerbs[permission.action] || permission.action;

  return `Access Denied: You lack the required permissions to ${actionText} ${permission.resource}. Please contact your system administrator if you believe you should have access.`;
};

export const hasPermission = function (permission: Permission) {
  return createMiddleware(async (c, next) => {
    const userId = c.get("user").id;

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId,
        permissions: {
          [permission.resource]: [permission.action],
        },
      },
    });
    if (!hasPermission.success) {
      throw new HTTPException(403, {
        message: getPermissionErrorMessage(permission),
        cause: hasPermission.error || "Unauthorized",
      });
    }

    await next();
  });
};
