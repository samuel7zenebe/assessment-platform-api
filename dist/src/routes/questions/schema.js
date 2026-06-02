import { questionBank } from "@/src/db/schema.js";
import { difficultyLabelSchema, questionTypeSchema, strictBooleanSchema, } from "@/src/lib/schema.js";
import z from "zod";
export const QuestionChoiceSchema = z.object({
    choiceText: z.string().min(1, "Choice text is required"),
    isCorrect: z.boolean(),
    displayOrder: z.coerce.number().int().nonnegative(),
});
export const QuestionDataSchema = z.object({
    // for choice types
    shuffleChoices: z.boolean().default(false).optional(),
    multipleSelection: z.boolean().default(false).optional(),
    minimumSelections: z.number().default(1).optional(),
    maximumSelections: z.number().optional(),
    partialCredit: z.boolean().default(false).optional(),
    // For Match
    shuffleLabels: z.boolean().optional(),
    //  For Essay type questions
    minimumWords: z.number().default(200),
    maximumWords: z.number().default(1000),
    caseSensitive: z.boolean().optional(),
    allowFormatting: z.boolean().optional(),
    manualReviewRequired: z.boolean().optional(),
    plagiarismCheck: z.boolean().optional(),
    recommendedTimeSeconds: z.number().default(600),
    shuffleLeftColumn: z.boolean().optional(),
    shuffleRightColumn: z.boolean().optional(),
    allowReuse: z.boolean().optional(),
    // True/False Answer
    booleanAnswer: z.boolean().optional(),
    // Match Type question
    pairs: z
        .array(z.object({
        left: z.string(),
        right: z.string(),
    }))
        .optional(),
});
export const QuestionBankSchema = z.object({
    id: z.string(),
    category: z.string(),
    question: z.string(),
    difficultyLabel: difficultyLabelSchema,
    type: questionTypeSchema,
    imageUrl: z.string().nullable(),
    audioUrl: z.string().nullable(),
    videoUrl: z.string().nullable(),
    explanation: z.string().nullable(),
    estimatedTimeSeconds: z.coerce.number().default(60),
    questionData: QuestionDataSchema,
    points: z.coerce.number().default(1),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    createdBy: z.string(),
    version: z.number().default(1).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().optional(),
});
export const QuestionBankCreateSChema = z.object({
    category: z.string().min(1, "Category is required"),
    question: z.string().min(1, "Question text is required"),
    difficultyLabel: difficultyLabelSchema,
    type: questionTypeSchema,
    imageUrl: z.string().optional().nullable(),
    audioUrl: z.string().optional().nullable(),
    videoUrl: z.string().optional().nullable(),
    explanation: z.string().optional(),
    estimatedTimeSeconds: z.coerce.number().default(60),
    questionData: QuestionDataSchema,
    version: z.coerce.number().optional().default(1),
    points: z.coerce
        .number()
        .int()
        .positive("Points must be a positive integer")
        .default(1),
    isPublic: z.coerce.boolean().optional().default(false),
    isActive: z.coerce.boolean().optional().default(false),
    createdBy: z.string(),
    choices: z
        .array(QuestionChoiceSchema)
        .min(2, "At least two choices are required"),
    jobTitles: z.array(z.string()).min(1, "At least one job title is required"),
});
export const QuestionBankEditSchema = z.object({
    imageUrl: z.string().optional(),
    category: z.string().optional(),
    question: z.string().optional(),
    difficultyLevel: difficultyLabelSchema.optional(),
    type: questionTypeSchema.optional(),
    points: z.coerce
        .number()
        .int()
        .positive("Points must be a positive integer")
        .optional(),
});
export const QuestionBankSearchSchema = z.object({
    searchTerm: z.string().optional(),
    field: z.string().optional(),
    limit: z.coerce.string().optional(),
    offset: z.coerce.string().optional(),
    deleted: strictBooleanSchema.default(false),
});
