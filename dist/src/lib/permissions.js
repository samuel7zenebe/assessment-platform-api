import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
const statement = {
    ...defaultStatements,
    exam: ["create", "update", "delete", "read"],
    question: ["create", "update", "delete", "read"],
    candidate: ["assign_exam", "unAssign_exam", "list"],
};
export const ac = createAccessControl(statement);
export const ADMIN = ac.newRole({
    ...adminAc.statements,
    exam: ["create", "update", "delete", "read"],
    question: ["create", "update", "delete", "read"],
    candidate: ["assign_exam", "unAssign_exam", "list"],
});
export const BUILDER = ac.newRole({
    exam: ["create", "update", "read"],
    question: ["create", "update", "read"],
    candidate: ["list"],
});
export const CANDIDATE = ac.newRole({
    exam: ["read"],
    question: ["read"],
});
