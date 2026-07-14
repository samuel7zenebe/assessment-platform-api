import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  candidate: ["assign_exam", "unassign_exam", "list", "update"],
  exam: ["create", "update", "delete", "list", "publish"],
} as const;

export const ac = createAccessControl(statement);

export const ADMIN = ac.newRole({
  ...adminAc.statements,
  exam: ["create", "update", "list"],
});

export const BUILDER = ac.newRole({
  candidate: ["list"],
});

export const CANDIDATE = ac.newRole({
  ...userAc.statements,
});

export const SUPER_ADMIN = ac.newRole({
  ...adminAc.statements,
});

// HR staff can assign exams to candidates, unassign exams, list candidates, and update candidate information. They can also create, update, delete, list, and publish exams.

export const RECRUITER = ac.newRole({
  ...adminAc.statements,
  candidate: ["assign_exam", "unassign_exam", "list", "update"],
  exam: ["publish", "update", "list"],
});
