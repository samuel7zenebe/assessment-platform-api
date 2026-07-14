import { Hono } from "hono";
import { questionBankRouter } from "./routes/questions/index.js";
import { jobTitlesRouter } from "./routes/job-titles/index.js";
import { departmentsRouter } from "./routes/departments/index.js";
import { questionChoicesRouter } from "./routes/choices/index.js";
import { questionJobTitlesRouter } from "./routes/question-jobtitles/index.js";
import { usersRouter } from "./routes/users/index.js";
import { examsRouter } from "./routes/exams/index.js";
import { examQuestionsRouter } from "./routes/exam-questions/index.js";
import { examCandidatesRouter } from "./routes/exam-candidates/index.js";
import { examAttemptsRouter } from "./routes/exam-attempts/index.js";
import { examJobTitlesRouter } from "./routes/exam-job-titles/index.js";
import { attemptsRouter } from "./routes/attempts/index.js";
import { gradingRouter } from "./routes/grading/index.js";
import { examMonitorRouter } from "./routes/exam-monitor/index.js";
import { analyticsRouter } from "./routes/analytics/index.js";
import { auditLogsRouter } from "./routes/audit-logs/index.js";
import { permissionPoliciesRouter } from "./routes/permission-policies/index.js";
import { generateExamByDifficulty } from "./routes/exams/utils.js";
import { CreateExamSchema } from "./routes/exams/schema.js";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";
import { difficultyLabelSchema } from "@/src/lib/schema.js";
import { questionsExist } from "@/src/lib/helper-funs.js";

export const AppRouter = new Hono().basePath("/api");

AppRouter.route("/users", usersRouter);
AppRouter.route("/questions", questionBankRouter);
AppRouter.route("/job-titles", jobTitlesRouter);
AppRouter.route("/departments", departmentsRouter);
AppRouter.route("/choices", questionChoicesRouter);
AppRouter.route("/exams", examsRouter);
AppRouter.route("/attempts", attemptsRouter);
AppRouter.route("/grading", gradingRouter);
AppRouter.route("/exam-monitor", examMonitorRouter);
AppRouter.route("/analytics", analyticsRouter);
AppRouter.route("/audit-logs", auditLogsRouter);
AppRouter.route("/permission-policies", permissionPoliciesRouter);

AppRouter.route("/exam-questions", examQuestionsRouter);
AppRouter.route("/exam-candidates", examCandidatesRouter);
AppRouter.route("/exam-attempts", examAttemptsRouter);
AppRouter.route("/question-jobtitles", questionJobTitlesRouter);
AppRouter.route("/exam-job-titles", examJobTitlesRouter);

// â”€â”€ Compatibility / test helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

AppRouter.get("/generate-questions", async (c) => {
  const { generateQuestions } = await import("./utils/generate-questions.js");
  return c.json({ data: generateQuestions(200) });
});

AppRouter.post(
  "/question-exists",
  sValidator(
    "json",
    z.object({
      jobId: z.uuid(),
      difficultyLabel: difficultyLabelSchema,
      total: z.number(),
    }),
  ),
  async (c) => {
    const { jobId, difficultyLabel, total } = c.req.valid("json");
    const exist = await questionsExist(jobId, difficultyLabel, total);
    return c.json({ exist: !!exist });
  },
);

AppRouter.post(
  "/distribution",
  sValidator("json", CreateExamSchema),
  async (c) => {
    const validData = c.req.valid("json");
    const { distribution } = await generateExamByDifficulty(validData);
    const jobTitleDistribution = validData.jobTitles.map((j) => ({
      easy: Math.round(distribution.easy * (j.weight / 100)),
      medium: Math.round(distribution.medium * (j.weight / 100)),
      hard: Math.round(distribution.hard * (j.weight / 100)),
      total: Math.round((distribution.total * j.weight) / 100),
    }));
    return c.json({ data: jobTitleDistribution });
  },
);
