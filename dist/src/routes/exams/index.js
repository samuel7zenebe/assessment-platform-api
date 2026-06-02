import { Hono } from "hono";
import { getAllExams, getExamById, getExamQuestions, createExam, updateExam, deleteExam, publishExam, archiveExam, generateExamQuestions, getExamStatistics, activateExam, closeExam, } from "./examsController.js";
import { addQuestionToExam, removeQuestionFromExam, bulkReorder, } from "../exam-questions/examQuestionsController.js";
import { addJobTitle, deleteExamJobTitle, editExamJobTitle, getExamJobTitlesByExamId, } from "../exam-job-titles/examJobTitlesController.js";
import { assignCandidates, listCandidates, unassignCandidate, updateAssignmentStatus, } from "../exam-candidates/examCandidatesController.js";
export const examsRouter = new Hono()
    // ── List / detail ─────────────────────────────────────────────────────────
    .get("/", ...getAllExams)
    .post("/", ...createExam)
    .get("/:id", ...getExamById)
    .put("/:id", ...updateExam)
    .delete("/:id", ...deleteExam)
    // ── Lifecycle actions ─────────────────────────────────────────────────────
    .patch("/:id/publish", ...publishExam)
    .patch("/:id/archive", ...archiveExam)
    .patch("/:id/activate", ...activateExam)
    .patch("/:id/close", ...closeExam)
    // ---- Question Mnagement ------------
    .get("/:id/questions", ...getExamQuestions)
    .post("/:id/questions", ...addQuestionToExam)
    .delete(":/id/questions/:questionId", ...removeQuestionFromExam)
    .patch("/:id/questions/reorder", ...bulkReorder)
    // job titles weight
    .get("/:id/job-titles", ...getExamJobTitlesByExamId)
    .post("/:id/job-titles", ...addJobTitle)
    .patch("/:id/job-titles/:jobTitlesId", ...editExamJobTitle)
    .delete("/:id/job-titles/:jobTitleId", ...deleteExamJobTitle)
    // Fetch jobtitles of some job-title id
    .post("/:id/generate", ...generateExamQuestions)
    .get("/:id/statistics", ...getExamStatistics)
    //  Admin only
    .get("/:examId/candidates", ...listCandidates)
    // List assigned candidates + assignemntStatus
    .post("/:examId/candidates", ...assignCandidates)
    //Assign one or many { candidateIds: [] }
    .patch("/:examId/:candidateId/status", ...updateAssignmentStatus)
    // DELETE /exams/:examId/candidates/:candidateId → unassign candidate
    .delete("/:examId/candidates/:candidateId", ...unassignCandidate);
