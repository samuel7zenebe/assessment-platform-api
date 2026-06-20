import * as XLSX from "xlsx";
import { QuestionBankCreateSchema, QuestionChoiceSchema, } from "../routes/questions/schema.js";
// ── Helpers ───────────────────────────────────────────────────────────────────
const str = (val) => (val == null ? "" : String(val).trim());
const parseBoolean = (val) => val.toUpperCase() === "TRUE";
const splitColon = (val) => val
    .split(":")
    .map((s) => s.trim())
    .filter(Boolean);
function buildChoices(raw, correctSet) {
    const keys = [
        "choice1_text",
        "choice2_text",
        "choice3_text",
        "choice4_text",
        "choice5_text",
        "choice6_text",
    ];
    return keys.reduce((acc, key, idx) => {
        const text = str(raw[key]);
        if (!text || text.toUpperCase() === "N/A")
            return acc;
        acc.push({
            choiceText: text,
            isCorrect: correctSet.has(text),
            displayOrder: idx + 1,
        });
        return acc;
    }, []);
}
// ── Main parser ───────────────────────────────────────────────────────────────
export function parseQuestionBankExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    console.log(XLSX);
    console.log(typeof XLSX.readFile);
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    // range: 1 → row 2 (0-indexed row 1) becomes the header row
    // This skips the section-banner row (row 1) and uses column-name row (row 2) as headers
    // row 3 (hints) is then index 0 in the resulting array — we drop it below
    const allRows = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        range: 1,
    });
    // Drop the hint row (index 0) and any completely empty rows
    const dataRows = allRows
        .slice(1)
        .filter((raw) => Object.values(raw).some((v) => str(v) !== ""));
    const results = dataRows.map((raw, idx) => {
        const excelRow = idx + 4; // rows 1–3 are banners/headers/hints
        const correctRaw = str(raw.correctChoices);
        const correctSet = new Set(!correctRaw || correctRaw.toUpperCase() === "N/A"
            ? []
            : splitColon(correctRaw));
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
                errors: result.error.issues.map((e) => `[${e.path.join(".")}] ${e.message}`),
                raw,
            };
        }
        return {
            status: "ok",
            row: excelRow,
            data: result.data,
        };
    });
    const succeeded = results.filter((r) => r.status === "ok");
    const failed = results.filter((r) => r.status === "error");
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
// ── CLI entry ─────────────────────────────────────────────────────────────────
const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: ts-node parseQuestionBank.ts <path-to-excel>");
    process.exit(1);
}
const { questions, errors, summary } = parseQuestionBankExcel(filePath);
console.log("\n── Summary ──────────────────────────────────────────");
console.log(`Total rows : ${summary.total}`);
console.log(`Succeeded  : ${summary.succeeded}`);
console.log(`Failed     : ${summary.failed}`);
if (errors.length > 0) {
    console.log("\n── Validation Errors ────────────────────────────────");
    errors.forEach(({ row, errors: errs }) => {
        console.log(`Row ${row}:`);
        errs.forEach((e) => console.log(`  • ${e}`));
    });
}
console.log("\n── Parsed Questions (JSON) ──────────────────────────");
console.log(JSON.stringify(questions, null, 2));
