import { Hono } from "hono";
import {
  submitAnswer,
  getSavedAnswer,
  getAllAttemptAnswers,
  updateAnswer,
  gradeAnswer,
  bulkGradeAnswers,
  getAnswerStatistics,
} from "./attemptQuestionAnswers.controller.js";

export const attemptQuestionAnswerRouter = new Hono()
  // POST   /attempt-questions/:id/answers  → submit answer
  .post("/:id/answers", ...submitAnswer)

  // GET    /attempt-questions/:id/answer  → fetch saved answer
  .get("/:id/answer", ...getSavedAnswer)

  // GET    /exam-attempts/:id/answers     → all attempt answers
  .get("/exam-attempts/:id/answers", ...getAllAttemptAnswers)

  // PATCH  /answers/:id                  → update answer
  .patch("/answers/:id", ...updateAnswer)

  // PATCH  /answers/:id/grade            → manual grading
  .patch("/answers/:id/grade", ...gradeAnswer)

  // POST   /answers/bulk-grade           → bulk grading
  .post("/answers/bulk-grade", ...bulkGradeAnswers)

  // GET    /answers/statistics           → analytics
  .get("/answers/statistics", ...getAnswerStatistics);
