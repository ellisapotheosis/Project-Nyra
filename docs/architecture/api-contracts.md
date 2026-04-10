# API Contracts - Twenty-Bridge Service

## Overview

This document defines the complete API contracts for the Twenty-Bridge service, including REST endpoints, webhook payloads, and GraphQL queries (where applicable).

## Base URL

```
Production: https://api.nyra.example.com/bridge
Development: http://localhost:8020
```

## Authentication

All API endpoints (except webhooks) require JWT bearer token authentication.

```http
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

## REST API Endpoints

### 1. Webhook Management

#### Register Webhook

```http
POST /api/v1/webhooks/register
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "url": "https://twenty-bridge:8020/webhook/twenty",
  "events": [
    "lead.created",
    "lead.updated",
    "lead.stage_changed",
    "application.created",
    "application.updated"
  ],
  "secret": "webhook_secret_key"
}

Response: 201 Created
{
  "webhook_id": "wh_7f8a9b0c1d2e3f4a",
  "url": "https://twenty-bridge:8020/webhook/twenty",
  "events": ["lead.created", "lead.updated", ...],
  "status": "active",
  "created_at": "2026-01-04T18:00:00Z"
}

Error Responses:
400 Bad Request - Invalid webhook configuration
401 Unauthorized - Missing or invalid authentication
409 Conflict - Webhook already exists
```

#### List Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer <token>

Response: 200 OK
{
  "webhooks": [
    {
      "webhook_id": "wh_7f8a9b0c1d2e3f4a",
      "url": "https://twenty-bridge:8020/webhook/twenty",
      "events": ["lead.created", "lead.updated"],
      "status": "active",
      "last_triggered_at": "2026-01-04T17:55:00Z",
      "created_at": "2026-01-04T16:00:00Z"
    }
  ],
  "total": 1
}
```

#### Delete Webhook

```http
DELETE /api/v1/webhooks/{webhook_id}
Authorization: Bearer <token>

Response: 204 No Content

Error Responses:
404 Not Found - Webhook not found
```

### 2. Manual Synchronization

#### Trigger Lead Sync

```http
POST /api/v1/sync/lead
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "lead_id": "lead_abc123",
  "direction": "crm_to_graph",
  "force": false
}

Response: 202 Accepted
{
  "sync_job_id": "sync_xyz789",
  "status": "queued",
  "lead_id": "lead_abc123",
  "estimated_completion": "2026-01-04T18:05:00Z"
}

Error Responses:
400 Bad Request - Invalid lead_id or parameters
404 Not Found - Lead not found in CRM
```

#### Trigger Application Sync

```http
POST /api/v1/sync/application
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "application_id": "app_def456",
  "direction": "crm_to_graph",
  "force": false
}

Response: 202 Accepted
{
  "sync_job_id": "sync_abc123",
  "status": "queued",
  "application_id": "app_def456",
  "estimated_completion": "2026-01-04T18:05:00Z"
}
```

#### Trigger Batch Sync

```http
POST /api/v1/sync/batch
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "entity_type": "lead",
  "entity_ids": ["lead_1", "lead_2", "lead_3"],
  "direction": "crm_to_graph"
}

Response: 202 Accepted
{
  "batch_job_id": "batch_xyz123",
  "status": "queued",
  "total_entities": 3,
  "estimated_completion": "2026-01-04T18:10:00Z"
}
```

#### Trigger Reconciliation

```http
POST /api/v1/sync/reconcile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "entity_types": ["lead", "application"],
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-04T23:59:59Z"
}

Response: 202 Accepted
{
  "reconciliation_job_id": "recon_abc789",
  "status": "queued",
  "entity_types": ["lead", "application"],
  "date_range": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-04T23:59:59Z"
  },
  "estimated_completion": "2026-01-04T19:00:00Z"
}
```

#### Get Sync Job Status

```http
GET /api/v1/sync/jobs/{job_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "job_id": "sync_xyz789",
  "type": "lead_sync",
  "status": "completed",
  "progress": {
    "total": 1,
    "completed": 1,
    "failed": 0
  },
  "started_at": "2026-01-04T18:00:00Z",
  "completed_at": "2026-01-04T18:02:15Z",
  "results": {
    "entities_created": 2,
    "relationships_created": 5,
    "entities_updated": 0
  }
}

Possible Statuses:
- queued: Job is waiting in queue
- processing: Job is currently running
- completed: Job finished successfully
- failed: Job encountered an error
- partially_completed: Some entities synced, some failed
```

#### Get Sync Status Overview

```http
GET /api/v1/sync/status
Authorization: Bearer <token>

Response: 200 OK
{
  "sync_health": "healthy",
  "last_successful_sync": "2026-01-04T18:00:00Z",
  "entities_synced": {
    "leads": {
      "total": 1523,
      "last_24h": 47,
      "pending": 2
    },
    "applications": {
      "total": 847,
      "last_24h": 23,
      "pending": 1
    },
    "interactions": {
      "total": 12043,
      "last_24h": 234,
      "pending": 3
    }
  },
  "queue_depth": {
    "pending": 6,
    "processing": 2,
    "failed": 0
  },
  "sync_latency": {
    "p50": 1.2,
    "p95": 3.5,
    "p99": 8.7
  }
}
```

### 3. Lead Context Queries

#### Get Lead Context

```http
GET /api/v1/leads/{lead_id}/context
Authorization: Bearer <token>
Query Parameters:
  - include_history: boolean (default: true)
  - include_graph: boolean (default: true)
  - depth: integer (graph traversal depth, default: 2)

Response: 200 OK
{
  "lead": {
    "id": "lead_abc123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "stage": "Application Submitted",
    "priority": "Hot",
    "credit_score": 720,
    "annual_income": 85000,
    "lead_source": "Website",
    "created_at": "2025-12-15T10:00:00Z",
    "last_updated": "2026-01-04T16:30:00Z"
  },
  "crm_data": {
    "loan_officer": {
      "id": "lo_xyz123",
      "name": "Jane Smith"
    },
    "preferred_channel": "SMS",
    "first_time_home_buyer": true,
    "verified_identity": true
  },
  "graph_context": {
    "total_interactions": 15,
    "last_interaction": {
      "date": "2026-01-04T16:30:00Z",
      "channel": "SMS",
      "summary": "Requested update on application status"
    },
    "related_applications": [
      {
        "id": "app_previous_001",
        "type": "Previous Loan",
        "loan_type": "FHA",
        "status": "Funded",
        "closed_date": "2023-06-15T00:00:00Z"
      }
    ],
    "assigned_team": [
      {
        "user_id": "lo_xyz123",
        "name": "Jane Smith",
        "role": "Loan Officer",
        "assigned_date": "2025-12-15T10:05:00Z"
      },
      {
        "user_id": "proc_def456",
        "name": "Bob Johnson",
        "role": "Processor",
        "assigned_date": "2025-12-20T14:00:00Z"
      }
    ],
    "sentiment_analysis": {
      "current_sentiment": "positive",
      "sentiment_trend": "improving",
      "confidence": 0.87
    },
    "referral_network": {
      "referred_by": null,
      "has_referred": 2,
      "referral_value": 450000
    },
    "risk_assessment": {
      "risk_score": 0.15,
      "risk_level": "Low",
      "factors": [
        "Strong credit score",
        "Stable employment",
        "Previous successful loan"
      ]
    }
  },
  "timeline": [
    {
      "date": "2025-12-15T10:00:00Z",
      "event": "Lead Created",
      "details": "Lead entered from Website form"
    },
    {
      "date": "2025-12-15T10:05:00Z",
      "event": "Assigned to Loan Officer",
      "details": "Assigned to Jane Smith"
    },
    {
      "date": "2025-12-16T14:30:00Z",
      "event": "Credit Pull Authorized",
      "details": "Borrower authorized credit check"
    },
    {
      "date": "2025-12-20T09:00:00Z",
      "event": "Application Started",
      "details": "Borrower began formal application"
    },
    {
      "date": "2026-01-03T16:00:00Z",
      "event": "Application Submitted",
      "details": "Complete application submitted for processing"
    },
    {
      "date": "2026-01-04T16:30:00Z",
      "event": "Status Inquiry",
      "details": "Borrower asked for status update via SMS"
    }
  ]
}

Error Responses:
404 Not Found - Lead not found
```

#### Search Leads by Context

```http
POST /api/v1/leads/search
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "query": "Find leads similar to lead_abc123 based on profile and interactions",
  "filters": {
    "stage": ["Pre-Qualification", "Application Started"],
    "credit_score_min": 680,
    "loan_amount_min": 200000,
    "loan_amount_max": 500000
  },
  "limit": 20,
  "use_graph_similarity": true
}

Response: 200 OK
{
  "results": [
    {
      "lead_id": "lead_def456",
      "name": "Alice Johnson",
      "stage": "Pre-Qualification",
      "similarity_score": 0.92,
      "matching_factors": [
        "Similar credit profile",
        "Same loan amount range",
        "Same loan officer",
        "Similar interaction patterns"
      ]
    },
    {
      "lead_id": "lead_ghi789",
      "name": "Bob Williams",
      "stage": "Application Started",
      "similarity_score": 0.85,
      "matching_factors": [
        "Similar property type preference",
        "Similar income level",
        "First-time home buyer"
      ]
    }
  ],
  "total": 2,
  "query_time_ms": 145
}
```

### 4. Application Context Queries

#### Get Application Details with Context

```http
GET /api/v1/applications/{app_id}/context
Authorization: Bearer <token>

Response: 200 OK
{
  "application": {
    "id": "app_abc123",
    "loan_number": "LN-2026-00123",
    "borrower": {
      "id": "lead_def456",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "co_borrower": {
      "id": "lead_ghi789",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "loan_details": {
      "amount": 350000,
      "type": "Conventional",
      "purpose": "Purchase",
      "term": 30,
      "down_payment": 70000,
      "down_payment_percent": 20,
      "estimated_rate": 6.75
    },
    "property": {
      "address": "123 Main St, Anytown, CA 12345",
      "type": "Single Family",
      "value": 420000,
      "occupancy": "Primary Residence"
    },
    "status": {
      "stage": "Underwriting",
      "substatus": "Awaiting Appraisal",
      "priority": "Hot",
      "target_closing_date": "2026-02-15"
    },
    "team": {
      "loan_officer": {"id": "lo_123", "name": "Jane Smith"},
      "processor": {"id": "proc_456", "name": "Bob Johnson"},
      "underwriter": {"id": "uw_789", "name": "Carol Williams"}
    },
    "compliance": {
      "trilogy_sent": true,
      "trilogy_date": "2026-01-05T10:00:00Z",
      "disclosures_signed": true,
      "appraisal_ordered": true,
      "appraisal_date": "2026-01-10T00:00:00Z",
      "title_ordered": true
    }
  },
  "graph_context": {
    "borrower_history": {
      "previous_applications": 1,
      "previous_loans_funded": 1,
      "total_interactions": 28,
      "avg_response_time_hours": 4.2
    },
    "property_insights": {
      "market_trend": "Stable",
      "neighborhood_rating": "A-",
      "similar_recent_sales": 5
    },
    "risk_indicators": {
      "overall_risk": "Low",
      "factors": [
        "Strong credit profile",
        "Adequate down payment",
        "Previous successful loan",
        "Stable employment"
      ],
      "watch_items": []
    }
  },
  "milestones": [
    {
      "milestone": "Application Submitted",
      "completed": true,
      "date": "2026-01-03T16:00:00Z"
    },
    {
      "milestone": "Credit Approved",
      "completed": true,
      "date": "2026-01-05T11:30:00Z"
    },
    {
      "milestone": "Appraisal Ordered",
      "completed": true,
      "date": "2026-01-06T09:00:00Z"
    },
    {
      "milestone": "Appraisal Received",
      "completed": false,
      "expected_date": "2026-01-15T00:00:00Z"
    },
    {
      "milestone": "Clear to Close",
      "completed": false,
      "expected_date": "2026-02-08T00:00:00Z"
    },
    {
      "milestone": "Funding",
      "completed": false,
      "expected_date": "2026-02-15T00:00:00Z"
    }
  ]
}
```

### 5. Analytics & Reporting

#### Get Sync Analytics

```http
GET /api/v1/analytics/sync
Authorization: Bearer <token>
Query Parameters:
  - start_date: ISO 8601 date (default: 7 days ago)
  - end_date: ISO 8601 date (default: now)
  - granularity: hour|day|week (default: day)

Response: 200 OK
{
  "period": {
    "start": "2025-12-28T00:00:00Z",
    "end": "2026-01-04T23:59:59Z"
  },
  "metrics": {
    "total_events": 2847,
    "successful_syncs": 2831,
    "failed_syncs": 16,
    "success_rate": 0.9944,
    "avg_sync_latency_ms": 1245,
    "p95_sync_latency_ms": 3150,
    "p99_sync_latency_ms": 7890
  },
  "by_entity_type": {
    "lead": {
      "total": 1523,
      "synced": 1520,
      "failed": 3
    },
    "application": {
      "total": 847,
      "synced": 844,
      "failed": 3
    },
    "interaction": {
      "total": 477,
      "synced": 467,
      "failed": 10
    }
  },
  "timeline": [
    {
      "timestamp": "2025-12-28T00:00:00Z",
      "events": 387,
      "successful": 385,
      "failed": 2,
      "avg_latency_ms": 1180
    },
    ...
  ]
}
```

#### Get Graph Statistics

```http
GET /api/v1/analytics/graph
Authorization: Bearer <token>

Response: 200 OK
{
  "entities": {
    "total": 14234,
    "by_type": {
      "MortgageLead": 1523,
      "LoanApplication": 847,
      "CustomerInteraction": 10043,
      "LoanOfficer": 45,
      "Property": 776
    }
  },
  "relationships": {
    "total": 28567,
    "by_type": {
      "ASSIGNED_TO": 2370,
      "APPLIED_FOR": 847,
      "PARTICIPATED_IN": 10043,
      "REFERRED_BY": 234,
      "FOR_PROPERTY": 847,
      "REFINANCES": 89
    }
  },
  "graph_complexity": {
    "avg_connections_per_entity": 2.0,
    "max_connections": 234,
    "network_density": 0.045
  },
  "growth_metrics": {
    "entities_added_24h": 67,
    "relationships_added_24h": 156,
    "entities_updated_24h": 234
  }
}
```

### 6. Admin & Monitoring

#### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "service": "twenty-bridge",
  "version": "1.0.0",
  "timestamp": "2026-01-04T18:30:00Z",
  "dependencies": {
    "twentycrm": {
      "status": "healthy",
      "latency_ms": 45
    },
    "letta": {
      "status": "healthy",
      "latency_ms": 23
    },
    "postgres": {
      "status": "healthy",
      "connections": 12
    },
    "redis": {
      "status": "healthy",
      "memory_used_mb": 234
    }
  }
}
```

#### Service Metrics

```http
GET /api/v1/admin/metrics
Authorization: Bearer <token>

Response: 200 OK (Prometheus format)
# HELP twenty_bridge_events_received_total Total events received
# TYPE twenty_bridge_events_received_total counter
twenty_bridge_events_received_total{event_type="lead.created"} 523
twenty_bridge_events_received_total{event_type="lead.updated"} 1234
...

# HELP twenty_bridge_sync_latency_seconds Sync latency distribution
# TYPE twenty_bridge_sync_latency_seconds histogram
twenty_bridge_sync_latency_seconds_bucket{direction="crm_to_graph",le="1"} 1234
...
```

## Webhook Payloads

### Incoming: TwentyCRM → Twenty-Bridge

#### Lead Created Event

```json
{
  "event": "lead.created",
  "timestamp": "2026-01-04T18:00:00Z",
  "data": {
    "id": "lead_abc123",
    "object": "lead",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "stage": "Lead",
    "priority": "Warm",
    "lead_source": "Website",
    "created_at": "2026-01-04T18:00:00Z",
    "created_by": "system"
  }
}
```

#### Lead Updated Event

```json
{
  "event": "lead.updated",
  "timestamp": "2026-01-04T18:05:00Z",
  "data": {
    "id": "lead_abc123",
    "object": "lead",
    "name": "John Doe",
    "stage": "Pre-Qualification",
    "previous_stage": "Lead",
    "updated_at": "2026-01-04T18:05:00Z",
    "updated_by": "lo_xyz123",
    "changes": {
      "stage": {
        "from": "Lead",
        "to": "Pre-Qualification"
      },
      "loan_officer_id": {
        "from": null,
        "to": "lo_xyz123"
      }
    }
  }
}
```

#### Application Created Event

```json
{
  "event": "application.created",
  "timestamp": "2026-01-04T18:10:00Z",
  "data": {
    "id": "app_def456",
    "object": "mortgage_application",
    "application_id": "app_def456",
    "loan_number": "LN-2026-00124",
    "borrower_id": "lead_abc123",
    "loan_amount": 350000,
    "loan_type": "Conventional",
    "loan_purpose": "Purchase",
    "property_address": "123 Main St, Anytown, CA",
    "stage": "Application Started",
    "created_at": "2026-01-04T18:10:00Z",
    "created_by": "lo_xyz123"
  }
}
```

#### Application Stage Changed Event

```json
{
  "event": "application.stage_changed",
  "timestamp": "2026-01-04T18:15:00Z",
  "data": {
    "id": "app_def456",
    "object": "mortgage_application",
    "loan_number": "LN-2026-00124",
    "stage": "Processing",
    "previous_stage": "Application Submitted",
    "substatus": "Document Review",
    "changed_at": "2026-01-04T18:15:00Z",
    "changed_by": "proc_456"
  }
}
```

#### Document Uploaded Event

```json
{
  "event": "document.uploaded",
  "timestamp": "2026-01-04T18:20:00Z",
  "data": {
    "id": "doc_789",
    "object": "document",
    "application_id": "app_def456",
    "document_type": "Pay Stub",
    "file_name": "paystub_jan_2026.pdf",
    "file_size": 245678,
    "uploaded_by": "lead_abc123",
    "uploaded_at": "2026-01-04T18:20:00Z",
    "status": "Received"
  }
}
```

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific field that caused error",
      "reason": "Detailed reason for error"
    },
    "request_id": "req_abc123xyz",
    "timestamp": "2026-01-04T18:30:00Z"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request or invalid parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Authenticated but lacks required permissions |
| 404 | `NOT_FOUND` | Requested resource not found |
| 409 | `CONFLICT` | Resource conflict (duplicate, version mismatch) |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `BAD_GATEWAY` | Upstream service error (TwentyCRM/letta) |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| 504 | `GATEWAY_TIMEOUT` | Upstream service timeout |

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Status**: Implementation Ready
