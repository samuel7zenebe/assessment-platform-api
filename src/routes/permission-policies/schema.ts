import {
  ResourceTypeSchema,
  ResourcePermissionSchema,
  permissionScopeEnum,
} from "@/src/lib/schema.js";
import z from "zod";

// ── Create Permission Policy ───────────────────────────────────────────────
export const CreatePermissionPolicySchema = z.object({
  userId: z.string().min(1),

  resource: ResourceTypeSchema,

  actions: z.array(ResourcePermissionSchema).min(1),

  scope: permissionScopeEnum,

  scopeId: z.string(),

  grantedBy: z.string().optional(),

  expiresAt: z.coerce.date().optional(),

  notes: z.string().max(1000).optional(),
});

// ── Bulk Create Permission Policy ───────────────────────────────────────────
export const BulkCreatePermissionPolicySchema = z.array(
  CreatePermissionPolicySchema,
);

// ── Update Permission Policy ───────────────────────────────────────────────
export const UpdatePermissionPolicySchema = z.object({
  actions: z.array(ResourcePermissionSchema).optional(),

  expiresAt: z.coerce.date().nullable().optional(),

  notes: z.string().max(1000).nullable().optional(),
});

// ── Permission Policy Filters ──────────────────────────────────────────────
export const PermissionPolicyFilterSchema = z.object({
  userId: z.string().optional(),

  resource: ResourceTypeSchema.optional(),

  scope: permissionScopeEnum.optional(),

  scopeId: z.uuid().optional(),
});

// ── Delete Permission Policy ───────────────────────────────────────────────
export const DeletePermissionPolicySchema = z.object({
  id: z.uuid(),
});

// ── Check Permission ───────────────────────────────────────────────────────
export const CheckPermissionSchema = z.object({
  resource: ResourceTypeSchema,

  action: ResourcePermissionSchema,

  scope: permissionScopeEnum.optional(),

  scopeId: z.uuid().optional(),
});

// Types
export type CreatePermissionPolicy = z.infer<
  typeof CreatePermissionPolicySchema
>;

export type BulkCreatePermissionPolicy = z.infer<
  typeof BulkCreatePermissionPolicySchema
>;

export type UpdatePermissionPolicy = z.infer<
  typeof UpdatePermissionPolicySchema
>;

export type PermissionPolicyFilter = z.infer<
  typeof PermissionPolicyFilterSchema
>;

export type CheckPermissionRequest = z.infer<typeof CheckPermissionSchema>;

export type PermissionScopeType = z.infer<typeof permissionScopeEnum>;
