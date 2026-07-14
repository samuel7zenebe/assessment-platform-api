# Grading Module Merge & Live Exam Monitor

This document records two related backend changes in the examination platform API:

1. **Merging** the `attempt-question-answer` and `grading` route modules into a single `grading` module.
2. **Adding** the `exam-monitor` module — a live, read-only aggregation endpoint for proctors.

Both changes are additive/consolidating; no database schema migrations were required for the monitor (it reuses data already captured per attempt).

---

## Part 1 — Merging `attempt-question-answer` + `grading`

### Motivation
Answer capture (a candidate answering questions) and the grading workflow (a reviewer scoring those answers) were split across two routers mounted at `/api/attempt-questions` and `/api/grading`. This split caused duplicated logic, two parallel answer-submission paths, and inconsistent behavior.

### Result
A single module now owns both concerns, mounted at **`/api/grading`**. The old `/api/attempt-questions` router was deleted.

Files:
- `src/routes/grading/schema.ts` — unified request/param schemas.
- `src/routes/grading/grading.Repo.ts` — answer capture + grading workflow + shared `evaluateObjective()` auto-grader.
- `src/routes/grading/gradingController.ts` — handlers, with `assertAdmin` guards on all reviewer endpoints.
- `src/routes/grading/index.ts` — router, organized into three sections.

### New endpoint contract

```
Answer capture (candidate)            Grading workflow (reviewer / admin)
POST /attempt-questions/:id/answers   GET  /queue
GET  /attempt-questions/:id/answer    GET  /:attemptId            (review)
GET  /exam-attempts/:id/answers       POST /:attemptId/finalize
PATCH /answers/:answerId              GET  /answers/statistics
PATCH /answers/:answerId/grade        POST /answers/bulk-grade
```

### Improvements shipped with the merge
- **Retry bug fixed**: `submitAnswer` is now an upsert. Re-submitting an answer re-auto-grades objective questions and clears stale manual-review flags (previously returned `409`).
- **Audit trail**: manual `grade` / `bulk-grade` now set `reviewedBy` (auth user) and `reviewedAt`.
- **Consistent pass mark at finalize**: `finalizeGrading` uses `exams.passPercentage`.
- **Auto-grading** (`evaluateObjective`): CHOICE / TRUE_FALSE answers are scored immediately on submit; essay / structured answers are left for manual review.

### Contract change for the front-end
`attemptQuestionId` moved from the **request body** to the **path** (`POST /attempt-questions/:attemptQuestionId/answers`).

---

## Part 2 — Live Exam Monitor (`/api/exam-monitor`)

### Problem
An exam monitor / proctor needs a real-time view of *everything happening inside a particular exam*: each candidate's progress, live score, current question, idle time, and per-question timing ("why did question 10 take 10 minutes?"). The previous grading workflow only produced data after `finalize`.

### Key finding
All required data is **already captured**:
- `examAttempts` — candidate, status, final score.
- `attemptQuestions.viewedAt` / `answeredAt` — per-question timing (set by `POST /api/attempts/:attemptId/questions/:order/view` and on answer).
- `answers.awardedPoints` / `isCorrect` — live score (populated when the candidate submits via the auto-grading path).

Therefore the monitor is a **read-only aggregation endpoint** — no new tables or columns.

### Endpoint
```
GET /api/exam-monitor/:id
```

- **Auth**: admin / reviewer only (`assertAdmin`).
- **Query params**:
  - `status` — filter by `IN_PROGRESS | SUBMITTED | GRADED | EXPIRED`
  - `idleMinutes` — flag candidates idle longer than N minutes (IN_PROGRESS only)
  - `includeQuestions` — include the per-question timing breakdown

Files:
- `src/routes/exam-monitor/schema.ts` — `ExamMonitorQuerySchema`.
- `src/routes/exam-monitor/examMonitorRepo.ts` — `getExamMonitor(examId, filters)`.
- `src/routes/exam-monitor/examMonitorController.ts` — handler.
- `src/routes/exam-monitor/index.ts` — router.
- Mounted in `src/router.ts` via `AppRouter.route("/exam-monitor", examMonitorRouter)`.

### Response shape
```json
{
  "data": {
    "examId": "uuid",
    "examTitle": "Senior Engineer Exam",
    "generatedAt": "2026-07-10T13:20:00.000Z",
    "summary": {
      "totalCandidates": 12,
      "inProgress": 7,
      "submitted": 3,
      "graded": 1,
      "expired": 1,
      "flaggedIdle": 2
    },
    "candidates": [
      {
        "attemptId": "uuid",
        "candidateId": "user-id",
        "attemptNumber": 1,
        "status": "IN_PROGRESS",
        "startedAt": "2026-07-10T13:00:00.000Z",
        "submittedAt": null,
        "finalScore": null,
        "passed": null,
        "progress": { "answered": 8, "total": 20 },
        "liveScore": 64.5,
        "currentQuestionOrder": 9,
        "lastActivityAt": "2026-07-10T13:18:00.000Z",
        "idleMinutes": 2,
        "flaggedIdle": false,
        "questions": [
          {
            "order": 10,
            "viewedAt": "2026-07-10T13:05:00.000Z",
            "answeredAt": "2026-07-10T13:15:00.000Z",
            "durationSeconds": 600,
            "awardedPoints": "2.00",
            "isCorrect": true,
            "answered": true
          }
        ]
      }
    ]
  },
  "success": true
}
```

### How the fields are computed
- `progress.answered / total` — count of `attemptQuestions` rows with a non-null `answeredAt`.
- `liveScore` — `Σ answers.awardedPoints (answered) ÷ Σ questionBank.points × 100`.
  - **Note**: only meaningful if candidates submit answers via the auto-grading path `/api/grading/attempt-questions/:id/answers`. If the front-end uses `/api/attempts/:id/questions/:order/answer` instead, `awardedPoints` stays empty until finalize and `liveScore` reads `0`.
- `durationSeconds` per question — `answeredAt − viewedAt`.
- `idleMinutes` — `now − max(viewedAt, answeredAt)`; candidate is `flaggedIdle` when `IN_PROGRESS` and `idleMinutes ≥ idleMinutes` threshold.

### Recommended usage
Poll `GET /api/exam-monitor/:id?includeQuestions=true&idleMinutes=5` from the proctor dashboard every few seconds. A WebSocket push variant can later reuse the existing `/ws` socket if true real-time is required.

---

## Known issues (carried over, not fixed here)
1. **Pass-mark inconsistency**: `submitAttempt` and `getResult` hardcode `score >= 50`; `finalizeGrading` uses `exams.passPercentage`.
2. **Two answer-submission paths**: `/api/grading/.../answers` (auto-grades) vs `/api/attempts/.../answer` (does not). Front-end should standardize on the grading path for live scoring to work.
3. Pre-existing type error in `src/routes/questions/questionBankRepo.ts:132` (unrelated to these changes).
