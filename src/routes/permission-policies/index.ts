import { Hono } from "hono";
import {
  createPermissionPolicy,
  bulkCreatePermissionPolicies,
  checkPermission,
  listPermissionPolicies,
  getPermissionPolicy,
  updatePermissionPolicy,
  deletePermissionPolicy,
  getUserPermissionPolicies,
  createUserPermissionPolicy,
  deleteUserPermissionPolicy,
  getJobTitlePermissions,
  getDepartmentPermissions,
} from "./permissionPoliciesController.js";

export const permissionPoliciesRouter = new Hono()
  // ── Permission policies management ──────────────────────────────────
  .get("/", ...listPermissionPolicies)
  .post("/", ...createPermissionPolicy)
  .post("/bulk-create", ...bulkCreatePermissionPolicies)
  .post("/check", ...checkPermission)
  .get("/:id", ...getPermissionPolicy)
  .patch("/:id", ...updatePermissionPolicy)
  .delete("/:id", ...deletePermissionPolicy)
  // ── User-specific permission policies ──────────────────────────────────
  .get("/users/:userId", ...getUserPermissionPolicies)
  .post("/users/:userId", ...createUserPermissionPolicy)
  .delete("/users/:userId/:id", ...deleteUserPermissionPolicy)

  ///---- ScopeId-specific permission policies

  .get("/job-title/:jobTitleId", ...getJobTitlePermissions)
  .get("/department/:departmentId", ...getDepartmentPermissions);
