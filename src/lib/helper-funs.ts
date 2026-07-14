import { db } from "../db/index.js";
import {
  jobTitles,
  questionBank,
  questionJobTitles,
  user,
} from "../db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

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

export async function getUserByEmail({ email }: { email: string }) {
  try {
    const [userDetails] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (!userDetails?.id) {
      return {
        data: null,
        found: false,
        message: "No user was found",
      };
    }
    return {
      data: userDetails,
      found: true,
    };
  } catch (err) {
    console.log("Could not find user...", err);
    return {
      data: null,
      found: false,
      message: "Something went wrong",
    };
  }
}

export async function getJobTitleIds({
  titleNames,
}: {
  titleNames: string[];
}): Promise<{
  data: {
    jobTitleIds: string[] | null;
  };
  message?: string;
}> {
  try {
    const jobTitleIds = (
      await db
        .select()
        .from(jobTitles)
        .where(inArray(jobTitles.titleName, titleNames))
    ).map((jt) => jt.id);
    return {
      data: {
        jobTitleIds,
      },
    };
  } catch (err) {
    console.log("Failed to find jobTitleIds ", err);
    return {
      data: {
        jobTitleIds: null,
      },
      message: "Something went wrong",
    };
  }
}

export function getRandomNumberOrders(length: number): number[] {
  const numbers = Array.from({ length }, (_, index) => index);

  // 2. Shuffle the array using Fisher-yates algorithm
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
}
