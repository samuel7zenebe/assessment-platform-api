// import { v4 as uuidv4 } from "uuid";

import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "./src/db/index.js";
import {
  jobTitles as JobTitles,
  questionBank,
  questionJobTitles,
} from "./src/db/schema.js";
import { getQuestionDifficultyDistribution } from "./src/routes/exams/utils.js";

// // Mock values for your status enum (adjust values to match your schema definition)
// const examStatusEnumValues = [
//   "DRAFT",
//   "SCHEDULED",
//   "ACTIVE",
//   "COMPLETED",
//   "ARCHIVED",
// ] as const;

// export function generateMockExam(overrides: Partial<any> = {}) {
//   const categories = [
//     "Mathematics",
//     "Computer Science",
//     "Language Arts",
//     "Physics",
//     "History",
//   ];
//   const titles = [
//     "Midterm Assessment",
//     "Final Exam",
//     "Certification Quiz",
//     "Placement Test",
//   ];

//   const randomCategory =
//     categories[Math.floor(Math.random() * categories.length)];
//   const randomTitle = `${randomCategory} ${titles[Math.floor(Math.random() * titles.length)]}`;

//   const now = new Date();

//   return {
//     id: uuidv4(),
//     title: randomTitle,
//     category: randomCategory,
//     examMetaData: {
//       allowCalculator: Math.random() > 0.5,
//       browserLockdown: Math.random() > 0.7,
//       proctorRequired: false,
//     },
//     description: `Comprehensive evaluation covering core principles of ${randomCategory}. Please read instructions carefully before starting.`,
//     estimatedTimeMinutes: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
//     scheduledTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Scheduled for tomorrow
//     lateEntryGraceMinutes: Math.random() > 0.5 ? 15 : 10,
//     passPercentage: [50, 60, 65, 70, 75][Math.floor(Math.random() * 5)],
//     totalQuestions: [20, 40, 50, 100][Math.floor(Math.random() * 4)],
//     difficultyLevel: Math.floor(Math.random() * 5) + 1, // 1 to 5
//     status:
//       examStatusEnumValues[
//         Math.floor(Math.random() * examStatusEnumValues.length)
//       ],
//     createdBy: `usr_${Math.random().toString(36).substr(2, 9)}`,
//     createdAt: now,

//     updatedAt: now,
//     deletedAt: null,
//     ...overrides,
//   };
// }

// // Generate an array of 5 mock exams
// export const mockExams = Array.from({ length: 1 }, () =>
//   console.log(generateMockExam()),
// );
