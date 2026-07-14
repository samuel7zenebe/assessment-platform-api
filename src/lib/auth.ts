import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/db/index.js"; // your drizzle instance
import * as schema from "@/src/db/schema.js";
import { admin, username } from "better-auth/plugins";
import { ac, ADMIN, BUILDER, CANDIDATE, SUPER_ADMIN } from "./permissions.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
      temporaryCandidate: {
        type: "boolean",
        input: true,
        defaultValue: false,
      },
      departmentId: {
        type: "string",
        input: true,
      },
      jobTitleId: {
        type: "string",
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [
    username(),
    admin({
      defaultRole: "CANDIDATE",
      adminRoles: ["ADMIN", "SUPER_ADMIN"],
      ac,
      roles: {
        ADMIN,
        BUILDER,
        CANDIDATE,
        SUPER_ADMIN,
      },
    }),
  ],
  // For cross-origin cookie support
  // advanced: {
  //   defaultCookieAttributes: {
  //     sameSite: "none", // Required for cross-origin
  //     secure: true, // Required when sameSite is "none"
  //     partitioned: true, // For third-party cookie compliance
  //   },
  // },
});
