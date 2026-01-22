# Project Nyra - API Reference

**Version**: 2.0.0
**Last Updated**: 2026-01-21

---

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Quote Engine API](#quote-engine-api)
4. [Campaign Engine API](#campaign-engine-api)
5. [Orchestrator API](#orchestrator-api)
6. [Nexus Router API](#nexus-router-api)
7. [Memory APIs](#memory-apis)
8. [Claude Flow CLI Reference](#claude-flow-cli-reference)
9. [MCP Tools Reference](#mcp-tools-reference)
10. [Error Handling](#error-handling)

---

## API Overview

Project Nyra exposes multiple APIs across different services. All APIs follow RESTful conventions and return JSON responses.

### Base URLs

| Service | Base URL | Port | PC |
|---------|----------|------|-----|
| **Nexus Router** | `http://10.0.0.1:6000` | 6000 | PC1 |
| **Quote Engine** | `http://10.0.0.1:8001` | 8001 | PC1 |
| **Campaign Engine** | `http://10.0.0.1:8002` | 8002 | PC1 |
| **Orchestrator** | `http://10.0.0.1:8010` | 8010 | PC1 |
| **Mem0 API** | `http://10.0.0.1:4321` | 4321 | PC1 |
| **Letta API** | `http://10.0.0.1:8283` | 8283 | PC1 |
| **TwentyCRM API** | `http://10.0.0.2:3000/api` | 3000 | PC2 |
| **n8n Webhook** | `http://10.0.0.2:5678/webhook` | 5678 | PC2 |
| **Ollama API** | `http://10.0.0.3:11434` | 11434 | PC3 |

### API Conventions

**Request Headers**:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
X-API-Key: {api_key}
```

**Response Format**:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2026-01-21T12:00:00Z",
  "request_id": "req_abc123"
}
```

**Error Format**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "loan_amount",
      "reason": "Must be greater than 0"
    }
  },
  "timestamp": "2026-01-21T12:00:00Z",
  "request_id": "req_abc123"
}
```

---

## Authentication

### API Key Authentication

Most Project Nyra APIs use API key authentication.

**Header**:
```
X-API-Key: your_api_key_here
```

**Example**:
```bash
curl -X GET http://localhost:8001/health \
  -H "X-API-Key: your_api_key_here"
```

### JWT Authentication

Some services (Orchestrator, TwentyCRM) use JWT tokens.

**Obtain Token**:
```bash
curl -X POST http://localhost:8010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-01-22T12:00:00Z",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

**Use Token**:
```bash
curl -X GET http://localhost:8010/api/leads \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Quote Engine API

**Base URL**: `http://localhost:8001`

### Generate Mortgage Quote

Calculate mortgage rates and generate a quote.

**Endpoint**: `POST /quote`

**Request Body**:
```json
{
  "loan_amount": 300000,
  "property_value": 400000,
  "credit_score": 740,
  "loan_type": "conventional",
  "loan_term": 30,
  "down_payment": 100000,
  "property_state": "CA",
  "property_zip": "90210",
  "property_type": "single_family",
  "occupancy_type": "primary",
  "borrower_email": "borrower@example.com",
  "borrower_phone": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quote_id": "quote_abc123",
    "loan_amount": 300000,
    "interest_rate": 6.875,
    "apr": 7.125,
    "monthly_payment": 1972.48,
    "total_interest": 409692.80,
    "total_payment": 709692.80,
    "ltv": 75.0,
    "dti": 28.5,
    "estimated_closing_costs": 9000,
    "lock_period_days": 45,
    "rate_lock_expires_at": "2026-03-07T12:00:00Z",
    "disclosures": {
      "good_faith_estimate_url": "https://...",
      "loan_estimate_url": "https://...",
      "closing_disclosure_url": null
    },
    "lender": {
      "name": "Example Lender",
      "nmls_id": "123456"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input parameters
- `422 Unprocessable Entity` - Failed validation (e.g., DTI too high)
- `500 Internal Server Error` - Server error

**Example**:
```bash
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "loan_amount": 300000,
    "property_value": 400000,
    "credit_score": 740,
    "loan_type": "conventional",
    "loan_term": 30,
    "down_payment": 100000,
    "property_state": "CA",
    "property_zip": "90210",
    "borrower_email": "test@example.com"
  }'
```

### Get Quote by ID

Retrieve an existing quote.

**Endpoint**: `GET /quote/{quote_id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "quote_id": "quote_abc123",
    "status": "active",
    "created_at": "2026-01-21T12:00:00Z",
    "expires_at": "2026-03-07T12:00:00Z",
    ...
  }
}
```

### List Quotes

List all quotes with pagination.

**Endpoint**: `GET /quotes`

**Query Parameters**:
- `page` (int, default: 1) - Page number
- `limit` (int, default: 20) - Results per page
- `status` (string) - Filter by status: `active`, `expired`, `locked`
- `borrower_email` (string) - Filter by borrower email

**Example**:
```bash
curl -X GET "http://localhost:8001/quotes?page=1&limit=20&status=active" \
  -H "X-API-Key: your_api_key"
```

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-21T12:00:00Z",
  "dependencies": {
    "database": "healthy",
    "nexus_router": "healthy",
    "redis": "healthy"
  }
}
```

---

## Campaign Engine API

**Base URL**: `http://localhost:8002`

### Create Campaign

Create a new drip campaign.

**Endpoint**: `POST /campaigns`

**Request Body**:
```json
{
  "name": "First-Time Homebuyer Nurture",
  "type": "drip",
  "trigger": "lead_created",
  "schedule": {
    "start_immediately": true,
    "timezone": "America/Los_Angeles"
  },
  "messages": [
    {
      "delay_days": 0,
      "channel": "email",
      "subject": "Welcome to RateHunter!",
      "template_id": "welcome_email"
    },
    {
      "delay_days": 2,
      "channel": "sms",
      "template_id": "followup_sms"
    },
    {
      "delay_days": 7,
      "channel": "call",
      "template_id": "check_in_call"
    }
  ],
  "target_audience": {
    "credit_score_min": 620,
    "loan_type": "conventional",
    "first_time_buyer": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "campaign_id": "camp_xyz789",
    "name": "First-Time Homebuyer Nurture",
    "status": "draft",
    "created_at": "2026-01-21T12:00:00Z",
    "message_count": 3
  }
}
```

### Start Campaign

Activate a campaign.

**Endpoint**: `POST /campaigns/{campaign_id}/start`

**Response**:
```json
{
  "success": true,
  "data": {
    "campaign_id": "camp_xyz789",
    "status": "active",
    "started_at": "2026-01-21T12:00:00Z"
  }
}
```

### List Campaigns

**Endpoint**: `GET /campaigns`

**Query Parameters**:
- `page` (int)
- `limit` (int)
- `status` (string): `draft`, `active`, `paused`, `completed`

### Add Lead to Campaign

Enroll a lead in a campaign.

**Endpoint**: `POST /campaigns/{campaign_id}/leads`

**Request Body**:
```json
{
  "lead_id": "lead_123",
  "override_schedule": false,
  "custom_variables": {
    "first_name": "John",
    "loan_amount": 300000
  }
}
```

---

## Orchestrator API

**Base URL**: `http://localhost:8010`

### Process Lead

Process a new lead through the full workflow.

**Endpoint**: `POST /leads`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "loan_amount": 300000,
  "property_value": 400000,
  "credit_score": 740,
  "loan_type": "conventional",
  "property_state": "CA",
  "property_zip": "90210",
  "source": "website",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lead_id": "lead_123",
    "status": "new",
    "quote": {
      "quote_id": "quote_abc123",
      "interest_rate": 6.875,
      "monthly_payment": 1972.48
    },
    "campaign_enrolled": true,
    "campaign_id": "camp_xyz789",
    "next_action": "wait_for_contact",
    "created_at": "2026-01-21T12:00:00Z"
  }
}
```

### Run Compliance Check

Validate compliance for a lead or loan.

**Endpoint**: `POST /compliance/check`

**Request Body**:
```json
{
  "lead_id": "lead_123",
  "loan_data": {
    "loan_amount": 300000,
    "property_value": 400000,
    "borrower_income": 100000,
    "loan_type": "conventional"
  },
  "checks": [
    "tila",
    "respa",
    "fair_lending",
    "state_specific"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "compliance_id": "comp_456",
    "overall_status": "passed",
    "checks": [
      {
        "type": "tila",
        "status": "passed",
        "details": {
          "apr_calculated": 7.125,
          "disclosure_generated": true
        }
      },
      {
        "type": "respa",
        "status": "passed",
        "details": {
          "good_faith_estimate": true,
          "servicing_disclosure": true
        }
      },
      {
        "type": "fair_lending",
        "status": "passed",
        "warnings": []
      },
      {
        "type": "state_specific",
        "status": "passed",
        "state": "CA",
        "requirements_met": true
      }
    ],
    "audit_trail": {
      "checked_at": "2026-01-21T12:00:00Z",
      "checked_by": "system",
      "audit_id": "audit_789"
    }
  }
}
```

---

## Nexus Router API

**Base URL**: `http://localhost:6000`

The Nexus Router provides unified LLM access with intelligent routing.

### Send Message (Claude-Compatible)

**Endpoint**: `POST /v1/messages`

**Request Headers**:
```
Content-Type: application/json
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01
```

**Request Body**:
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Generate a mortgage pre-qualification letter for a borrower with 740 credit score and $300k loan amount."
    }
  ],
  "temperature": 0.7,
  "system": "You are an expert mortgage loan officer assistant."
}
```

**Response**:
```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Here is a pre-qualification letter for your borrower..."
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 50,
    "output_tokens": 200
  }
}
```

### Model Routing

Nexus automatically routes requests to optimal providers:

| Model Alias | Actual Model | Provider | Use Case |
|------------|--------------|----------|----------|
| `premium` | `claude-sonnet-4-20250514` | Anthropic | Best quality |
| `balanced` | `llama-3.1-70b-instruct` | OpenRouter | Good quality |
| `cheap` | `gemini-1.5-flash` | Google | Fast, low cost |
| `local` | `llama3.1:8b` | Ollama | Zero cost, private |

**Example with routing**:
```bash
# Use cheap model for simple tasks
curl -X POST http://localhost:6000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "cheap",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Summarize this in one sentence: ..."}]
  }'
```

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "providers": {
    "anthropic": "connected",
    "openrouter": "connected",
    "gemini": "connected",
    "ollama": "connected"
  },
  "cache": {
    "backend": "redis",
    "status": "connected"
  }
}
```

---

## Memory APIs

### Mem0 REST API

**Base URL**: `http://localhost:4321`

#### Create Memory

**Endpoint**: `POST /memories`

**Request Body**:
```json
{
  "user_id": "user_123",
  "agent_id": "agent_loan_officer",
  "messages": [
    {
      "role": "user",
      "content": "I'm looking to buy a house in California"
    }
  ],
  "metadata": {
    "session_id": "session_456",
    "source": "chat"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "memory_id": "mem_abc123",
    "user_id": "user_123",
    "memories": [
      {
        "text": "User is interested in buying property in California",
        "category": "preference",
        "confidence": 0.95
      }
    ]
  }
}
```

#### Get User Memories

**Endpoint**: `GET /memories/{user_id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "memories": [
      {
        "memory_id": "mem_abc123",
        "text": "User is interested in buying property in California",
        "category": "preference",
        "created_at": "2026-01-21T12:00:00Z"
      },
      {
        "memory_id": "mem_def456",
        "text": "User has credit score of 740",
        "category": "financial",
        "created_at": "2026-01-21T12:05:00Z"
      }
    ]
  }
}
```

### Letta API

**Base URL**: `http://localhost:8283`

#### Create Agent

**Endpoint**: `POST /v1/agents`

**Request Body**:
```json
{
  "name": "Loan Officer Bot",
  "persona": "You are an experienced mortgage loan officer...",
  "human": "A potential home buyer looking for mortgage options",
  "tools": ["calculate_apr", "check_eligibility"],
  "memory": {
    "human": "Client details and preferences",
    "persona": "Professional mortgage advisor"
  }
}
```

#### Send Message to Agent

**Endpoint**: `POST /v1/agents/{agent_id}/messages`

**Request Body**:
```json
{
  "message": "What interest rate can I get with 740 credit score?",
  "role": "user"
}
```

---

## Claude Flow CLI Reference

### Installation

```bash
# Install globally
npm install -g @claude-flow/cli@latest

# Or use npx
npx @claude-flow/cli@latest [command]
```

### Core Commands

#### System Status

```bash
# View system status
npx @claude-flow/cli@latest status

# JSON output
npx @claude-flow/cli@latest status --format json

# Verbose output
npx @claude-flow/cli@latest status --verbose

# Watch mode (continuous monitoring)
npx @claude-flow/cli@latest status --watch
```

#### Agent Management

```bash
# List all agents
npx @claude-flow/cli@latest agent list

# Spawn agent
npx @claude-flow/cli@latest agent spawn \
  -t coder \
  --name my-coder

# Agent status
npx @claude-flow/cli@latest agent status \
  --agent-id agent_123

# Terminate agent
npx @claude-flow/cli@latest agent terminate \
  --agent-id agent_123

# Agent pool status
npx @claude-flow/cli@latest agent pool \
  --action status
```

#### Swarm Operations

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 35 \
  --strategy specialized

# Swarm status
npx @claude-flow/cli@latest swarm status

# Scale swarm
npx @claude-flow/cli@latest swarm scale \
  --agents 50

# Join swarm (worker)
npx @claude-flow/cli@latest swarm join \
  --coordinator http://10.0.0.1:7000

# Swarm health
npx @claude-flow/cli@latest swarm health
```

#### Memory Operations

```bash
# Store memory
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key auth-pattern \
  --value "JWT with refresh tokens"

# Retrieve memory
npx @claude-flow/cli@latest memory retrieve \
  --namespace patterns \
  --key auth-pattern

# Search memory (vector search)
npx @claude-flow/cli@latest memory search \
  --query "authentication patterns" \
  --namespace patterns \
  --limit 5

# List memories
npx @claude-flow/cli@latest memory list \
  --namespace patterns

# Memory statistics
npx @claude-flow/cli@latest memory stats
```

#### Task Management

```bash
# Create task
npx @claude-flow/cli@latest task create \
  --type feature \
  --description "Implement OAuth" \
  --priority high

# List tasks
npx @claude-flow/cli@latest task list

# Task status
npx @claude-flow/cli@latest task status \
  --task-id task_123

# Complete task
npx @claude-flow/cli@latest task complete \
  --task-id task_123
```

#### Hooks System

```bash
# Pre-task hook (get routing suggestions)
npx @claude-flow/cli@latest hooks pre-task \
  --description "implement authentication"

# Post-task hook (record completion)
npx @claude-flow/cli@latest hooks post-task \
  --task-id task_123 \
  --success true

# Route task to optimal agent
npx @claude-flow/cli@latest hooks route \
  --task "fix bug in authentication"

# Explain routing decision
npx @claude-flow/cli@latest hooks explain \
  --topic "authentication"

# View metrics
npx @claude-flow/cli@latest hooks metrics

# Pretrain from repository
npx @claude-flow/cli@latest hooks pretrain \
  --depth deep
```

#### Neural Learning

```bash
# Train neural patterns
npx @claude-flow/cli@latest neural train \
  --pattern-type coordination \
  --epochs 10

# View patterns
npx @claude-flow/cli@latest neural patterns \
  --list

# Predict optimal approach
npx @claude-flow/cli@latest neural predict \
  --input "implement oauth"

# Training status
npx @claude-flow/cli@latest neural status
```

#### Daemon Control

```bash
# Start daemon
npx @claude-flow/cli@latest daemon start

# Stop daemon
npx @claude-flow/cli@latest daemon stop

# Restart daemon
npx @claude-flow/cli@latest daemon restart

# Daemon status
npx @claude-flow/cli@latest daemon status

# Enable worker
npx @claude-flow/cli@latest daemon enable \
  --worker predict
```

#### Configuration

```bash
# List configuration
npx @claude-flow/cli@latest config list

# Get specific value
npx @claude-flow/cli@latest config get \
  swarm.maxAgents

# Set value
npx @claude-flow/cli@latest config set \
  swarm.maxAgents 50

# Validate configuration
npx @claude-flow/cli@latest config validate
```

#### MCP Server

```bash
# Start MCP server
npx @claude-flow/cli@latest mcp start

# MCP status
npx @claude-flow/cli@latest mcp status

# Stop MCP server
npx @claude-flow/cli@latest mcp stop
```

#### System Diagnostics

```bash
# Run doctor (health checks)
npx @claude-flow/cli@latest doctor

# Fix issues automatically
npx @claude-flow/cli@latest doctor --fix

# Performance benchmark
npx @claude-flow/cli@latest performance benchmark \
  --suite all

# Security scan
npx @claude-flow/cli@latest security scan \
  --depth full
```

---

## MCP Tools Reference

### Flow Nexus MCP Tools

Project Nyra integrates with Flow Nexus for advanced swarm orchestration.

#### Swarm Initialization

```javascript
// Initialize swarm
mcp__flow-nexus__swarm_init({
  topology: "hierarchical",
  maxAgents: 8,
  strategy: "balanced"
})
```

#### Agent Spawning

```javascript
// Spawn specialized agent
mcp__flow-nexus__agent_spawn({
  type: "researcher",
  capabilities: ["web-search", "analysis"]
})
```

#### Task Orchestration

```javascript
// Orchestrate complex task
mcp__flow-nexus__task_orchestrate({
  task: "Implement user authentication with OAuth",
  strategy: "parallel",
  maxAgents: 5
})
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Service temporarily unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid loan amount",
    "details": {
      "field": "loan_amount",
      "value": -1000,
      "constraint": "must be positive"
    },
    "suggestion": "Please provide a valid loan amount greater than 0"
  },
  "request_id": "req_abc123",
  "timestamp": "2026-01-21T12:00:00Z"
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `VALIDATION_ERROR` | Input validation failed | Check request parameters |
| `AUTHENTICATION_REQUIRED` | Missing authentication | Provide API key or JWT token |
| `INSUFFICIENT_PERMISSIONS` | Insufficient permissions | Check user role/permissions |
| `RESOURCE_NOT_FOUND` | Resource not found | Verify resource ID |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry with backoff |
| `SERVICE_UNAVAILABLE` | Service temporarily down | Retry after delay |
| `COMPLIANCE_CHECK_FAILED` | Compliance validation failed | Review compliance requirements |

### Retry Logic

```python
import time
import requests

def api_call_with_retry(url, max_retries=3, backoff=2):
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json={...})
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                time.sleep(backoff ** attempt)
            elif e.response.status_code >= 500:  # Server error
                time.sleep(backoff ** attempt)
            else:
                raise  # Don't retry client errors
        except requests.exceptions.RequestException:
            time.sleep(backoff ** attempt)

    raise Exception("Max retries exceeded")
```

---

## Related Documentation

- [Setup Guide](SETUP-GUIDE.md)
- [Configuration Guide](CONFIGURATION.md)
- [Deployment Guide](DEPLOYMENT.md)

---

**API Reference Version**: 2.0.0
**Last Updated**: 2026-01-21
**Maintainer**: Project Nyra Team
