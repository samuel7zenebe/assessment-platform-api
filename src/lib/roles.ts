import type { UserRole } from "@/src/types/core.js";

export const ADMIN_ROLES: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

export const isAdmin = (role?: UserRole | string): boolean =>
  role === "ADMIN" || role === "SUPER_ADMIN";
