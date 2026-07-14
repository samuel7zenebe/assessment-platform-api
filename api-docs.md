# Examination Platform API Documentation

## Authentication
All endpoints require authentication via **Better Auth**. The `better-auth` package handles session management automatically.

User roles:
- **CANDIDATE** - Can take exams, view own attempts, see own analytics
- **ADMIN** - Full access to all platform features including grading, audit logs, and user management
- **BUILDER** - Can create and edit questions

---

## `/api/auth/*` - Authentication Routes (Handled by Better Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up` | Create new user account |
| POST | `/api/auth/sign-in` | Login and receive session |
| POST | `/api/auth/sign-out` | Invalidate session |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Complete password reset |
| GET | `/api/auth/session` | Get current session |

---

## `/api/users` — User Management (ADMIN only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (paginated, filterable by role) |
| GET | `/api/users/:id` | Get single user profile |
| PATCH | `/api/users/:id` | Update name, role, isActive |
| DELETE | `/api/users/:id` | Soft-delete (set deletedAt) |
| POST | `/api/users/:id/ban` | Ban user with reason + optional expiry |
| POST | `/api/users/:id/unban` | Clear ban |

**CANDIDATE self-access**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get own profile |
| PATCH | `/api/users/me` | Update own profile |

---

## `/api/job-titles` — Job Title Management (ADMIN/BUILDER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/job-titles` | List all job titles (used in dropdowns) |
| POST | `/api/job-titles` | Create `{ titleName: string }` |
| PATCH | `/api/job-titles/:id` | Rename |
| DELETE | `/api/job-titles/:id` | Delete (cascades via FK) |

---

## `/api/questions` — Question Bank Management (BUILDER/ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | List with filters: type, difficulty, category, jobTitleId, isActive |
| POST | `/api/questions` | Create question + choices + jobTitleIds |
| GET | `/api/questions/:id` | Get full question with choices |
| PATCH | `/api/questions/:id` | Update question (bumps version) |
| DELETE | `/api/questions/:id` | Soft-delete |
| POST | `/api/questions/:id/duplicate` | Clone question as new version |

**Choices Management**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/:id/choices` | List choices |
| POST | `/api/questions/:id/choices` | Add a choice |
| PATCH | `/api/questions/choices/:choiceId` | Update a choice |
| DELETE | `/api/questions/choices/:choiceId` | Delete a choice |

---

## `/api/exams` — Exam Management (BUILDER/ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List (filter by status, createdBy) |
| POST | `/api/exams` | Create exam shell |
| GET | `/api/exams/:id` | Full exam + questions + jobTitles |
| PATCH | `/api/exams/:id` | Update metadata (only when DRAFT) |
| DELETE | `/api/exams/:id` | Soft-delete |

### Exam Status Lifecycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exams/:id/publish` | DRAFT → PUBLISHED |
| POST | `/api/exams/:id/activate` | PUBLISHED → ACTIVE |
| POST | `/api/exams/:id/close` | ACTIVE → CLOSED |
| POST | `/api/exams/:id/archive` | CLOSED → ARCHIVED |

### Question Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams/:id/questions` | List assigned questions |
| POST | `/api/exams/:id/questions` | Add question manually (updates order) |
| DELETE | `/api/exams/:id/questions/:questionId` | Remove question |
| PATCH | `/api/exams/:id/questions/reorder` | Reorder `{ orderedIds: uuid[] }` |

### Job Title Weights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams/:id/job-titles` | List job title weights |
| POST | `/api/exams/:id/job-titles` | Add `{ jobTitleId, weightPercentage, isPrimary }` |
| PATCH | `/api/exams/:id/job-titles/:jobTitleId` | Update weight |
| DELETE | `/api/exams/:id/job-titles/:jobTitleId` | Remove weight |

### Auto-generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exams/:id/generate-questions` | Pull from bank by mode (QUESTION_COUNT / POINT_TARGET / HYBRID) |

---

## `/api/exams/:id/candidates` — Candidate Assignment (ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams/:id/candidates` | List assigned candidates + assignmentStatus |
| POST | `/api/exams/:id/candidates` | Assign one or many `{ candidateIds: [] }` |
| DELETE | `/api/exams/:id/candidates/:candidateId` | Unassign candidate |
| PATCH | `/api/exams/:id/candidates/:candidateId` | Update assignmentStatus |

---

## `/api/attempts` — Exam Taking API (CANDIDATE/Admin)

This is the hot path — keep it fast and atomic.

### Starting an Exam

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attempts` | `{ examId }` → creates attempt + snapshots questions |

### Navigation (during exam)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attempts/:id` | Attempt state + question list (no correct answers) |
| GET | `/api/attempts/:id/questions/:order` | Get single question by order position |
| POST | `/api/attempts/:id/questions/:order/view` | Mark viewedAt timestamp |

### Answering

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attempts/:id/questions/:order/answer` | Body varies by type: |

**Answer Body Types**:
- CHOICE: `{ selectedChoiceId: uuid }`
- TRUE_FALSE: `{ booleanAnswer: boolean }`
- ESSAY: `{ answerText: string }`
- MATCH: `{ answerJson: object }`

### Submission

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attempts/:id/submit` | Lock attempt, auto-grade objective Qs, set status=SUBMITTED |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attempts/:id/results` | Score, pass/fail, per-question breakdown (only after GRADED) |

---

## `/api/grading` — Manual Grading API (ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grading/queue` | Attempts with status=SUBMITTED needing manual review |
| GET | `/api/grading/:attemptId` | Full attempt with all answers for review |
| PATCH | `/api/grading/:attemptId/answers/:answerId` | `{ isCorrect, awardedPoints, reviewerFeedback }` |
| POST | `/api/grading/:attemptId/finalize` | Set status=GRADED, compute final score, set passed flag |

---

## `/api/analytics` — Analytics API

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/exams/:id/summary` | ADMIN | Pass rate, avg score, completion rate |
| GET | `/api/analytics/exams/:id/questions` | ADMIN | Per-question: answer distribution, avg time |
| GET | `/api/analytics/candidates/:id` | ADMIN/CANDIDATE | Candidate's exam history + scores |
| GET | `/api/analytics/overview` | ADMIN | Platform-wide stats |

---

## `/api/audit-logs` — Admin Audit Log (ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | Filter by entityName, entityId, userId, date range |

---

## `/api/permission-policies` — Permission Management (ADMIN only)

Permission policies grant granular access control to resources. Policies are scoped to `JOB_TITLE`, `DEPARTMENT`, or `FACTORY`.

### Permission Policy Object

```json
{
  "id": "uuid",
  "userId": "string",
  "resource": "QUESTION" | "EXAM" | "CANDIDATE",
  "actions": ["VIEW", "CREATE", "UPDATE", "DELETE", "PUBLISH", "ASSIGN"],
  "scope": "JOB_TITLE" | "DEPARTMENT" | "FACTORY",
  "scopeId": "uuid",
  "grantedBy": "string (optional)",
  "expiresAt": "ISO date string (optional)",
  "notes": "string (optional)"
}
```

### Policy Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permission-policies` | List all policies (filter by userId, resource, scope, scopeId) |
| POST | `/api/permission-policies` | Create policy |
| POST | `/api/permission-policies/bulk-create` | Create multiple policies |
| POST | `/api/permission-policies/check` | Check if current user has permission on resource |
| GET | `/api/permission-policies/:id` | Get single policy |
| PATCH | `/api/permission-policies/:id` | Update actions, expiresAt, notes |
| DELETE | `/api/permission-policies/:id` | Delete policy |

### Create Policy Body

```json
{
  "userId": "string",
  "resource": "QUESTION" | "EXAM" | "CANDIDATE",
  "actions": ["VIEW", "CREATE", "UPDATE", "DELETE", "PUBLISH", "ASSIGN"],
  "scope": "JOB_TITLE" | "DEPARTMENT" | "FACTORY",
  "scopeId": "uuid",
  "grantedBy": "string (optional)",
  "expiresAt": "ISO date string (optional)",
  "notes": "string (optional, max 1000 chars)"
}
```

### Check Permission Body

```json
{
  "resource": "QUESTION" | "EXAM" | "CANDIDATE",
  "action": "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ASSIGN",
  "scope": "JOB_TITLE" | "DEPARTMENT" | "FACTORY (optional)",
  "scopeId": "uuid (optional)"
}
```

### User-Specific Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permission-policies/users/:userId` | List all policies for a user |
| POST | `/api/permission-policies/users/:userId` | Create policy for user |
| DELETE | `/api/permission-policies/users/:userId/:id` | Delete user policy |

---

## Response Formats

### Success Response
```json
{
  "data": { ... },
  "success": true
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  },
  "success": false
}
```

---

## Status Values

### Attempt Status
- `IN_PROGRESS` - Candidate is actively taking exam
- `SUBMITTED` - Candidate submitted, pending grading
- `GRADED` - All answers graded, results available
- `EXPIRED` - Exam expired (time limit exceeded)

### Assignment Status
- `ASSIGNED` - Candidate assigned but hasn't started
- `STARTED` - Candidate has begun the exam
- `COMPLETED` - Exam submitted or expired
- `EXPIRED` - Assignment expired

### Exam Status
- `DRAFT` - Being prepared, no candidates can start
- `PUBLISHED` - Ready for assignments
- `ACTIVE` - Exam window is open
- `CLOSED` - Exam window ended
- `ARCHIVED` - No longer accessible