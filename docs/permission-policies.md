# Permission Policies API Documentation

## Route Overview

The `/api/permission-policies` route provides granular access control management for resources within the Employee Recruitment platform. Policies define what actions (`VIEW`, `CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, `ASSIGN`) users can perform on resources (`QUESTION`, `EXAM`, `CANDIDATE`) within specific scopes (`JOB_TITLE`, `DEPARTMENT`, `FACTORY`).

**Base URL:** `/api/permission-policies`

**Authentication:** Bearer Token (Session-based authentication via better-auth)

**Required Role:** `ADMIN` for all endpoints except `/permission-policies/check`

---

## Enums

### Resource Type

| Value | Description |
|-------|-------------|
| `QUESTION` | Question bank resources |
| `EXAM` | Exam resources |
| `CANDIDATE` | Candidate resources |

### Actions

| Value | Description |
|-------|-------------|
| `VIEW` | View/read resource |
| `CREATE` | Create new resource |
| `UPDATE` | Modify existing resource |
| `DELETE` | Remove resource |
| `PUBLISH` | Publish exam |
| `ASSIGN` | Assign candidates |

### Scope

| Value | Description |
|-------|-------------|
| `JOB_TITLE` | Policy applies to a specific job title |
| `DEPARTMENT` | Policy applies to a specific department |
| `FACTORY` | Policy applies to an entire factory |

---

## Endpoints

### GET /api/permission-policies

Retrieve a list of all permission policies with optional filters.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | No | Filter by user ID |
| resource | `QUESTION` \| `EXAM` \| `CANDIDATE` | No | Filter by resource type |
| scope | `JOB_TITLE` \| `DEPARTMENT` \| `FACTORY` | No | Filter by scope |
| scopeId | string (UUID) | No | Filter by scope ID |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "user-123",
      "resource": "EXAM",
      "actions": ["VIEW", "CREATE", "UPDATE", "DELETE"],
      "scope": "JOB_TITLE",
      "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
      "grantedBy": "admin-user-id",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "notes": "Promotion period access"
    }
  ],
  "success": true,
  "total": 1
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier for the permission policy |
| userId | string | User ID the policy applies to |
| resource | string | Resource type (`QUESTION`, `EXAM`, `CANDIDATE`) |
| actions | string[] | Array of permitted actions |
| scope | string | Policy scope (`JOB_TITLE`, `DEPARTMENT`, `FACTORY`) |
| scopeId | string (UUID) | ID of the scoped entity |
| grantedBy | string \| null | User ID who granted the policy |
| expiresAt | string (ISO date) \| null | Policy expiration date (null = no expiry) |
| notes | string \| null | Additional notes (max 1000 characters) |

#### Error Responses

| Status | Error Body |
|--------|------------|
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can list permission policies" }` |
| 500 | `{ "success": false, "message": "Failed to list permission policies" }` |

---

### POST /api/permission-policies

Create a new permission policy.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| userId | string | Yes | Non-empty string |
| resource | `QUESTION` \| `EXAM` \| `CANDIDATE` | Yes | Enum value |
| actions | string[] | Yes | Array of action strings, min length 1 |
| scope | `JOB_TITLE` \| `DEPARTMENT` \| `FACTORY` | Yes | Enum value |
| scopeId | string (UUID) | Yes | Valid UUID |
| grantedBy | string | No | User ID of granter |
| expiresAt | string (ISO date) | No | Valid ISO date string |
| notes | string | No | Max 1000 characters |

#### Request Example

```json
{
  "userId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
  "resource": "EXAM",
  "actions": ["VIEW", "CREATE", "UPDATE"],
  "scope": "JOB_TITLE",
  "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
  "grantedBy": "admin-user-id",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "notes": "Promotion period access"
}
```

#### Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "resource": "EXAM",
    "actions": ["VIEW", "CREATE", "UPDATE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "notes": "Promotion period access"
  },
  "success": true,
  "message": "Permission policy created successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error", "error": { "field": "error description" } }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can create permission policies" }` |
| 500 | `{ "success": false, "message": "Failed to create permission policy" }` |

---

### POST /api/permission-policies/bulk-create

Create multiple permission policies in a single request.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Request Body

Array of policy objects. Each object has the same structure as `POST /permission-policies`.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| userId | string | Yes | Non-empty string |
| resource | `QUESTION` \| `EXAM` \| `CANDIDATE` | Yes | Enum value |
| actions | string[] | Yes | Array of action strings, min length 1 |
| scope | `JOB_TITLE` \| `DEPARTMENT` \| `FACTORY` | Yes | Enum value |
| scopeId | string (UUID) | Yes | Valid UUID |
| grantedBy | string | No | User ID of granter |
| expiresAt | string (ISO date) | No | Valid ISO date string |
| notes | string | No | Max 1000 characters |

#### Request Example

```json
[
  {
    "userId": "user-1",
    "resource": "EXAM",
    "actions": ["VIEW", "CREATE"],
    "scope": "JOB_TITLE",
    "scopeId": "job-title-id-1"
  },
  {
    "userId": "user-2",
    "resource": "QUESTION",
    "actions": ["VIEW", "UPDATE", "DELETE"],
    "scope": "DEPARTMENT",
    "scopeId": "dept-id-1"
  }
]
```

#### Response (201 Created)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "user-1",
      "resource": "EXAM",
      "actions": ["VIEW", "CREATE"],
      "scope": "JOB_TITLE",
      "scopeId": "job-title-id-1",
      "grantedBy": null,
      "expiresAt": null,
      "notes": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "user-2",
      "resource": "QUESTION",
      "actions": ["VIEW", "UPDATE", "DELETE"],
      "scope": "DEPARTMENT",
      "scopeId": "dept-id-1",
      "grantedBy": null,
      "expiresAt": null,
      "notes": null
    }
  ],
  "success": true,
  "message": "2 permission policies created successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error", "error": { "field": "error description" } }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can create permission policies" }` |
| 500 | `{ "success": false, "message": "Failed to create permission policies" }` |

---

### POST /api/permission-policies/check

Check whether the authenticated user has a specific permission for a resource.

**Authentication:** Required (Bearer Token)

**Required Role:** Any authenticated user

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| resource | `QUESTION` \| `EXAM` \| `CANDIDATE` | Yes | Enum value |
| action | `VIEW` \| `CREATE` \| `UPDATE` \| `DELETE` \| `PUBLISH` \| `ASSIGN` | Yes | Enum value |
| scope | `JOB_TITLE` \| `DEPARTMENT` \| `FACTORY` | No | Enum value |
| scopeId | string (UUID) | No | Valid UUID (required if scope is provided) |

#### Request Example

```json
{
  "resource": "EXAM",
  "action": "CREATE",
  "scope": "JOB_TITLE",
  "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11"
}
```

#### Response (200 OK)

```json
{
  "data": {
    "hasPermission": true
  },
  "success": true
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 500 | `{ "success": false, "message": "Failed to check permission" }` |

---

### GET /api/permission-policies/:id

Retrieve a specific permission policy by ID.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Permission policy identifier |

#### Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123",
    "resource": "EXAM",
    "actions": ["VIEW", "CREATE", "UPDATE", "DELETE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "notes": "Promotion period access"
  },
  "success": true
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Invalid UUID format" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can view permission policies" }` |
| 404 | `{ "success": false, "message": "Permission policy not found" }` |
| 500 | `{ "success": false, "message": "Failed to get permission policy" }` |

---

### PATCH /api/permission-policies/:id

Update an existing permission policy.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Permission policy identifier |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| actions | string[] | No | Array of action strings, min length 1 |
| expiresAt | string (ISO date) \| null | No | ISO date string or null to remove expiry |
| notes | string \| null | No | Max 1000 characters, null to clear |

#### Request Example

```json
{
  "actions": ["VIEW", "UPDATE"],
  "expiresAt": "2025-06-30T23:59:59.000Z",
  "notes": "Updated policy for Q3 review"
}
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123",
    "resource": "EXAM",
    "actions": ["VIEW", "UPDATE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2025-06-30T23:59:59.000Z",
    "notes": "Updated policy for Q3 review"
  },
  "success": true,
  "message": "Permission policy updated successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can update permission policies" }` |
| 404 | `{ "success": false, "message": "Permission policy not found" }` |
| 500 | `{ "success": false, "message": "Failed to update permission policy" }` |

---

### DELETE /api/permission-policies/:id

Delete a permission policy by ID.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Permission policy identifier |

#### Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123",
    "resource": "EXAM",
    "actions": ["VIEW", "UPDATE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2025-06-30T23:59:59.000Z",
    "notes": "Updated policy for Q3 review"
  },
  "success": true,
  "message": "Permission policy deleted successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Invalid UUID format" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can delete permission policies" }` |
| 404 | `{ "success": false, "message": "Permission policy not found" }` |
| 500 | `{ "success": false, "message": "Failed to delete permission policy" }` |

---

### GET /api/permission-policies/users/:userId

Retrieve all permission policies assigned to a specific user.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "user-123",
      "resource": "EXAM",
      "actions": ["VIEW", "CREATE", "UPDATE", "DELETE"],
      "scope": "JOB_TITLE",
      "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
      "grantedBy": "admin-user-id",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "notes": "Promotion period access"
    }
  ],
  "success": true,
  "total": 1
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can view user permission policies" }` |
| 500 | `{ "success": false, "message": "Failed to get user permission policies" }` |

---

### POST /api/permission-policies/users/:userId

Create a permission policy for a specific user.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| resource | `QUESTION` \| `EXAM` \| `CANDIDATE` | Yes | Enum value |
| actions | string[] | Yes | Array of action strings, min length 1 |
| scope | `JOB_TITLE` \| `DEPARTMENT` \| `FACTORY` | Yes | Enum value |
| scopeId | string (UUID) | Yes | Valid UUID |
| grantedBy | string | No | User ID of granter |
| expiresAt | string (ISO date) | No | Valid ISO date string |
| notes | string | No | Max 1000 characters |

#### Request Example

```json
{
  "resource": "QUESTION",
  "actions": ["VIEW", "CREATE", "UPDATE"],
  "scope": "JOB_TITLE",
  "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "notes": "Question bank access for project"
}
```

#### Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123",
    "resource": "QUESTION",
    "actions": ["VIEW", "CREATE", "UPDATE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "notes": "Question bank access for project"
  },
  "success": true,
  "message": "Permission policy created successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Validation error", "error": { "field": "error description" } }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can create user permission policies" }` |
| 500 | `{ "success": false, "message": "Failed to create user permission policy" }` |

---

### DELETE /api/permission-policies/users/:userId/:id

Delete a specific permission policy for a specific user.

**Authentication:** Required (Bearer Token)

**Required Role:** `ADMIN`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| id | string (UUID) | Yes | Permission policy identifier |

#### Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123",
    "resource": "EXAM",
    "actions": ["VIEW", "CREATE", "UPDATE"],
    "scope": "JOB_TITLE",
    "scopeId": "0657270a-9d0c-4d27-a0e6-210500bc5d11",
    "grantedBy": "admin-user-id",
    "expiresAt": "2025-06-30T23:59:59.000Z",
    "notes": "Updated policy for Q3 review"
  },
  "success": true,
  "message": "Permission policy deleted successfully"
}
```

#### Error Responses

| Status | Error Body |
|--------|------------|
| 400 | `{ "success": false, "message": "Invalid UUID format" }` |
| 401 | `{ "success": false, "message": "Unauthorized" }` |
| 403 | `{ "success": false, "message": "Only ADMIN users can delete user permission policies" }` |
| 404 | `{ "success": false, "message": "Permission policy not found" }` |
| 500 | `{ "success": false, "message": "Failed to delete user permission policy" }` |

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

---

## Policy Expiration

Permission policies support optional expiration via the `expiresAt` field. When checking permissions, the system automatically excludes policies where:

- `expiresAt` is in the past
- The policy has expired

Policies with `expiresAt` set to `null` have no expiration and remain active indefinitely.

---

## Action Reference

| Action | Description | Typical Use |
|--------|-------------|-------------|
| `VIEW` | View/read the resource | Read-only access to questions, exams, or candidates |
| `CREATE` | Create new resources | Create new questions or exams |
| `UPDATE` | Modify existing resources | Edit question content or exam metadata |
| `DELETE` | Remove resources | Soft-delete questions or exams |
| `PUBLISH` | Change status to published | Publish a DRAFT exam to PUBLISHED |
| `ASSIGN` | Assign candidates | Assign candidates to exams |

---

## Quick Reference

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| GET | `/api/permission-policies` | List all policies | Query: userId, resource, scope, scopeId |
| POST | `/api/permission-policies` | Create policy | Body: userId, resource, actions, scope, scopeId, ... |
| POST | `/api/permission-policies/bulk-create` | Create multiple policies | Body: array of policy objects |
| POST | `/api/permission-policies/check` | Check permission | Body: resource, action, scope, scopeId |
| GET | `/api/permission-policies/:id` | Get single policy | Path: id |
| PATCH | `/api/permission-policies/:id` | Update policy | Path: id, Body: actions, expiresAt, notes |
| DELETE | `/api/permission-policies/:id` | Delete policy | Path: id |
| GET | `/api/permission-policies/users/:userId` | List user policies | Path: userId |
| POST | `/api/permission-policies/users/:userId` | Create user policy | Path: userId, Body: resource, actions, scope, scopeId, ... |
| DELETE | `/api/permission-policies/users/:userId/:id` | Delete user policy | Path: userId, id |
