import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/db/index.js"; // your drizzle instance
import * as schema from "@/src/db/schema.js";
import { admin } from "better-auth/plugins";
import { ac, ADMIN, BUILDER, CANDIDATE } from "./permissions.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        defaultValue: "CANDIDATE",
      },
      firstName: {
        type: "string",
        input: true,
      },
      lastName: {
        type: "string",
        input: true,
      },
      isActive: {
        type: "boolean",
        input: true,
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "CANDIDATE",
      adminRoles: ["ADMIN"],
      ac,
      roles: {
        ADMIN,
        BUILDER,
        CANDIDATE,
      },
    }),
  ],
  // For cross-origin cookie support
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none", // Required for cross-origin
      secure: true, // Required when sameSite is "none"
      partitioned: true, // For third-party cookie compliance
    },
  },
});
