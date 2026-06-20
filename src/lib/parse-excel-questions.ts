import * as XLSX from "xlsx";
import type { z } from "zod";
import {
  QuestionBankCreateSchema,
  QuestionChoiceSchema,
} from "../routes/questions/schema.js";
import { getUserByEmail } from "./helper-funs.js";

export type QuestionBankCreate = z.infer<typeof QuestionBankCreateSchema> & {
  choices: z.infer<typeof QuestionChoiceSchema>[];
  jobTitles: string[];
};

// ── Raw row shape from Excel ──────────────────────────────────────────────────

interface RawRow {
  category?: string;
  question?: string;
  difficultyLabel?: string;
  type?: string;
  explanation?: string;
  estimatedTimeSeconds?: string | number;
  points?: string | number;
  isPublic?: string;
  isActive?: string;
  version?: string | number;
  createdBy?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  choice1_text?: string;
  choice2_text?: string;
  choice3_text?: string;
  choice4_text?: string;
  choice5_text?: string;
  choice6_text?: string;
  correctChoices?: string;
  jobTitles?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const str = (val: unknown): string => (val == null ? "" : String(val).trim());

const parseBoolean = (val: string): boolean => val.toUpperCase() === "TRUE";

const splitColon = (val: string): string[] =>
  val
    .split(":")
    .map((s) => s.trim())
    .filter(Boolean);

function buildChoices(
  raw: RawRow,
  correctSet: Set<string>,
): z.infer<typeof QuestionChoiceSchema>[] {
  const keys = [
    "choice1_text",
    "choice2_text",
    "choice3_text",
    "choice4_text",
    "choice5_text",
    "choice6_text",
  ] as const;

  return keys.reduce<z.infer<typeof QuestionChoiceSchema>[]>(
    (acc, key, idx) => {
      const text = str(raw[key]);
      if (!text || text.toUpperCase() === "N/A") return acc;
      acc.push({
        choiceText: text,
        isCorrect: correctSet.has(text),
        displayOrder: idx + 1,
      });
      return acc;
    },
    [],
  );
}

// ── Parse result types ────────────────────────────────────────────────────────

export interface ParseSuccess {
  status: "ok";
  row: number;
  data: QuestionBankCreate;
}

export interface ParseError {
  status: "error";
  row: number;
  errors: string[];
  raw: RawRow;
}

export type ParseResult = ParseSuccess | ParseError;

// ── Main parser ───────────────────────────────────────────────────────────────

export async function parseQuestionBankExcel(file: File): Promise<{
  questions: QuestionBankCreate[];
  errors: ParseError[];
  summary: { total: number; succeeded: number; failed: number };
}> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
  });
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  // range: 1 → row 2 (0-indexed row 1) becomes the header row
  // This skips the section-banner row (row 1) and uses column-name row (row 2) as headers
  // row 3 (hints) is then index 0 in the resulting array — we drop it below
  const allRows = XLSX.utils.sheet_to_json<RawRow>(ws, {
    defval: "",
    range: 1,
  });

  // Drop the hint row (index 0) and any completely empty rows
  const dataRows = allRows
    .slice(1)
    .filter((raw) => Object.values(raw).some((v) => str(v) !== ""));

  const results: ParseResult[] = dataRows.map((raw, idx) => {
    const excelRow = idx + 4; // rows 1–3 are banners/headers/hints
    const correctRaw = str(raw.correctChoices);
    const correctSet = new Set<string>(
      !correctRaw || correctRaw.toUpperCase() === "N/A"
        ? []
        : splitColon(correctRaw),
    );

    const jobTitlesRaw = str(raw.jobTitles);
    const jobTitles = jobTitlesRaw ? splitColon(jobTitlesRaw) : [];

    const payload = {
      category: str(raw.category),
      question: str(raw.question),
      difficultyLabel: str(raw.difficultyLabel),
      type: str(raw.type),
      explanation: str(raw.explanation) || undefined,
      estimatedTimeSeconds: raw.estimatedTimeSeconds,
      points: raw.points,
      isPublic: parseBoolean(str(raw.isPublic) || "TRUE"),
      isActive: parseBoolean(str(raw.isActive) || "FALSE"),
      version: raw.version,
      createdBy: str(raw.createdBy),
      imageUrl: str(raw.imageUrl) || null,
      audioUrl: str(raw.audioUrl) || null,
      videoUrl: str(raw.videoUrl) || null,
      choices: buildChoices(raw, correctSet),
      jobTitles,
    };

    const result = QuestionBankCreateSchema.safeParse(payload);

    if (!result.success) {
      return {
        status: "error",
        row: excelRow,
        errors: result.error.issues.map(
          (e) => `[${e.path.join(".")}] ${e.message}`,
        ),
        raw,
      } satisfies ParseError;
    }

    return {
      status: "ok",
      row: excelRow,
      data: result.data,
    } satisfies ParseSuccess;
  });

  const succeeded = results.filter((r): r is ParseSuccess => r.status === "ok");
  const failed = results.filter((r): r is ParseError => r.status === "error");

  return {
    questions: succeeded.map((r) => r.data),
    errors: failed,
    summary: {
      total: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
    },
  };
}
