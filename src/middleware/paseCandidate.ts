import type { Context, Next } from "hono";
import { z } from "zod";
import * as XLSX from "xlsx";

/**
 * Must match the columns produced by Candidate_Import_Template.xlsx:
 *   Sheet "Candidates" — column A is a blank spacer, data lives in B/C/D,
 *   header row is row 6, the example row is row 7, real data starts row 8.
 */
export const UserSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Must be a valid email address"),
  examTitle: z.string().trim().min(1, "Exam title is required"),
});

export type CandidateRow = z.infer<typeof UserSchema>;

export interface RowError {
  row: number; // 1-indexed row number as it appears in Excel
  issues: string[];
}

export interface CandidateImportResult {
  candidates: CandidateRow[];
  errors: RowError[];
}

const SHEET_NAME = "Candidates";
const DATA_START_ROW = 8; // first real data row in the template (1-indexed)
const HEADER_MAP = ["_spacer", "fullName", "email", "examTitle"] as const;

/**
 * Pure parsing function — takes the raw file bytes, returns validated
 * candidates plus a list of row-level errors. Kept separate from the
 * middleware so it can be unit tested without a Hono request.
 */
export function parseCandidateWorkbook(
  buffer: ArrayBuffer,
): CandidateImportResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    return {
      candidates: [],
      errors: [
        {
          row: 0,
          issues: [`Sheet "${SHEET_NAME}" was not found in the uploaded file.`],
        },
      ],
    };
  }

  // range: DATA_START_ROW - 1 → 0-indexed row to start reading from (skips
  // the banner, header, and example rows built into the template).
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    range: DATA_START_ROW - 1,
    header: [...HEADER_MAP],
    defval: "",
    blankrows: false,
  });

  const candidates: CandidateRow[] = [];
  const errors: RowError[] = [];
  const seenEmails = new Set<string>();

  rawRows.forEach((raw, index) => {
    const excelRow = DATA_START_ROW + index;

    const candidateRaw = {
      fullName: String(raw.fullName ?? "").trim(),
      email: String(raw.email ?? "").trim(),
      examTitle: String(raw.examTitle ?? "").trim(),
    };

    // Skip fully blank rows (leftover formatting with no content).
    if (
      !candidateRaw.fullName &&
      !candidateRaw.email &&
      !candidateRaw.examTitle
    ) {
      return;
    }

    const result = UserSchema.safeParse(candidateRaw);

    if (!result.success) {
      errors.push({
        row: excelRow,
        issues: result.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const emailKey = result.data.email.toLowerCase();
    if (seenEmails.has(emailKey)) {
      errors.push({
        row: excelRow,
        issues: [`Duplicate email in file: ${result.data.email}`],
      });
      return;
    }
    seenEmails.add(emailKey);

    candidates.push(result.data);
  });

  return { candidates, errors };
}

/**
 * Hono middleware: expects multipart/form-data with a "file" field
 * containing the .xlsx upload. On success, sets `candidates` on context
 * for the downstream handler to persist (e.g. via Drizzle). On validation
 * failure, short-circuits with a 400 listing every row's issues.
 *
 * Usage:
 *   app.post("/candidates/import", candidateImportMiddleware(), async (c) => {
 *     const candidates = c.get("candidates");
 *     // bulk insert with Drizzle...
 *     return c.json({ imported: candidates.length });
 *   });
 */
export function candidateImportMiddleware() {
  return async (c: Context, next: Next) => {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!(file instanceof File)) {
      return c.json(
        {
          error:
            "Expected a multipart 'file' field containing the .xlsx upload.",
        },
        400,
      );
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return c.json({ error: "Only .xlsx files are supported." }, 400);
    }

    const buffer = await file.arrayBuffer();

    let result: CandidateImportResult;
    try {
      result = parseCandidateWorkbook(buffer);
    } catch (err) {
      return c.json(
        { error: "Could not read the uploaded file. Is it a valid .xlsx?" },
        400,
      );
    }

    if (result.candidates.length === 0 && result.errors.length === 0) {
      return c.json(
        {
          error:
            "No candidate rows found starting at row 8 of the 'Candidates' sheet.",
        },
        400,
      );
    }

    if (result.errors.length > 0) {
      return c.json(
        {
          error: "Some rows failed validation. Fix them and re-upload.",
          validRowCount: result.candidates.length,
          errors: result.errors,
        },
        422,
      );
    }

    c.set("candidates", result.candidates);
    await next();
  };
}
