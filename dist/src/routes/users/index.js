import { Hono } from "hono";
import { listUsers, getUser, banUser, unbanUser, updateUser, deleteUser, revokeUserSession, setUserPassword, setUserRole, revokeUserSessions, getMe, } from "./usersController.js";
export const usersRouter = new Hono();
usersRouter.get("/", ...listUsers);
usersRouter.get("/me", ...getMe);
usersRouter.get("/:id", ...getUser);
usersRouter.post("/ban", ...banUser);
usersRouter.post("/unban", ...unbanUser);
usersRouter.put("/", ...updateUser);
usersRouter.delete("/:id", ...deleteUser);
usersRouter.post("/set-role", ...setUserRole);
usersRouter.post("/set-password", ...setUserPassword);
usersRouter.post("/revoke-session", ...revokeUserSession); // Non tested
usersRouter.post("/revoke-user-sessions/:id", ...revokeUserSessions); // Non tested
