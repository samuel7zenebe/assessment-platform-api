import { Hono } from "hono";
import {
  listUsers,
  getUser,
  banUser,
  unbanUser,
  updateUser,
  deleteUser,
  revokeUserSession,
  setUserPassword,
  setUserRole,
  revokeUserSessions,
  getMe,
  getUserExams,
  generateFakeCandidate,
} from "./usersController.js";

export const usersRouter = new Hono();

usersRouter.get("/", ...listUsers);
usersRouter.get("/me", ...getMe);
usersRouter.get("/exams", ...getUserExams);
usersRouter.get("/:id", ...getUser);
usersRouter.post("/ban", ...banUser);
usersRouter.post("/unban", ...unbanUser);
usersRouter.put("/", ...updateUser);
usersRouter.delete("/:id", ...deleteUser);
usersRouter.post("/set-role", ...setUserRole);
usersRouter.post("/set-password", ...setUserPassword);
usersRouter.post("/revoke-session", ...revokeUserSession); // Non tested
usersRouter.post("/revoke-user-sessions/:id", ...revokeUserSessions); // Non tested
usersRouter.post("/generate-fake-candidate", ...generateFakeCandidate);

// | Method | Endpoint                                            | Purpose                         |
// | ------ | --------------------------------------------------- | ------------------------------- |
// | GET    | `/users/:userId/resource-permissions`               | List all permissions for a user |
// | POST   | `/users/:userId/resource-permissions`               | Grant permissions to a user     |
// | DELETE | `/users/:userId/resource-permissions/:permissionId` | Revoke one permission           |
