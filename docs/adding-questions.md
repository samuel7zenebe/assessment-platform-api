# Adding Questions — `POST /api/questions` and `POST /api/questions/batch`

A quick glimpse of how question creation works in the examination-platform-api.

## Routes

Defined in `src/routes/questions/index.ts`:

| Method | Path                          | Handler                      | Purpose                       |
| :----- | :---------------------------- | :--------------------------- | :---------------------------- |
| `POST` | `/api/questions`              | `createQuestion`             | Create a single question      |
| `POST` | `/api/questions/batch`        | `createQuestionInBatch`      | Create many questions at once |
| `POST` | `/api/questions/batch/upload` | `createQuestionInBatchExcel` | Create from an Excel file     |

All three rely on the same underlying repo method `QuestionBankRepo.createQuestionBankRecord`.

## Request flow (single vs batch)

### `POST /api/questions`

1. Validates the JSON body against `QuestionBankCreateSchema` **minus** `createdBy` (`questionBankControllers.ts:154`).
2. Reads the authenticated user id from the context: `const { id: userId } = c.get("user")`.
3. Checks permission: `checkPermission({ action: "CREATE", resource: "QUESTION", scope: "JOB_TITLE", scopeId: validData.jobTitles[0] })`.
   - Note: single-create checks permission only against the **first** job title.
4. Calls `QuestionBankRepo.createQuestionBankRecord({ ...validData, createdBy: userId })`.
5. Returns `{ data: { questionId }, success, message }`.

### `POST /api/questions/batch`

1. Applies the `hasPermission({ resource: "QUESTION", permission: "CREATE" })` middleware.
2. Validates the body as **an array** of `QuestionBankCreateSchema`: `z.array(QuestionBankCreateSchema)` (`questionBankControllers.ts:217`).
3. Loops over each question, calling `createQuestionBankRecord({ ...question, createdBy: userId })` for each.
4. Collects all generated ids and returns them in `data.questionId` (an array).

> Heads-up: the batch loop is **not transactional across the whole batch** — each question is inserted in its own transaction, so partial failures can leave some questions created while the loop throws.

## The shared create logic — `createQuestionBankRecord`

`src/routes/questions/questionBankRepo.ts:71`

A single question payload is split into three parts and written inside **one DB transaction**:

```ts
const { choices, jobTitles, ...questionBankData } = data;

return db.transaction(async (tx) => {
  // 1) insert the question row
  const [questionBankDataRow] = await tx.insert(questionBank).values({...}).returning({ questionBankId });

  // 2) insert the choices (each linked to the new questionId)
  await tx.insert(questionChoices).values(formattedChoices);

  // 3) insert the question↔job-title links
  await tx.insert(questionJobTitles).values(formattedQuestionJobTitles);

  return questionBankDataRow.questionBankId;
});
```

So a question is always persisted together with:

- its **choices** (`questionChoices` table) — required, min 2
- its **job-title associations** (`questionJobTitles` table) — required, min 1

If any of the three inserts fails, the whole transaction rolls back.

## Payload shape — `QuestionBankCreateSchema`

`src/routes/questions/schema.ts:67` (required fields highlighted):

| Field                   | Type     | Notes                                  |
| :---------------------- | :------- | :------------------------------------- |
| `category`              | string   | required (min 1)                       |
| `question`              | string   | required (min 1)                       |
| `difficultyLabel`       | enum     | easy \| medium \| hard                 |
| `type`                  | enum     | question type                          |
| `points`                | number   | positive int, default 1                |
| `choices`               | array    | **min 2**, `QuestionChoiceInputSchema` |
| `jobTitles`             | string[] | **min 1** uuid                         |
| `questionData`          | object   | optional, type-specific config         |
| `isActive` / `isPublic` | boolean  | default false                          |
| `createdBy`             | string   | omitted from request; set server-side  |

For batch, send an **array** of the above (with `createdBy` included since the batch handler relies on the schema validation, not the single-create omit).

## Example

### Single

```json
POST /api/questions
{
  "category": "Math",
  "question": "2 + 2 = ?",
  "difficultyLabel": "easy",
  "type": "multiple-choice",
  "points": 1,
  "choices": [
    { "choiceText": "3", "isCorrect": false, "displayOrder": 1 },
    { "choiceText": "4", "isCorrect": true,  "displayOrder": 2 }
  ],
  "jobTitles": ["<job-title-uuid>"]
}
```

### Batch

```json
POST /api/questions/batch
[
  { "category": "...", "question": "...", "difficultyLabel": "easy", "type": "multiple-choice",
    "points": 1, "createdBy": "<user-id>",
    "choices": [ ... ], "jobTitles": [ "<uuid>" ] },
  { ... }
]
```

## Permissions recap

- **Single** (`createQuestion`): manual `checkPermission` scoped to `jobTitles[0]` only.
- **Batch** (`createQuestionInBatch`): generic `hasPermission` middleware (resource `QUESTION`, permission `CREATE`) — no per-job-title scope check.
- **Excel upload**: per-row permission check for every job title, plus resolves creator by email and job titles by name.
