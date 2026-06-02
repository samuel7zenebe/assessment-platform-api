import { Hono } from "hono";
import {
  addQuestionToExam,
  getExamQuestions,
  updateExamQuestion,
  removeQuestionFromExam,
  bulkReorder,
} from "./examQuestionsController.js";

export const examQuestionsRouter = new Hono()

  // POST   /exams/:id/questions         → attach question
  .post("/exams/:id/questions", ...addQuestionToExam)

  // GET    /exams/:examId/questions         → exam questions
  .get("/exams/:examId/questions", ...getExamQuestions)

  // PATCH  /exam-questions/:examId          → reorder / update
  .patch("/exam-questions/:examId", ...updateExamQuestion)

  // DELETE /exam-questions/:examId          → remove question
  .delete("/exam-questions/:examId", ...removeQuestionFromExam)

  // POST   /exams/:examId/questions/reorder → bulk reorder
  .post("/exams/:examId/questions/reorder", ...bulkReorder);
