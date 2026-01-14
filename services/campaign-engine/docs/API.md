# Campaign Engine API Documentation

Complete API reference for the Campaign Engine service.

## Base URL

```
http://localhost:8020/api
```

## Authentication

Currently, the API does not require authentication for local development. In production, implement:

- API key authentication via `X-API-Key` header
- OAuth 2.0 for user-specific operations
- JWT tokens for session management

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "campaign": { },
  "execution": { },
  "stats": { }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## Campaigns

### Create Campaign

Create a new campaign with steps and scheduling.

**Endpoint**: `POST /api/campaigns`

**Request Body**:
```json
{
  "id": "campaign_day_1_5",
  "name": "Day 1-5 Campaign",
  "description": "Initial contact campaign",
  "timezone": "America/Los_Angeles",
  "version": "1.0",
  "status": "draft",
  "steps": [
    {
      "day": 1,
      "channel": "sms",
      "label": "sms1",
      "offset_minutes": 0,
      "raw_time": "instant",
      "body": "Thank you for your inquiry!",
      "subject": null
    },
    {
      "day": 1,
      "channel": "email",
      "label": "email1",
      "offset_minutes": 30,
      "raw_time": "30 mins",
      "body": "Email body content",
      "subject": "Welcome to our service"
    }
  ],
  "metadata": {
    "source": "manual",
    "createdBy": "admin"
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_day_1_5",
    "name": "Day 1-5 Campaign",
    "status": "draft",
    "steps": [...],
    "createdAt": "2026-01-04T18:00:00.000Z",
    "updatedAt": "2026-01-04T18:00:00.000Z"
  }
}
```

### Parse Campaign from DOCX

Parse a DOCX file and create a campaign.

**Endpoint**: `POST /api/campaigns/parse`

**Request Body**:
```json
{
  "filePath": "/path/to/Campaign Day 1 to 5.docx"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_day_1_to_5",
    "name": "Campaign Day 1 to 5",
    "steps": [...],
    "metadata": {
      "source": "/path/to/Campaign Day 1 to 5.docx",
      "parsedAt": "2026-01-04T18:00:00.000Z"
    }
  }
}
```

### Get Campaign

Retrieve a specific campaign by ID.

**Endpoint**: `GET /api/campaigns/:id`

**Response**: `200 OK`
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_day_1_5",
    "name": "Day 1-5 Campaign",
    "steps": [...]
  }
}
```

### List Campaigns

List all campaigns with optional filtering.

**Endpoint**: `GET /api/campaigns`

**Query Parameters**:
- `status` (optional): Filter by status (`draft`, `active`, `paused`, `completed`)

**Response**: `200 OK`
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "campaign_day_1_5",
      "name": "Day 1-5 Campaign",
      "status": "active"
    }
  ],
  "total": 1
}
```

### Update Campaign

Update an existing campaign.

**Endpoint**: `PUT /api/campaigns/:id`

**Request Body**:
```json
{
  "name": "Updated Campaign Name",
  "status": "active",
  "steps": [...]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_day_1_5",
    "name": "Updated Campaign Name",
    "status": "active"
  }
}
```

### Get Campaign Statistics

Get execution statistics for a campaign.

**Endpoint**: `GET /api/campaigns/:id/stats`

**Response**: `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalExecutions": 10,
    "active": 5,
    "paused": 1,
    "completed": 3,
    "failed": 1,
    "averageProgress": 65,
    "totalSteps": 100,
    "completedSteps": 65
  }
}
```

## Executions

### Start Campaign Execution

Start a campaign for a specific contact.

**Endpoint**: `POST /api/campaigns/:id/execute`

**Request Body**:
```json
{
  "contact": {
    "id": "contact_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+12345678900",
    "leadId": "lead_456",
    "assignedLO": "Jane Smith"
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "execution": {
    "id": "exec_abc123",
    "campaignId": "campaign_day_1_5",
    "contactId": "contact_123",
    "leadId": "lead_456",
    "status": "active",
    "currentStep": 0,
    "progress": 0,
    "startedAt": "2026-01-04T18:00:00.000Z",
    "steps": [
      {
        "stepId": "campaign_day_1_5_step_0",
        "day": 1,
        "channel": "sms",
        "status": "scheduled",
        "scheduledFor": "2026-01-04T18:00:00.000Z"
      }
    ]
  }
}
```

### Get Execution Status

Get the current status of a campaign execution.

**Endpoint**: `GET /api/executions/:id`

**Response**: `200 OK`
```json
{
  "success": true,
  "execution": {
    "id": "exec_abc123",
    "campaignId": "campaign_day_1_5",
    "contactId": "contact_123",
    "status": "active",
    "progress": 35,
    "steps": [
      {
        "stepId": "step_0",
        "status": "delivered",
        "sentAt": "2026-01-04T18:00:00.000Z",
        "deliveredAt": "2026-01-04T18:00:05.000Z",
        "messageId": "msg_123"
      }
    ]
  },
  "scheduledJobs": [
    {
      "stepId": "step_1",
      "scheduledFor": "2026-01-04T18:30:00.000Z",
      "isPending": true
    }
  ]
}
```

### List Executions

List executions with optional filtering.

**Endpoint**: `GET /api/executions`

**Query Parameters**:
- `campaignId` (optional): Filter by campaign ID
- `contactId` (optional): Filter by contact ID
- `status` (optional): Filter by status (`pending`, `active`, `paused`, `completed`, `failed`)

**Response**: `200 OK`
```json
{
  "success": true,
  "executions": [
    {
      "id": "exec_abc123",
      "campaignId": "campaign_day_1_5",
      "contactId": "contact_123",
      "status": "active",
      "progress": 35
    }
  ],
  "total": 1
}
```

### Pause Execution

Pause an active campaign execution.

**Endpoint**: `POST /api/executions/:id/pause`

**Response**: `200 OK`
```json
{
  "success": true,
  "execution": {
    "id": "exec_abc123",
    "status": "paused",
    "pausedAt": "2026-01-04T18:05:00.000Z"
  }
}
```

### Resume Execution

Resume a paused campaign execution.

**Endpoint**: `POST /api/executions/:id/resume`

**Response**: `200 OK`
```json
{
  "success": true,
  "execution": {
    "id": "exec_abc123",
    "status": "active",
    "pausedAt": null
  }
}
```

### Stop Execution

Stop a campaign execution permanently.

**Endpoint**: `POST /api/executions/:id/stop`

**Response**: `200 OK`
```json
{
  "success": true,
  "execution": {
    "id": "exec_abc123",
    "status": "completed",
    "completedAt": "2026-01-04T18:10:00.000Z"
  }
}
```

## Health Check

### Get Service Health

Check if the service is healthy.

**Endpoint**: `GET /api/health`

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "campaign-engine",
  "timestamp": "2026-01-04T18:00:00.000Z"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, guardrail violation) |
| 404 | Not Found (campaign or execution not found) |
| 500 | Internal Server Error |

## Rate Limiting

In production, implement rate limiting:

- 100 requests per minute per IP
- 1000 requests per hour per API key

## Webhooks

The service can send webhooks for campaign events:

### Webhook Events

- `execution.started`
- `execution.paused`
- `execution.resumed`
- `execution.completed`
- `execution.failed`
- `step.scheduled`
- `step.sent`
- `step.delivered`
- `step.failed`

### Webhook Payload

```json
{
  "event": "step.delivered",
  "timestamp": "2026-01-04T18:00:00.000Z",
  "data": {
    "executionId": "exec_abc123",
    "campaignId": "campaign_day_1_5",
    "stepId": "step_0",
    "messageId": "msg_123"
  }
}
```

## Examples

### Example 1: Create and Execute Campaign

```bash
# 1. Create campaign
curl -X POST http://localhost:8020/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "id": "welcome_campaign",
    "name": "Welcome Campaign",
    "steps": [
      {
        "day": 1,
        "channel": "sms",
        "offset_minutes": 0,
        "body": "Welcome! We are here to help."
      }
    ]
  }'

# 2. Start execution
curl -X POST http://localhost:8020/api/campaigns/welcome_campaign/execute \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "id": "contact_123",
      "firstName": "John",
      "email": "john@example.com",
      "phone": "+12345678900"
    }
  }'

# 3. Check status
curl http://localhost:8020/api/executions/exec_abc123
```

### Example 2: Parse DOCX and Execute

```bash
# Parse DOCX
curl -X POST http://localhost:8020/api/campaigns/parse \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/app/data/Campaign Day 1 to 5.docx"
  }'

# Execute parsed campaign
curl -X POST http://localhost:8020/api/campaigns/campaign_day_1_to_5/execute \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "id": "contact_456",
      "firstName": "Jane",
      "email": "jane@example.com"
    }
  }'
```
