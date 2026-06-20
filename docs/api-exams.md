# API Documentation: `/api/exams`

## Route Overview

The `/api/exams` route provides a complete CRUD interface for managing exams within the Employee Recruitment platform. This route supports lifecycle management (draft, publish, activate, close, archive), question management, job title associations, candidate assignments, and exam analytics.

**Base URL:** `/api/exams`

**Authentication:** Bearer Token (Session-based authentication via better-auth)

**Allowed Roles:**
| Role | Permissions |
| :--- | :--- |
| ADMIN | `create`, `read`, `update`, `delete` exams |
| BUILDER | `create`, `read`, `update` exams (no delete) |
| CANDIDATE | `read` access only |

---

## Endpoints

### GET /api/exams

Retrieve a list of all exams.

**Authentication:** Required (Bearer Token)

#### Request Parameters
No parameters required.

#### Response (200 OK)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Frontend Developer Exam",
    "description": "Assessment for frontend developer candidates",
    "estimatedTimeMinutes": 60,
    "scheduledTime": "2024-02-15T10:00:00.000Z",
    "passPercentage": 70,
    "totalQuestions": 25,
    "difficultyLevel": 2,
    "status": "ACTIVE",
    "createdBy": "user-123",
    "createdAt": "2024-01-10T08:30:00.000Z",
    "updatedAt": "2024-01-15T14:22:00.000Z",
    "deletedAt": null
  }
]
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier for the exam |
| title | string | Exam title |
| description | string \| null | Exam description |
| estimatedTimeMinutes | number | Estimated completion time in minutes |
| scheduledTime | string (ISO date) \| null | Scheduled start time |
| passPercentage | number | Minimum percentage required to pass |
| totalQuestions | number | Total number of questions in the exam |
| difficultyLevel | number | Difficulty level (integer value 1-3) |
| status | string | Exam status (DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED) |
| createdBy | string \| null | User ID of the exam creator |
| createdAt | string (ISO date) \| null | Creation timestamp |
| updatedAt | string (ISO date) \| null | Last update timestamp |
| deletedAt | string (ISO date) \| null | Soft delete timestamp |

#### Error Responses

| Status | Error Body |
|--------|------------|
| 404 | `{ "success": false, "message": "No exams found" }` |
| 500 | `{ "success": false, "message": "An error occurred while fetching the exams" }` |

---

### POST /api/exams

Create a new exam.

**Authentication:** Required (Bearer Token)

**Required Permission:** `exam:create`

#### Request Body
```json
{
  "title": "Backend Developer Exam",
  "description": "Assessment for backend developer candidates",
  "estimatedTimeMinutes": 90,
  "scheduledTime": "2024-03-01T09:00:00.000Z",
  "passPercentage": 75,
  "totalQuestions": 30,
  "difficultyLevel": 2,
  "status": "DRAFT",
  "jobTitles": [
    {
      "id": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
      "weight": 100
    }
  ]
}
```

#### Request Fields

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| title | string | Yes | - | - |
| description | string | Yes | - | - |
| estimatedTimeMinutes | number | Yes | - | - |
| scheduledTime | string | Yes | ISO date string | - |
| passPercentage | number | Yes | - | - |
| totalQuestions | number | Yes | - | - |
| difficultyLevel | number | Yes | - | - |
| status | string | No | One of: DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED | "DRAFT" |
| jobTitles | array | Yes | Array of job title objects | - |
| jobTitles[].id | string (UUID) | Yes | Valid job title UUID | - |
| jobTitles[].weight | number | No | Integer, 1-100 | 100 |

#### Response (201 Created)
```json
{
  "data": {
    "exam": "550e8400-e29b-41d4-a716-446655440001"
  },
  "success": true,
  "message": "An exam with id 550e8400-e29b-41d4-a716-446655440001 is created successfully."
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error", "error": { "field": "error description" } }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions to create a new exam..." }` |
| 500 | `{ "success": false, "message": "An error occurred while creating the exam" }` |

---

### GET /api/exams/:id

Retrieve a specific exam by ID.

**Authentication:** Required (Bearer Token)

**Required Permission:** `exam:read`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Exam identifier |

#### Response (200 OK)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Frontend Developer Exam",
    "description": "Assessment for frontend developer candidates",
    "estimatedTimeMinutes": 60,
    "scheduledTime": "2024-02-15T10:00:00.000Z",
    "passPercentage": 70,
    "totalQuestions": 25,
    "difficultyLevel": 2,
    "status": "ACTIVE",
    "createdBy": "user-123",
    "createdAt": "2024-01-10T08:30:00.000Z",
    "updatedAt": "2024-01-15T14:22:00.000Z",
    "deletedAt": null
  },
  "success": true
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Invalid UUID format" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions to view the exam..." }` |
| 404 | `{ "success": false, "message": "Exam not found" }` |
| 500 | `{ "success": false, "message": "An error occurred while fetching the exam" }` |

---

### PUT /api/exams/:id

Update an existing exam.

**Authentication:** Required (Bearer Token)

**Required Permission:** `exam:update`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Exam identifier |

#### Request Body
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Frontend Developer Exam",
  "description": "Updated assessment for frontend developer candidates",
  "estimatedTimeMinutes": 75,
  "scheduledTime": "2024-02-20T10:00:00.000Z",
  "passPercentage": 75,
  "totalQuestions": 30,
  "difficultyLevel": 3,
  "status": "PUBLISHED",
  "jobTitleIds": ["0657270a-9d0c-4d27-a0e6-210500bc5d11"]
}
```

#### Request Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string (UUID) | Yes | Valid exam UUID |
| title | string | No | - |
| description | string | No | - |
| estimatedTimeMinutes | number | No | - |
| scheduledTime | string | No | ISO date string |
| passPercentage | number | No | - |
| totalQuestions | number | No | - |
| difficultyLevel | number | No | - |
| status | string | No | One of: DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED |
| jobTitleIds | array | No | Array of job title UUIDs |

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated Frontend Developer Exam"
    }
  ],
  "success": true,
  "message": "An exam with id 550e8400-e29b-41d4-a716-446655440000 is updated successfully."
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions to make changes to the exam..." }` |
| 500 | `{ "success": false, "message": "An error occurred while updating the exam" }` |

---

### DELETE /api/exams/:id

Soft-delete an exam.

**Authentication:** Required (Bearer Token)

**Required Permission:** `exam:delete`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Exam identifier |

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "success": true,
  "message": "An exam with id 550e8400-e29b-41d4-a716-446655440000 is deleted successfully."
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions to remove the exam..." }` |
| 500 | `{ "success": false, "message": "An error occurred while deleting the exam" }` |

---

### Lifecycle Management Endpoints

#### PATCH /api/exams/:id/publish

Publish an exam (change status to PUBLISHED).

| Status | Response / Error Body |
|--------|----------------------|
| 200 | `{ "data": {...}, "success": true, "message": "Exam published successfully." }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions..." }` |
| 404 | `{ "success": false, "message": "Exam not found" }` |
| 500 | `{ "success": false, "message": "Failed to publish exam" }` |

#### PATCH /api/exams/:id/archive

Archive an exam (change status to ARCHIVED).

| Status | Response / Error Body |
|--------|----------------------|
| 200 | `{ "data": {...}, "success": true, "message": "Exam archived successfully." }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions..." }` |
| 404 | `{ "success": false, "message": "Exam not found" }` |
| 500 | `{ "success": false, "message": "Failed to archive exam" }` |

#### PATCH /api/exams/:id/activate

Activate an exam (change status to ACTIVE). Requires exam to be in PUBLISHED status.

| Status | Response / Error Body |
|--------|----------------------|
| 200 | `{ "data": {...}, "success": true, "message": "Exam activated successfully." }` |
| 403 | `{ "success": false, "message": "Access Denied: You lack the required permissions..." }` or `{ "success": false, "message": "current exam status should be published." }` |
| 404 | `{ "success": false, "message": "Exam not found" }` |
| 500 | `{ "success": false, "message": "Failed to archive exam" }` |

#### PATCH /api/exams/:id/close

Close an exam (change status to CLOSED).

| Status | Response / Error Body |
|--------|----------------------|
| 200 | `{ "data": {...}, "success": true, "message": "Exam closed successfully." }` |
| 403 | `{ "success": false, "message": "Access Denied..." }` |
| 404 | `{ "success": false, "message": "Exam not found" }` |
| 500 | `{ "success": false, "message": "Failed to close exam" }` |

---

### Exam Questions Endpoints

#### GET /api/exams/:id/questions

Retrieve all questions associated with an exam.

**Response (200 OK)**
```json
{
  "data": [
    {
      "examId": "550e8400-e29b-41d4-a716-446655440000",
      "totalQuestions": 25,
      "difficultyDistribution": {
        "easy": 10,
        "medium": 10,
        "hard": 5
      },
      "question": {
        "questionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "questionOrder": 0
      }
    }
  ],
  "success": true
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 404 | `{ "success": false, "message": "Exam questions not found" }` |
| 500 | `{ "success": false, "message": "An error occurred while fetching the exam questions" }` |

---

#### POST /api/exams/:id/questions

Add a question to an exam.

**Required Permission:** `exam:update`

#### POST /api/exams/:id/generate

Generate exam questions automatically based on difficulty and job titles.

**Request Body**
```json
{
  "totalQuestions": 20
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| totalQuestions | number | No | Positive integer |

**Response (200 OK)**
```json
{
  "data": [...],
  "success": true,
  "message": "Exam questions generated successfully (20 questions)."
}
```

---

### GET /api/exams/:id/statistics

Retrieve exam analytics and statistics.

**Response (200 OK)**
```json
{
  "data": {
    "exam": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Frontend Developer Exam",
      "status": "ACTIVE",
      "passPercentage": 70,
      "totalQuestions": 25,
      "difficultyBreakdown": {
        "easy": 10,
        "medium": 10,
        "hard": 5
      },
      "createdAt": "2024-01-10T08:30:00.000Z",
      "updatedAt": "2024-01-15T14:22:00.000Z"
    },
    "attempts": {
      "total": 50,
      "inProgress": 5,
      "submitted": 30,
      "graded": 15
    },
    "scores": {
      "avgScore": 72.5,
      "maxScore": 95,
      "minScore": 45,
      "passedCount": 38,
      "passRate": 0.76
    },
    "answers": {
      "totalAnswers": 1250,
      "correctAnswers": 980,
      "incorrectAnswers": 270
    }
  },
  "success": true
}
```

---

### Exam Job Titles Endpoints

#### GET /api/exams/:id/job-titles

Retrieve all job titles associated with an exam.

#### POST /api/exams/:id/job-titles

Associate job titles with an exam.

#### PATCH /api/exams/:id/job-titles/:jobTitlesId

Update job title weight for an exam.

#### DELETE /api/exams/:id/job-titles/:jobTitleId

Remove a job title association from an exam.

---

### Exam Candidates Endpoints (Admin Only)

#### GET /api/exams/:examId/candidates

List all candidates assigned to an exam.

**Required Permission:** `candidate:list`

#### POST /api/exams/:examId/candidates

Assign candidates to an exam.

**Request Body**
```json
{
  "candidateIds": ["user-1", "user-2", "user-3"]
}
```

**Required Permission:** `candidate:assign_exam`

#### PATCH /api/exams/:examId/:candidateId/status

Update assignment status for a candidate.

#### DELETE /api/exams/:examId/candidates/:candidateId

Unassign a candidate from an exam.

**Required Permission:** `candidate:unassign_exam`

---

## Common Response Structure

All successful responses follow this structure:
```json
{
  "data": <response_payload>,
  "success": true,
  "message": "<optional_message>"
}
```

All error responses follow this structure:
```json
{
  "success": false,
  "message": "<error_message>"
}
```