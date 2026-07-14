import { createFactory } from "hono/factory";
import { permissionPoliciesRepo } from "./permissionPoliciesRepo.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import {
  CreatePermissionPolicySchema,
  UpdatePermissionPolicySchema,
  PermissionPolicyFilterSchema,
  DeletePermissionPolicySchema,
  CheckPermissionSchema,
} from "./schema.js";
import { APIError } from "better-auth";
import { IdParamSchema } from "@/src/lib/schemas/common.js";
import { isAdmin } from "@/src/lib/roles.js";

const factory = createFactory();

// ── POST   /permission-policies  → create permission policy ─────────────────────
export const createPermissionPolicy = factory.createHandlers(
  sValidator("json", CreatePermissionPolicySchema),
  async (c) => {
    const user = c.get("user");
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Only admins users can create permission policies",
      });
    }

    const data = c.req.valid("json");
    try {
      const result = await permissionPoliciesRepo.create(data);
      return c.json(
        {
          data: result,
          success: true,
          message: "Permission policy created successfully",
        },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create permission policy",
        cause: err,
      });
    }
  },
);

// ── POST   /permission-policies/bulk-create  → bulk create ───────────────────────
export const bulkCreatePermissionPolicies = factory.createHandlers(
  sValidator("json", z.array(CreatePermissionPolicySchema)),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can create permission policies",
      });
    }

    const data = c.req.valid("json");
    try {
      const results = await permissionPoliciesRepo.bulkCreate(data);
      return c.json(
        {
          data: results,
          success: true,
          message: `${results.length} permission policies created successfully`,
        },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create permission policies",
        cause: err,
      });
    }
  },
);

// ── POST   /permission-policies/check  → check permission ───────────────────────
export const checkPermission = factory.createHandlers(
  sValidator("json", CheckPermissionSchema),
  async (c) => {
    const { resource, action, scope, scopeId } = c.req.valid("json");
    const userId = c.get("user").id;

    try {
      const hasAccess = await permissionPoliciesRepo.exists({
        userId,
        resource,
        action,
        scope,
        scopeId,
      });

      return c.json({
        data: { hasPermission: hasAccess },
        success: true,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to check permission",
        cause: err,
      });
    }
  },
);

// ── GET    /permission-policies  → list all permission policies ───────────────
export const listPermissionPolicies = factory.createHandlers(
  sValidator("query", PermissionPolicyFilterSchema),
  async (c) => {
    const user = c.get("user");
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can list permission policies",
      });
    }

    const filters = c.req.valid("query");
    try {
      const results = await permissionPoliciesRepo.findMany(filters);
      return c.json({
        data: results,
        success: true,
        total: results.length,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list permission policies",
        cause: err,
      });
    }
  },
);

// ── GET    /permission-policies/:id  → get permission policy ────────────────────
export const getPermissionPolicy = factory.createHandlers(
  sValidator("param", IdParamSchema),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can view permission policies",
      });
    }

    const { id } = c.req.valid("param");
    try {
      const result = await permissionPoliciesRepo.findById(id);
      if (!result) {
        throw new APIError("NOT_FOUND", {
          message: "Permission policy not found",
        });
      }
      return c.json({
        data: result,
        success: true,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get permission policy",
        cause: err,
      });
    }
  },
);

// ── PATCH  /permission-policies/:id  → update permission policy ─────────────────
export const updatePermissionPolicy = factory.createHandlers(
  sValidator("param", IdParamSchema),
  sValidator("json", UpdatePermissionPolicySchema),
  async (c) => {
    const user = c.get("user");

    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can update permission policies",
      });
    }

    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    console.log(data);

    try {
      const result = await permissionPoliciesRepo.update(id, data);
      if (!result) {
        throw new APIError("NOT_FOUND", {
          message: "Permission policy not found",
        });
      }
      return c.json({
        data: result,
        success: true,
        message: "Permission policy updated successfully",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update permission policy",
        cause: err,
      });
    }
  },
);

// ── DELETE /permission-policies/:id  → delete permission policy ───────────────────
export const deletePermissionPolicy = factory.createHandlers(
  sValidator("param", DeletePermissionPolicySchema.or(IdParamSchema)),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can delete permission policies",
      });
    }

    const { id } = c.req.valid("param");
    try {
      const result = await permissionPoliciesRepo.delete(id);
      if (!result) {
        throw new APIError("NOT_FOUND", {
          message: "Permission policy not found",
        });
      }
      return c.json({
        data: result,
        success: true,
        message: "Permission policy deleted successfully",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete permission policy",
        cause: err,
      });
    }
  },
);

// ── GET    /users/:userId/permission-policies  → list user policies ───────────────
export const getUserPermissionPolicies = factory.createHandlers(
  sValidator("param", z.object({ userId: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can view user permission policies",
      });
    }

    const { userId } = c.req.valid("param");
    try {
      const results = await permissionPoliciesRepo.findByUser(userId);
      return c.json({
        data: results,
        success: true,
        total: results.length,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get user permission policies",
        cause: err,
      });
    }
  },
);

// ── POST   /users/:userId/permission-policies  → create user policy ─────────────
export const createUserPermissionPolicy = factory.createHandlers(
  sValidator("param", z.object({ userId: z.string() })),
  sValidator("json", CreatePermissionPolicySchema.omit({ userId: true })),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can create user permission policies",
      });
    }

    const { userId } = c.req.valid("param");
    const data = c.req.valid("json");
    try {
      const result = await permissionPoliciesRepo.create({
        ...data,
        userId,
      });
      return c.json({
        data: result,
        success: true,
        message: "Permission policy created successfully",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create user permission policy",
        cause: err,
      });
    }
  },
);

// ── DELETE /users/:userId/permission-policies/:id  → delete user policy ───────────
export const deleteUserPermissionPolicy = factory.createHandlers(
  sValidator("param", z.object({ userId: z.string(), id: z.uuid() })),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role)) {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can delete user permission policies",
      });
    }

    const { userId, id } = c.req.valid("param");
    try {
      const result = await permissionPoliciesRepo.delete(id);
      if (!result) {
        throw new APIError("NOT_FOUND", {
          message: "Permission policy not found",
        });
      }
      return c.json({
        data: result,
        success: true,
        message: "Permission policy deleted successfully",
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete user permission policy",
        cause: err,
      });
    }
  },
);

// ── GET    /job-titles/:jobTitleIds  → list scope jobTitles policies ───────────────
export const getJobTitlePermissions = factory.createHandlers(
  sValidator("param", z.object({ jobTitleId: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can view user permission policies",
      });
    }

    const { jobTitleId } = c.req.valid("param");
    try {
      const results = await permissionPoliciesRepo.findByScope(
        "JOB_TITLE",
        jobTitleId,
      );
      return c.json({
        data: results,
        success: true,
        total: results.length,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get scope permission policies",
        cause: err,
      });
    }
  },
);

// ── GET    /job-titles/:jobTitleIds  → list scope jobTitles policies ───────────────
export const getDepartmentPermissions = factory.createHandlers(
  sValidator("param", z.object({ departmentId: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Only ADMIN users can view user permission policies",
      });
    }

    const { departmentId } = c.req.valid("param");
    try {
      const results = await permissionPoliciesRepo.findByScope(
        "DEPARTMENT",
        departmentId,
      );
      return c.json({
        data: results,
        success: true,
        total: results.length,
      });
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get scope permission policies",
        cause: err,
      });
    }
  },
);
