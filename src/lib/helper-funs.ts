import { db } from "../db/index.js";
import { questionBank, questionJobTitles } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export const questionsExist = async (
  jobId: string,
  difficultyLabel: "MEDIUM" | "HARD" | "EASY",
  maximumQuestions: number,
) => {
  const questions = await db
    .select()
    .from(questionJobTitles)
    .leftJoin(questionBank, eq(questionBank.id, questionJobTitles.questionId))
    .where(
      and(
        eq(questionJobTitles.jobTitleId, jobId),
        eq(questionBank.difficultyLabel, difficultyLabel),
      ),
    );
  return questions.length >= maximumQuestions;
};
