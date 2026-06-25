import {
  ResourcePermissionSchema,
  ResourceTypeSchema,
} from "@/src/lib/schema.js";
import z from "zod";

export const CreateResourcePermissionSchema = z.object({
  userId: z.string().min(1),

  resourceType: ResourceTypeSchema,

  resourceId: z.uuid(),

  permission: ResourcePermissionSchema,

  grantedBy: z.string().optional(),

  expiresAt: z.coerce.date().optional(),

  notes: z.string().max(1000).optional(),
});

export const UpdateResourcePermissionSchema = z.object({
  permission: ResourcePermissionSchema.optional(),

  expiresAt: z.coerce.date().nullable().optional(),

  notes: z.string().max(1000).nullable().optional(),
});

export const BulkCreateResourcePermissionSchema = z.object({
  userId: z.string().min(1),

  resourceType: ResourceTypeSchema,

  resourceId: z.uuid(),

  permissions: z.array(ResourcePermissionSchema).min(1),
});

export const ResourcePermissionFilterSchema = z.object({
  userId: z.string().optional(),

  resourceType: ResourceTypeSchema.optional(),

  resourceId: z.uuid().optional(),

  permission: ResourcePermissionSchema.optional(),
});

export const DeleteResourcePermissionSchema = z.object({
  id: z.uuid(),
});

export type CreateResourcePermission = z.infer<
  typeof CreateResourcePermissionSchema
>;

export type UpdateResourcePermission = z.infer<
  typeof UpdateResourcePermissionSchema
>;

export type BulkCreateResourcePermission = z.infer<
  typeof BulkCreateResourcePermissionSchema
>;

export type ResourcePermissionFilter = z.infer<
  typeof ResourcePermissionFilterSchema
>;
