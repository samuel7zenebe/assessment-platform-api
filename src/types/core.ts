import type z from "zod";
import type { userRoleSchema } from "../lib/schema.js";

export type Bindings = {
  token: string;
};

export type Variables = {
  user: {
    id: string;
    role: UserRole;
  };
};

export type UserRole = z.infer<typeof userRoleSchema>;
