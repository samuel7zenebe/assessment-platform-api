import { questionBank, questionJobTitles } from "@/src/db/schema.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/src/db/index.js";
export async function generateExamByDifficulty({ difficultyLevel, jobTitles, totalQuestions, }) {
    const dist = calculateQuestionDistribution(totalQuestions, difficultyLevel);
    let generatedExamQuestions = [];
    for (let jobTitle of jobTitles) {
        const [easyQs, mediumQs, hardQs] = await Promise.all([
            db
                .select()
                .from(questionJobTitles)
                .innerJoin(questionBank, eq(questionJobTitles.questionId, questionBank.id))
                .where(and(eq(questionBank.difficultyLabel, "EASY"), eq(questionJobTitles.jobTitleId, jobTitle.id)))
                .orderBy(sql `RANDOM()`)
                .limit(Math.round(dist.easy * (jobTitle.weight / 100))),
            db
                .select()
                .from(questionJobTitles)
                .innerJoin(questionBank, eq(questionJobTitles.questionId, questionBank.id))
                .where(and(eq(questionBank.difficultyLabel, "MEDIUM"), eq(questionJobTitles.jobTitleId, jobTitle.id)))
                .orderBy(sql `RANDOM()`)
                .limit(Math.round(dist.medium * (jobTitle.weight / 100))),
            db
                .select()
                .from(questionJobTitles)
                .innerJoin(questionBank, eq(questionJobTitles.questionId, questionBank.id))
                .where(and(eq(questionBank.difficultyLabel, "HARD"), eq(questionJobTitles.jobTitleId, jobTitle.id)))
                .orderBy(sql `RANDOM()`)
                .limit(Math.round(dist.hard * (jobTitle.weight / 100))),
        ]);
        generatedExamQuestions = [
            ...generatedExamQuestions,
            ...easyQs,
            ...mediumQs,
            ...hardQs,
        ].sort(() => Math.random() - 0.5);
    }
    return {
        exam: generatedExamQuestions,
        distribution: dist,
    };
}
function calculateQuestionDistribution(totalQuestions, difficultyLevel) {
    const normalized = Math.max(0, Math.min(10, difficultyLevel)) / 10;
    let easyPercent, mediumPercent, hardPercent;
    if (difficultyLevel <= 2) {
        easyPercent = 0.9;
        mediumPercent = 0.1;
        hardPercent = 0.0;
    }
    else if (difficultyLevel <= 4) {
        easyPercent = 0.6 - (normalized - 0.2) * 0.8;
        mediumPercent = 0.35;
        hardPercent = 0.05 + (normalized - 0.2) * 0.4;
    }
    else if (difficultyLevel <= 7) {
        // Balanced → Medium heavy
        easyPercent = 0.25 - (normalized - 0.4) * 0.6;
        mediumPercent = 0.5 + (normalized - 0.4) * 0.3;
        hardPercent = 0.25 + (normalized - 0.4) * 0.7;
    }
    else {
        // Hard Exam
        easyPercent = 0.1 - (normalized - 0.7) * 0.3;
        mediumPercent = 0.4;
        hardPercent = 0.5 + (normalized - 0.7) * 0.6;
    }
    // Convert percentages to actual counts
    let easyCount = Math.round(totalQuestions * easyPercent);
    let mediumCount = Math.round(totalQuestions * mediumPercent);
    let hardCount = Math.round(totalQuestions * hardPercent);
    // Adjust to make sure total is exact
    const sum = easyCount + mediumCount + hardCount;
    if (sum !== totalQuestions) {
        const diff = totalQuestions - sum;
        // Add remaining to the dominant category
        if (hardCount > mediumCount && hardCount > easyCount)
            hardCount += diff;
        else if (mediumCount > easyCount)
            mediumCount += diff;
        else
            easyCount += diff;
    }
    return {
        easy: Math.max(0, easyCount),
        medium: Math.max(0, mediumCount),
        hard: Math.max(0, hardCount),
        total: totalQuestions,
        overallDifficulty: difficultyLevel,
    };
}
