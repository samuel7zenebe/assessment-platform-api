# Authentication API Documentation

All authentication endpoints are handled by the **Better Auth** package and are prefixed with `/api/auth`.

## Common Response Formats

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

## Sign Up

Create a new user account.

**Method:** `POST`  
**Endpoint:** `/api/auth/sign-up`

### Request Body
| Field   | Type   | Required | Description                  |
|---------|--------|----------|------------------------------|
| email   | string | Yes      | User's email address         |
| password| string | Yes      | User's password (min 8 chars)|
| name    | string | Yes      | User's full name             |
| role    | string | No       | User role (CANDIDATE, ADMIN, BUILDER). Defaults to CANDIDATE if not provided. |

### Request Example
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "name": "John Doe",
  "role": "ADMIN"
}
```

### Success Response
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "ADMIN",
      "createdAt": "2026-06-02T08:25:56.000Z",
      "updatedAt": "2026-06-02T08:25:56.000Z"
    },
    "session": {
      "id": "session-uuid",
      "token": "jwt-token-string",
      "expiresAt": "2026-06-03T08:25:56.000Z"
    }
  },
  "success": true
}
```

### Error Responses
- **400 Bad Request**: Invalid email format, password too short, or missing required fields.
- **409 Conflict**: User with this email already exists.
- **500 Internal Server Error**: Unexpected server error.

---

## Sign In

Authenticate a user and create a session.

**Method:** `POST`  
**Endpoint:** `/api/auth/sign-in`

### Request Body
| Field   | Type   | Required | Description         |
|---------|--------|----------|---------------------|
| email   | string | Yes      | User's email        |
| password| string | Yes      | User's password     |

### Request Example
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!"
}
```

### Success Response
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "ADMIN",
      "createdAt": "2026-06-02T08:25:56.000Z",
      "updatedAt": "2026-06-02T08:25:56.000Z"
    },
    "session": {
      "id": "session-uuid",
      "token": "jwt-token-string",
      "expiresAt": "2026-06-03T08:25:56.000Z"
    }
  },
  "success": true
}
```

### Error Responses
- **400 Bad Request**: Missing email or password.
- **401 Unauthorized**: Invalid email or password.
- **500 Internal Server Error**: Unexpected server error.

---

## Sign Out

Invalidate the current user session.

**Method:** `POST`  
**Endpoint:** `/api/auth/sign-out`

### Request Body
*No request body required.*

### Success Response
```json
{
  "data": null,
  "success": true
}
```

### Error Responses
- **401 Unauthorized**: No active session.
- **500 Internal Server Error**: Unexpected server error.

---

## Forgot Password

Initiate a password reset process by sending a reset link to the user's email.

**Method:** `POST`  
**Endpoint:** `/api/auth/forgot-password`

### Request Body
| Field | Type   | Required | Description         |
|-------|--------|----------|---------------------|
| email | string | Yes      | User's email        |

### Request Example
```json
{
  "email": "john.doe@example.com"
}
```

### Success Response
```json
{
  "data": {
    "message": "If an account exists with that email, a password reset link has been sent."
  },
  "success": true
}
```

### Error Responses
- **400 Bad Request**: Missing email or invalid email format.
- **500 Internal Server Error**: Unexpected server error.

> **Note**: For security reasons, the API returns the same message whether the email exists or not.

---

## Reset Password

Complete the password reset process using a token received via email.

**Method:** `POST`  
**Endpoint:** `/api/auth/reset-password`

### Request Body
| Field         | Type   | Required | Description                               |
|---------------|--------|----------|-------------------------------------------|
| token         | string | Yes      | Reset token sent to user's email          |
| password      | string | Yes      | New password (min 8 characters)           |
| confirmPassword| string | Yes      | Must match the new password field         |

### Request Example
```json
{
  "token": "reset-token-abc123",
  "password": "newSecurePassword456!",
  "confirmPassword": "newSecurePassword456!"
}
```

### Success Response
```json
{
  "data": {
    "message": "Password has been reset successfully. You can now sign in with your new password."
  },
  "success": true
}
```

### Error Responses
- **400 Bad Request**: Missing fields, passwords don't match, or password too short.
- **401 Unauthorized**: Invalid or expired reset token.
- **500 Internal Server Error**: Unexpected server error.

---

## Get Session

Retrieve the current user's session information.

**Method:** `GET`  
**Endpoint:** `/api/auth/session`

### Request Headers
| Header     | Type   | Required | Description                     |
|------------|--------|----------|---------------------------------|
| Authorization | string | Yes      | Bearer token from sign-in       |

### Success Response
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "ADMIN",
      "createdAt": "2026-06-02T08:25:56.000Z",
      "updatedAt": "2026-06-02T08:25:56.000Z"
    },
    "session": {
      "id": "session-uuid",
      "token": "jwt-token-string",
      "expiresAt": "2026-06-03T08:25:56.000Z"
    }
  },
  "success": true
}
```

### Error Responses
- **401 Unauthorized**: Invalid or expired token.
- **500 Internal Server Error**: Unexpected server error.
