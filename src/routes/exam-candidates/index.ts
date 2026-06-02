import { Hono } from "hono";
import {
  listCandidates,
  assignCandidates,
  unassignCandidate,
  updateAssignmentStatus,
} from "./examCandidatesController.js";

export const examCandidatesRouter = new Hono()

  // GET    /exams/:examId/candidates              → list assigned candidates
  .get("/exams/:examId/candidates", ...listCandidates)

  // POST   /exams/:examId/candidates              → assign candidates
  .post("/exams/:examId/candidates", ...assignCandidates)

  // DELETE /exams/:examId/candidates/:candidateId → unassign candidate
  .delete("/exams/:examId/candidates/:candidateId", ...unassignCandidate)

  // PATCH  /exam-candidates/:examId/:candidateId/status → update assignment status
  .patch("/exam-candidates/:examId/:candidateId/status", ...updateAssignmentStatus);
