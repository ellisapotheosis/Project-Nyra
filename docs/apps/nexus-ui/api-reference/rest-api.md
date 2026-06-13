# REST API Reference

**Version:** 1.0.0
**Base URL:** `https://api.project-nyra.io/v1`
**Last Updated:** 2026-01-09

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Pagination](#pagination)
5. [API Endpoints](#api-endpoints)
   - [Users API](#users-api)
   - [Applications API](#applications-api)
   - [Documents API](#documents-api)
   - [Tasks API](#tasks-api)
   - [Agents API](#agents-api)
   - [Analytics API](#analytics-api)

## Authentication

### Bearer Token Authentication

All API requests must include a valid JWT token in the Authorization header.

```http
GET /api/v1/users HTTP/1.1
Host: api.project-nyra.io
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining an Access Token

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

**Response:**

```json
{
  "access_token": "<ACCESS_TOKEN>",
  "refresh_token": "<REFRESH_TOKEN>",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Refreshing Tokens

**Endpoint:** `POST /auth/refresh`

**Request:**

```json
{
  "refresh_token": "<REFRESH_TOKEN>"
}
```

**Response:**

```json
{
  "access_token": "<ACCESS_TOKEN>",
  "expires_in": 3600
}
```

## Rate Limiting

**Limits:**

- Authenticated requests: 1000 requests/hour
- Unauthenticated requests: 100 requests/hour
- Burst limit: 50 requests/minute

**Headers:**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

**Rate Limit Exceeded Response:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "req_123456789"
  }
}
```

### HTTP Status Codes

| Code | Description           | Usage                              |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH request |
| 201  | Created               | Successful POST request            |
| 204  | No Content            | Successful DELETE request          |
| 400  | Bad Request           | Invalid request parameters         |
| 401  | Unauthorized          | Missing or invalid authentication  |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource not found                 |
| 409  | Conflict              | Resource already exists            |
| 422  | Unprocessable Entity  | Validation errors                  |
| 429  | Too Many Requests     | Rate limit exceeded                |
| 500  | Internal Server Error | Server-side error                  |
| 503  | Service Unavailable   | Temporary service unavailability   |

### Common Error Codes

| Code                      | Description                  |
| ------------------------- | ---------------------------- |
| `INVALID_REQUEST`         | Request validation failed    |
| `AUTHENTICATION_REQUIRED` | No authentication provided   |
| `INVALID_TOKEN`           | Invalid or expired token     |
| `PERMISSION_DENIED`       | Insufficient permissions     |
| `RESOURCE_NOT_FOUND`      | Requested resource not found |
| `RESOURCE_ALREADY_EXISTS` | Duplicate resource           |
| `RATE_LIMIT_EXCEEDED`     | Too many requests            |
| `INTERNAL_ERROR`          | Server-side error            |

## Pagination

### Cursor-Based Pagination

**Request:**

```http
GET /api/v1/applications?limit=20&cursor=eyJpZCI6IjEyMyJ9
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6IjE0MyJ9",
    "prev_cursor": "eyJpZCI6IjEwMyJ9"
  }
}
```

### Page-Based Pagination

**Request:**

```http
GET /api/v1/users?page=2&per_page=25
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "current_page": 2,
    "per_page": 25,
    "total_pages": 10,
    "total_items": 250
  }
}
```

## API Endpoints

## Users API

### List Users

Get a paginated list of users.

**Endpoint:** `GET /users`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| per_page | integer | No | Items per page (default: 25, max: 100) |
| role | string | No | Filter by role (admin, user, agent) |
| search | string | No | Search by name or email |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 25,
    "total_pages": 4,
    "total_items": 100
  }
}
```

### Get User by ID

**Endpoint:** `GET /users/:id`

**Response:** `200 OK`

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "profile": {
    "phone": "+1234567890",
    "company": "Acme Corp",
    "timezone": "America/New_York"
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-09T00:00:00Z"
}
```

### Create User

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "secure-password-here",
  "role": "user"
}
```

**Response:** `201 Created`

```json
{
  "id": "usr_xyz789",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "user",
  "created_at": "2026-01-09T00:00:00Z"
}
```

### Update User

**Endpoint:** `PATCH /users/:id`

**Request Body:**

```json
{
  "name": "Jane Doe",
  "profile": {
    "phone": "+1987654321"
  }
}
```

**Response:** `200 OK`

### Delete User

**Endpoint:** `DELETE /users/:id`

**Response:** `204 No Content`

## Applications API

### List Applications

**Endpoint:** `GET /applications`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (draft, submitted, processing, approved, rejected) |
| user_id | string | No | Filter by user ID |
| from_date | string | No | Filter from date (ISO 8601) |
| to_date | string | No | Filter to date (ISO 8601) |
| limit | integer | No | Results per page (default: 20, max: 100) |
| cursor | string | No | Pagination cursor |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "app_123456",
      "user_id": "usr_abc123",
      "status": "processing",
      "type": "mortgage",
      "amount": 500000,
      "property_address": "123 Main St, City, State 12345",
      "created_at": "2026-01-05T00:00:00Z",
      "updated_at": "2026-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6ImFwcF8xMjM0NTcifQ=="
  }
}
```

### Get Application by ID

**Endpoint:** `GET /applications/:id`

**Response:** `200 OK`

```json
{
  "id": "app_123456",
  "user_id": "usr_abc123",
  "status": "processing",
  "type": "mortgage",
  "data": {
    "amount": 500000,
    "property_address": "123 Main St, City, State 12345",
    "property_value": 600000,
    "down_payment": 100000,
    "loan_term": 30,
    "interest_rate": 3.5,
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "ssn_last_4": "1234",
      "annual_income": 120000,
      "employment_status": "employed"
    }
  },
  "documents": [
    {
      "id": "doc_789",
      "type": "pay_stub",
      "status": "verified",
      "url": "https://storage.example.com/doc_789.pdf"
    }
  ],
  "created_at": "2026-01-05T00:00:00Z",
  "updated_at": "2026-01-09T00:00:00Z"
}
```

### Create Application

**Endpoint:** `POST /applications`

**Request Body:**

```json
{
  "type": "mortgage",
  "data": {
    "amount": 500000,
    "property_address": "123 Main St, City, State 12345",
    "property_value": 600000,
    "down_payment": 100000,
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com",
      "annual_income": 120000
    }
  }
}
```

**Response:** `201 Created`

### Update Application

**Endpoint:** `PATCH /applications/:id`

**Request Body:**

```json
{
  "status": "submitted",
  "data": {
    "down_payment": 120000
  }
}
```

**Response:** `200 OK`

### Delete Application

**Endpoint:** `DELETE /applications/:id`

**Response:** `204 No Content`

## Documents API

### Upload Document

**Endpoint:** `POST /documents`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file`: File to upload (max 10MB)
- `application_id`: Associated application ID
- `type`: Document type (pay_stub, tax_return, bank_statement, etc.)
- `metadata`: JSON string with additional metadata

**Response:** `201 Created`

```json
{
  "id": "doc_abc123",
  "application_id": "app_123456",
  "type": "pay_stub",
  "filename": "paystub_2026_01.pdf",
  "size": 1024567,
  "mime_type": "application/pdf",
  "storage_url": "https://storage.example.com/doc_abc123.pdf",
  "status": "processing",
  "created_at": "2026-01-09T00:00:00Z"
}
```

### Get Document

**Endpoint:** `GET /documents/:id`

**Response:** `200 OK`

```json
{
  "id": "doc_abc123",
  "application_id": "app_123456",
  "type": "pay_stub",
  "filename": "paystub_2026_01.pdf",
  "size": 1024567,
  "mime_type": "application/pdf",
  "storage_url": "https://storage.example.com/doc_abc123.pdf",
  "status": "verified",
  "metadata": {
    "extracted_data": {
      "employer": "Acme Corp",
      "gross_pay": 8333.33,
      "pay_period": "2026-01"
    }
  },
  "created_at": "2026-01-09T00:00:00Z",
  "processed_at": "2026-01-09T00:05:00Z"
}
```

### List Documents

**Endpoint:** `GET /documents`

**Query Parameters:**

- `application_id`: Filter by application
- `type`: Filter by document type
- `status`: Filter by status (processing, verified, rejected)

**Response:** `200 OK`

### Delete Document

**Endpoint:** `DELETE /documents/:id`

**Response:** `204 No Content`

## Tasks API

### List Tasks

**Endpoint:** `GET /tasks`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, in_progress, completed, failed) |
| agent_id | string | Filter by agent ID |
| type | string | Filter by task type |
| limit | integer | Results per page |
| cursor | string | Pagination cursor |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "task_xyz789",
      "type": "document_processing",
      "agent_id": "agent_abc123",
      "status": "completed",
      "input": {
        "document_id": "doc_abc123"
      },
      "output": {
        "extracted_data": {...},
        "confidence": 0.95
      },
      "created_at": "2026-01-09T00:00:00Z",
      "completed_at": "2026-01-09T00:05:00Z"
    }
  ],
  "pagination": {
    "has_more": false,
    "next_cursor": null
  }
}
```

### Get Task by ID

**Endpoint:** `GET /tasks/:id`

**Response:** `200 OK`

### Create Task

**Endpoint:** `POST /tasks`

**Request Body:**

```json
{
  "type": "document_processing",
  "agent_id": "agent_abc123",
  "input": {
    "document_id": "doc_abc123",
    "priority": "high"
  }
}
```

**Response:** `201 Created`

### Cancel Task

**Endpoint:** `POST /tasks/:id/cancel`

**Response:** `200 OK`

## Agents API

### List Agents

**Endpoint:** `GET /agents`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "agent_abc123",
      "type": "coder",
      "status": "active",
      "capabilities": ["code-analysis", "implementation", "testing"],
      "current_tasks": 2,
      "max_tasks": 5,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Get Agent Status

**Endpoint:** `GET /agents/:id`

**Response:** `200 OK`

```json
{
  "id": "agent_abc123",
  "type": "coder",
  "status": "active",
  "capabilities": ["code-analysis", "implementation", "testing"],
  "current_tasks": 2,
  "max_tasks": 5,
  "metrics": {
    "tasks_completed": 150,
    "average_completion_time": 45.5,
    "success_rate": 0.98
  },
  "created_at": "2026-01-01T00:00:00Z",
  "last_active": "2026-01-09T00:00:00Z"
}
```

### Spawn Agent

**Endpoint:** `POST /agents`

**Request Body:**

```json
{
  "type": "researcher",
  "capabilities": ["research", "analysis"],
  "config": {
    "max_tasks": 3
  }
}
```

**Response:** `201 Created`

### Terminate Agent

**Endpoint:** `DELETE /agents/:id`

**Response:** `204 No Content`

## Analytics API

### Get Dashboard Metrics

**Endpoint:** `GET /analytics/dashboard`

**Response:** `200 OK`

```json
{
  "applications": {
    "total": 1250,
    "pending": 150,
    "processing": 75,
    "approved": 950,
    "rejected": 75
  },
  "documents": {
    "total": 5000,
    "processing": 200,
    "verified": 4500,
    "rejected": 300
  },
  "agents": {
    "active": 25,
    "idle": 10,
    "total_tasks": 15000,
    "average_response_time": 45.5
  },
  "performance": {
    "api_response_time_p95": 150,
    "throughput": 1200,
    "error_rate": 0.005
  }
}
```

### Get Time-Series Metrics

**Endpoint:** `GET /analytics/metrics`

**Query Parameters:**

- `metric`: Metric name (requests, latency, errors)
- `from`: Start timestamp (ISO 8601)
- `to`: End timestamp (ISO 8601)
- `interval`: Aggregation interval (1m, 5m, 1h, 1d)

**Response:** `200 OK`

```json
{
  "metric": "requests",
  "interval": "1h",
  "data": [
    {
      "timestamp": "2026-01-09T00:00:00Z",
      "value": 1250
    },
    {
      "timestamp": "2026-01-09T01:00:00Z",
      "value": 1320
    }
  ]
}
```

## Webhooks

### Register Webhook

**Endpoint:** `POST /webhooks`

**Request Body:**

```json
{
  "url": "https://your-app.com/webhook",
  "events": [
    "application.created",
    "application.updated",
    "document.processed"
  ],
  "secret": "your-webhook-secret"
}
```

**Response:** `201 Created`

### Webhook Event Format

```json
{
  "id": "evt_abc123",
  "type": "application.updated",
  "data": {
    "application_id": "app_123456",
    "previous_status": "processing",
    "current_status": "approved"
  },
  "created_at": "2026-01-09T00:00:00Z"
}
```

## Additional Resources

- [OpenAPI Specification](./openapi.yaml) - Complete OpenAPI 3.0 spec
- [Postman Collection](./postman-collection.json) - Import into Postman
- [GraphQL API](./graphql-schema.md) - GraphQL alternative
- [MCP Server APIs](./mcp-servers.md) - Agent orchestration APIs

---

**API Version:** 1.0.0
**Documentation Version:** 1.0.0
**Last Updated:** 2026-01-09
