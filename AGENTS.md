# API Routes Overview

This document describes the API routes available in the "examination-platform-api" project. The API is built using Hono and follows a modular structure, with a main router (`AppRouter`) handling top-level API paths and delegating to sub-routers for specific resources.

All API routes are prefixed with `/api`.

## Core System Routes (Defined in `src/index.tsx`)

These routes handle fundamental application functionalities such as authentication and system health.

*   **`POST /api/auth/*`**: Handles all authentication-related operations (e.g., registration, login, session management). This route uses the `better-auth` library.
*   **`GET /system/health`**: Returns the current system health status and authenticated user details.
*   **`GET /system/seed-all`**: Seeds the database with 100 temporary candidate users. (Note: This is likely for development/testing purposes).
*   **`GET /ws`**: Establishes a WebSocket connection. For testing WebSocket functionality, sending random data periodically.

## Main API Routes (Delegated by `AppRouter` in `src/router.ts`)

The `AppRouter` mounts various sub-routers, each responsible for a specific domain or resource within the examination platform. The following table lists the primary paths and their corresponding resource areas. To get detailed HTTP methods and specific endpoints for each resource, refer to the individual router files in `src/routes/`.

| Base Path                | Description                                        | Corresponding Router File                      |
| :----------------------- | :------------------------------------------------- | :--------------------------------------------- |
| `/api/users`             | User management and profiles.                      | `src/routes/users/index.ts`                    |
| `/api/questions`         | Management of the question bank.                   | `src/routes/questions/index.ts`                |
| `/api/job-titles`        | Management of job titles.                          | `src/routes/job-titles/index.ts`               |
| `/api/departments`       | Management of departments.                         | `src/routes/departments/index.ts`              |
| `/api/choices`           | Management of choices for questions.               | `src/routes/choices/index.ts`                  |
| `/api/exams`             | Examination creation and management.               | `src/routes/exams/index.ts`                    |
| `/api/attempts`          | Management of exam attempts.                       | `src/routes/attempts/index.ts`                 |
| `/api/grading`           | Answer capture + grading workflow (merged module; replaced former `/api/attempt-questions`). | `src/routes/grading/index.ts`                  |
| `/api/exam-monitor`      | Live proctor view of all candidates' progress, score, and per-question timing in one exam. | `src/routes/exam-monitor/index.ts`             |
| `/api/analytics`         | Reporting and analytics data.                      | `src/routes/analytics/index.ts`                |
| `/api/audit-logs`        | System audit trails and logs.                      | `src/routes/audit-logs/index.ts`               |
| `/api/permission-policies`| Management of user permissions and policies.       | `src/routes/permission-policies/index.ts`      |
| `/api/exam-questions`    | Association of questions with exams.               | `src/routes/exam-questions/index.ts`           |
| `/api/exam-candidates`   | Management of candidates assigned to exams.        | `src/routes/exam-candidates/index.ts`          |
| `/api/exam-attempts`     | Comprehensive exam attempt details.                | `src/routes/exam-attempts/index.ts`            |
| `/api/question-jobtitles`| Association of questions with job titles.          | `src/routes/question-jobtitles/index.ts`       |
| `/api/exam-job-titles`   | Association of exams with job titles.              | `src/routes/exam-job-titles/index.ts`          |

## Compatibility / Test Helper Routes (Defined in `src/router.ts`)

These routes provide utility or testing functionalities.

*   **`GET /api/generate-questions`**: Generates a specified number of dummy questions. (e.g., `GET /api/generate-questions?count=200`).
*   **`POST /api/question-exists`**: Checks if questions exist for a given `jobId`, `difficultyLabel`, and `total` count.
    *   **Request Body**:
        ```json
        {
          "jobId": "string (uuid)",
          "difficultyLabel": "string (easy | medium | hard)",
          "total": "number"
        }
        ```
*   **`POST /api/distribution`**: Calculates the distribution of questions by difficulty and job title based on exam creation schema.
    *   **Request Body**: (Refer to `src/routes/exams/schema.ts` for `CreateExamSchema` details)
        ```json
        {
          "examName": "string",
          "examCode": "string",
          "timeLimit": "number",
          "passMark": "number",
          "examType": "string",
          "status": "string",
          "description": "string",
          "jobTitles": [
            {
              "id": "string (uuid)",
              "weight": "number"
            }
          ],
          "difficulty": {
            "easy": "number",
            "medium": "number",
            "hard": "number"
          }
        }
        ```
