# TwentyCRM-Graphiti Integration Architecture

## Executive Summary

This document details the architecture for integrating TwentyCRM with Graphiti knowledge graph for mortgage-specific lead management in the Nyra platform. The integration enables bidirectional synchronization, regulatory-compliant lead tracking, and contextual memory for mortgage operations.

## System Overview

```
┌─────────────────┐     Webhooks      ┌──────────────────┐
│   TwentyCRM     │◄──────────────────►│  Twenty-Bridge   │
│   (Port 3000)   │                    │   (Port 8020)    │
└─────────────────┘                    └──────────────────┘
         │                                      │
         │ Custom Fields                        │ Graph Sync
         │ Mortgage Data                        │
         ▼                                      ▼
┌─────────────────┐                    ┌──────────────────┐
│  Twenty         │                    │  Graphiti MCP    │
│  Postgres       │                    │   (Port 8000)    │
└─────────────────┘                    └──────────────────┘
                                               │
                                               │ Knowledge Graph
                                               ▼
                                       ┌──────────────────┐
                                       │   FalkorDB       │
                                       │   (Port 6379)    │
                                       └──────────────────┘
```

## Architecture Principles

### 1. Separation of Concerns
- **TwentyCRM**: Structured CRM data, mortgage applications, contact management
- **Graphiti**: Contextual relationships, conversation history, lead intelligence
- **Twenty-Bridge**: Translation layer, webhook processing, sync orchestration

### 2. Regulatory Compliance
- TRID (TILA-RESPA Integrated Disclosure) compliance
- PII encryption at rest
- Audit trail for all data modifications
- Role-based access control (RBAC)

### 3. Event-Driven Architecture
- Webhook-based synchronization
- Eventual consistency model
- Idempotent operations
- Dead letter queue for failed events

## Component Architecture

### 1. TwentyCRM Custom Objects

#### Mortgage Application Object
```typescript
{
  name: "MortgageApplication",
  fields: [
    // Core Identifiers
    { name: "applicationId", type: "TEXT", unique: true, required: true },
    { name: "loanNumber", type: "TEXT", unique: true },
    { name: "borrowerId", type: "RELATION", relatedTo: "Person" },
    { name: "coBorrowerId", type: "RELATION", relatedTo: "Person" },

    // Loan Details
    { name: "loanAmount", type: "CURRENCY", required: true },
    { name: "loanType", type: "SELECT", options: ["Conventional", "FHA", "VA", "USDA", "Jumbo"] },
    { name: "loanPurpose", type: "SELECT", options: ["Purchase", "Refinance", "Cash-Out Refinance"] },
    { name: "term", type: "NUMBER", label: "Loan Term (years)" },

    // Property Information
    { name: "propertyAddress", type: "ADDRESS" },
    { name: "propertyType", type: "SELECT", options: ["Single Family", "Condo", "Townhouse", "Multi-Family", "Manufactured"] },
    { name: "propertyValue", type: "CURRENCY" },
    { name: "occupancyType", type: "SELECT", options: ["Primary Residence", "Secondary Home", "Investment Property"] },

    // Financial Metrics
    { name: "downPaymentAmount", type: "CURRENCY" },
    { name: "downPaymentPercent", type: "NUMBER" },
    { name: "estimatedCreditScore", type: "NUMBER" },
    { name: "debtToIncomeRatio", type: "NUMBER", label: "DTI %" },
    { name: "combinedLTV", type: "NUMBER", label: "CLTV %" },

    // Status & Workflow
    { name: "stage", type: "SELECT", options: [
      "Lead",
      "Pre-Qualification",
      "Application Started",
      "Application Submitted",
      "Processing",
      "Underwriting",
      "Conditional Approval",
      "Clear to Close",
      "Funded",
      "Withdrawn",
      "Denied"
    ]},
    { name: "substatus", type: "TEXT" },
    { name: "priority", type: "SELECT", options: ["Hot", "Warm", "Cold"] },

    // Dates & Milestones
    { name: "leadDate", type: "DATE_TIME" },
    { name: "applicationDate", type: "DATE_TIME" },
    { name: "lockExpirationDate", type: "DATE_TIME" },
    { name: "targetClosingDate", type: "DATE_TIME" },
    { name: "actualClosingDate", type: "DATE_TIME" },

    // Team & Assignment
    { name: "loanOfficer", type: "RELATION", relatedTo: "User" },
    { name: "loanProcessor", type: "RELATION", relatedTo: "User" },
    { name: "underwriter", type: "RELATION", relatedTo: "User" },
    { name: "closingAgent", type: "RELATION", relatedTo: "User" },

    // Compliance & Documentation
    { name: "trilogySent", type: "BOOLEAN", label: "TRID Trilogy Sent" },
    { name: "trilogyDate", type: "DATE_TIME" },
    { name: "appraisalOrdered", type: "BOOLEAN" },
    { name: "appraisalDate", type: "DATE_TIME" },
    { name: "titleOrdered", type: "BOOLEAN" },
    { name: "disclosuresSigned", type: "BOOLEAN" },

    // Communication Preferences
    { name: "preferredChannel", type: "SELECT", options: ["SMS", "Email", "Phone", "Web Chat"] },
    { name: "bestTimeToContact", type: "TEXT" },
    { name: "languagePreference", type: "SELECT", options: ["English", "Spanish", "Other"] },

    // System Fields
    { name: "leadSource", type: "TEXT" },
    { name: "leadSourceDetail", type: "TEXT" },
    { name: "campaignId", type: "TEXT" },
    { name: "lastActivityDate", type: "DATE_TIME" },
    { name: "nextFollowUpDate", type: "DATE_TIME" },
    { name: "notes", type: "RICH_TEXT" }
  ]
}
```

#### Mortgage Contact Extensions
```typescript
{
  name: "Person",
  customFields: [
    // Employment
    { name: "employmentStatus", type: "SELECT", options: ["Employed", "Self-Employed", "Retired", "Other"] },
    { name: "employer", type: "TEXT" },
    { name: "jobTitle", type: "TEXT" },
    { name: "yearsAtJob", type: "NUMBER" },
    { name: "annualIncome", type: "CURRENCY" },
    { name: "otherIncome", type: "CURRENCY" },

    // Assets & Liabilities
    { name: "liquidAssets", type: "CURRENCY" },
    { name: "retirementAssets", type: "CURRENCY" },
    { name: "monthlyDebts", type: "CURRENCY" },

    // Credit
    { name: "creditScore", type: "NUMBER" },
    { name: "creditScoreDate", type: "DATE_TIME" },
    { name: "creditPullAuthorized", type: "BOOLEAN" },

    // Preferences
    { name: "firstTimeHomeBuyer", type: "BOOLEAN" },
    { name: "militaryService", type: "BOOLEAN" },
    { name: "smsOptIn", type: "BOOLEAN" },
    { name: "emailOptIn", type: "BOOLEAN" },

    // Compliance
    { name: "verifiedIdentity", type: "BOOLEAN" },
    { name: "verificationMethod", type: "SELECT", options: ["ID Upload", "Video Call", "In-Person", "None"] },
    { name: "verificationDate", type: "DATE_TIME" }
  ]
}
```

#### Document Tracking Object
```typescript
{
  name: "MortgageDocument",
  fields: [
    { name: "applicationId", type: "RELATION", relatedTo: "MortgageApplication" },
    { name: "documentType", type: "SELECT", options: [
      "Pay Stub", "W-2", "Tax Return", "Bank Statement",
      "ID Document", "Purchase Agreement", "Appraisal",
      "Title Report", "Insurance", "Other"
    ]},
    { name: "fileName", type: "TEXT" },
    { name: "storageUrl", type: "URL" },
    { name: "uploadDate", type: "DATE_TIME" },
    { name: "status", type: "SELECT", options: ["Pending", "Received", "Verified", "Rejected"] },
    { name: "reviewedBy", type: "RELATION", relatedTo: "User" },
    { name: "notes", type: "TEXT" }
  ]
}
```

### 2. Twenty-Bridge Service

#### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Twenty-Bridge Service                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Webhook    │  │   Sync       │  │   API        │  │
│  │   Receiver   │  │   Engine     │  │   Gateway    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                  │           │
│         └─────────────────┴──────────────────┘           │
│                         │                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Event Processing Pipeline               │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │   │
│  │  │Parse│→│Valid│→│Trans│→│Enrich│→│Sync │  │   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Graph      │  │   Cache      │  │   Queue      │  │
│  │   Mapper     │  │   Manager    │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Core Responsibilities

1. **Webhook Processing**
   - Receive and validate TwentyCRM webhook events
   - Signature verification for security
   - Event queuing and retry logic
   - Rate limiting and circuit breaker

2. **Data Transformation**
   - Convert CRM structured data to graph entities/relationships
   - Mortgage domain-specific mapping rules
   - PII handling and encryption
   - Data enrichment from external sources

3. **Graph Synchronization**
   - Maintain entity relationships in Graphiti
   - Track conversation context
   - Build lead intelligence graph
   - Historical data preservation

4. **API Gateway**
   - REST API for manual sync operations
   - Query interface for graph data
   - Webhook registration management
   - Health checks and monitoring

### 3. Graphiti Knowledge Graph Schema

#### Entity Types

```typescript
// Lead/Contact Entity
{
  entityType: "MortgageLead",
  attributes: {
    crmId: "string",
    name: "string",
    email: "string",
    phone: "string",
    stage: "string",
    priority: "string",
    creditScore: "number",
    income: "number",
    leadSource: "string"
  },
  metadata: {
    source: "twentycrm",
    lastUpdated: "timestamp",
    verificationLevel: "string"
  }
}

// Application Entity
{
  entityType: "LoanApplication",
  attributes: {
    applicationId: "string",
    crmId: "string",
    loanAmount: "number",
    loanType: "string",
    propertyAddress: "string",
    stage: "string",
    closingDate: "date"
  }
}

// Interaction Entity
{
  entityType: "CustomerInteraction",
  attributes: {
    interactionId: "string",
    channel: "string",
    direction: "inbound|outbound",
    summary: "string",
    sentiment: "positive|neutral|negative",
    intent: "string",
    timestamp: "datetime"
  }
}

// Team Member Entity
{
  entityType: "LoanOfficer",
  attributes: {
    userId: "string",
    name: "string",
    role: "string",
    specializations: "array"
  }
}
```

#### Relationship Types

```typescript
// Lead -> Application
{
  relationshipType: "APPLIED_FOR",
  fromEntity: "MortgageLead",
  toEntity: "LoanApplication",
  attributes: {
    applicationDate: "date",
    status: "string"
  }
}

// Lead -> Interaction
{
  relationshipType: "PARTICIPATED_IN",
  fromEntity: "MortgageLead",
  toEntity: "CustomerInteraction",
  attributes: {
    role: "initiator|recipient"
  }
}

// Application -> Team Member
{
  relationshipType: "ASSIGNED_TO",
  fromEntity: "LoanApplication",
  toEntity: "LoanOfficer",
  attributes: {
    role: "loan_officer|processor|underwriter",
    assignedDate: "date"
  }
}

// Lead -> Lead (Referrals)
{
  relationshipType: "REFERRED_BY",
  fromEntity: "MortgageLead",
  toEntity: "MortgageLead",
  attributes: {
    referralDate: "date",
    incentive: "string"
  }
}

// Application -> Previous Application
{
  relationshipType: "REFINANCES",
  fromEntity: "LoanApplication",
  toEntity: "LoanApplication",
  attributes: {
    reason: "string"
  }
}
```

## Integration Patterns

### Pattern 1: Real-Time Webhook Sync

**Flow:**
```
1. Event occurs in TwentyCRM (create/update/delete)
   ↓
2. TwentyCRM sends webhook to Twenty-Bridge
   ↓
3. Twenty-Bridge validates and queues event
   ↓
4. Event processor transforms CRM data
   ↓
5. Graph Mapper creates/updates Graphiti entities
   ↓
6. Graphiti persists to FalkorDB
   ↓
7. Success response to TwentyCRM
```

**Webhook Events:**
- `lead.created`
- `lead.updated`
- `lead.stage_changed`
- `application.created`
- `application.updated`
- `application.milestone_reached`
- `document.uploaded`
- `note.added`
- `task.completed`

### Pattern 2: Scheduled Batch Sync

**Use Cases:**
- Historical data import
- Reconciliation after outages
- Bulk data migrations

**Flow:**
```
1. Cron triggers sync job
   ↓
2. Twenty-Bridge queries TwentyCRM API
   ↓
3. Compare CRM data with Graph data
   ↓
4. Identify differences (conflicts, missing, stale)
   ↓
5. Resolve conflicts (last-write-wins with audit)
   ↓
6. Batch update Graphiti
   ↓
7. Generate reconciliation report
```

### Pattern 3: Query-Time Enrichment

**Flow:**
```
1. Agent requests lead context
   ↓
2. Query Graphiti for relationship graph
   ↓
3. Identify related entities (past apps, interactions)
   ↓
4. Fetch current data from TwentyCRM if stale
   ↓
5. Merge graph context with CRM data
   ↓
6. Return enriched context to agent
```

## Data Flow & Synchronization

### CRM → Graph Sync

```python
# Pseudocode for webhook handler
def handle_lead_updated(webhook_payload):
    # 1. Extract and validate
    lead_data = validate_payload(webhook_payload)

    # 2. Transform to graph entities
    lead_entity = {
        "entity_type": "MortgageLead",
        "crmId": lead_data.id,
        "name": lead_data.name,
        "stage": lead_data.stage,
        # ... other fields
    }

    # 3. Update or create in Graphiti
    graphiti_client.upsert_entity(
        group_id="nyra",
        entity=lead_entity
    )

    # 4. Update relationships
    if lead_data.loan_officer_id:
        graphiti_client.create_relationship(
            from_entity=lead_entity.id,
            to_entity=f"LoanOfficer:{lead_data.loan_officer_id}",
            relationship_type="ASSIGNED_TO",
            attributes={"role": "loan_officer"}
        )

    # 5. Store interaction context
    if lead_data.last_note:
        interaction = {
            "entity_type": "CustomerInteraction",
            "summary": lead_data.last_note,
            "timestamp": lead_data.last_activity
        }
        graphiti_client.upsert_entity(group_id="nyra", entity=interaction)
        graphiti_client.create_relationship(
            from_entity=lead_entity.id,
            to_entity=interaction.id,
            relationship_type="PARTICIPATED_IN"
        )
```

### Graph → CRM Sync

```python
# Pseudocode for reverse sync (optional)
def sync_graph_insights_to_crm(lead_id):
    # Query Graphiti for enriched context
    graph_data = graphiti_client.query(
        f"MATCH (l:MortgageLead {{crmId: '{lead_id}'}})-[*1..3]-(related) RETURN l, related"
    )

    # Extract insights
    insights = {
        "total_interactions": count_interactions(graph_data),
        "sentiment_trend": analyze_sentiment(graph_data),
        "related_applications": find_related_apps(graph_data),
        "referral_network_size": count_referrals(graph_data)
    }

    # Update CRM custom field
    twenty_client.update_lead(
        lead_id=lead_id,
        custom_fields={
            "graph_insights": json.dumps(insights)
        }
    )
```

## API Contracts

### Twenty-Bridge REST API

#### 1. Webhook Registration
```http
POST /api/v1/webhooks/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://twenty-bridge:8020/webhook/twenty",
  "events": ["lead.created", "lead.updated", "application.created"],
  "secret": "<webhook_secret>"
}

Response: 201 Created
{
  "webhook_id": "wh_abc123",
  "status": "active",
  "created_at": "2026-01-04T17:00:00Z"
}
```

#### 2. Manual Sync Trigger
```http
POST /api/v1/sync/trigger
Authorization: Bearer <token>
Content-Type: application/json

{
  "entity_type": "lead",
  "entity_id": "lead_123",
  "direction": "crm_to_graph"
}

Response: 202 Accepted
{
  "sync_job_id": "sync_xyz789",
  "status": "queued",
  "estimated_completion": "2026-01-04T17:05:00Z"
}
```

#### 3. Query Enriched Lead
```http
GET /api/v1/leads/{lead_id}/context
Authorization: Bearer <token>

Response: 200 OK
{
  "lead": {
    "id": "lead_123",
    "name": "John Doe",
    "stage": "Application Submitted",
    "crm_data": { ... }
  },
  "graph_context": {
    "total_interactions": 15,
    "last_interaction": "2026-01-04T16:30:00Z",
    "related_applications": [
      {
        "id": "app_456",
        "type": "Previous Loan",
        "closed_date": "2023-06-15"
      }
    ],
    "assigned_team": [
      {
        "name": "Jane Smith",
        "role": "Loan Officer"
      }
    ],
    "sentiment_trend": "positive",
    "risk_score": 0.15
  }
}
```

#### 4. Sync Status
```http
GET /api/v1/sync/status
Authorization: Bearer <token>

Response: 200 OK
{
  "last_sync": "2026-01-04T16:00:00Z",
  "status": "healthy",
  "entities_synced": {
    "leads": 1523,
    "applications": 847,
    "interactions": 12043
  },
  "pending_events": 3,
  "failed_events": 0
}
```

### Graphiti MCP API

#### 1. Add Mortgage Lead Entity
```http
POST http://graphiti-mcp:8000/add_entity
Content-Type: application/json

{
  "group_id": "nyra",
  "entity": {
    "entity_type": "MortgageLead",
    "name": "John Doe",
    "attributes": {
      "crmId": "lead_123",
      "email": "john@example.com",
      "stage": "Pre-Qualification",
      "creditScore": 720
    }
  }
}
```

#### 2. Query Lead Context
```http
POST http://graphiti-mcp:8000/search
Content-Type: application/json

{
  "group_id": "nyra",
  "query": "Find all interactions and applications for lead with crmId lead_123"
}
```

## Database Schemas

### Twenty-Bridge Internal Database

```sql
-- Sync metadata table
CREATE TABLE sync_state (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  crm_version INTEGER NOT NULL,
  graph_version INTEGER NOT NULL,
  last_synced_at TIMESTAMP NOT NULL,
  sync_direction VARCHAR(20), -- 'crm_to_graph', 'graph_to_crm', 'bidirectional'
  checksum VARCHAR(64),
  UNIQUE(entity_type, entity_id)
);

-- Event queue table
CREATE TABLE event_queue (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  error_message TEXT,
  INDEX idx_status_created (status, created_at)
);

-- Webhook registry
CREATE TABLE webhook_registrations (
  id SERIAL PRIMARY KEY,
  webhook_id VARCHAR(100) UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'twentycrm', 'graphiti', 'other'
  url TEXT NOT NULL,
  secret_hash VARCHAR(128) NOT NULL,
  events JSONB NOT NULL, -- array of event types
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_triggered_at TIMESTAMP
);

-- Audit trail
CREATE TABLE sync_audit (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  operation VARCHAR(20), -- 'create', 'update', 'delete'
  source VARCHAR(20), -- 'crm', 'graph'
  changes JSONB,
  performed_by VARCHAR(100),
  performed_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_entity (entity_type, entity_id, performed_at)
);

-- Field mappings (configuration)
CREATE TABLE field_mappings (
  id SERIAL PRIMARY KEY,
  crm_object VARCHAR(100) NOT NULL,
  crm_field VARCHAR(100) NOT NULL,
  graph_entity_type VARCHAR(100) NOT NULL,
  graph_attribute VARCHAR(100) NOT NULL,
  transform_function VARCHAR(100), -- optional transformation logic
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(crm_object, crm_field, graph_entity_type)
);
```

### TwentyCRM Database (PostgreSQL)

Custom metadata tables to track graph sync:

```sql
-- Table to store graph sync metadata in Twenty's database
CREATE TABLE twenty_graph_sync_meta (
  id SERIAL PRIMARY KEY,
  object_type VARCHAR(50) NOT NULL, -- 'lead', 'application', etc.
  object_id VARCHAR(255) NOT NULL,
  graph_entity_id VARCHAR(255),
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20), -- 'synced', 'pending', 'error'
  UNIQUE(object_type, object_id)
);
```

## Security & Compliance

### Authentication & Authorization

1. **Webhook Security**
   - HMAC-SHA256 signature verification
   - Timestamp validation (5-minute window)
   - IP whitelisting for TwentyCRM

2. **API Security**
   - JWT bearer token authentication
   - Role-based access control (RBAC)
   - Rate limiting (100 req/min per client)
   - Request logging and audit trail

3. **Data Encryption**
   - TLS 1.3 for data in transit
   - AES-256 encryption for PII at rest
   - Field-level encryption for SSN, credit scores
   - Encrypted database backups

### Compliance Requirements

1. **TRID Compliance**
   - Disclosure timeline tracking
   - 3-day waiting period enforcement
   - Document delivery confirmation
   - Fee change threshold monitoring

2. **Data Privacy**
   - GDPR right to erasure implementation
   - CCPA data export functionality
   - Consent tracking for communications
   - Data retention policies (7 years for closed loans)

3. **Audit Trail**
   - Immutable log of all data access
   - Change tracking for regulated fields
   - User action attribution
   - Compliance report generation

## Deployment Strategy

### Phase 1: Foundation (Week 1-2)
- Deploy Twenty-Bridge service skeleton
- Implement webhook receiver and validation
- Set up event queue infrastructure
- Configure TwentyCRM custom fields

### Phase 2: Sync Engine (Week 3-4)
- Implement CRM → Graph sync logic
- Deploy field mapping configuration
- Build transformation pipeline
- Add retry and error handling

### Phase 3: Enrichment (Week 5-6)
- Implement relationship mapping
- Build context query API
- Add sentiment analysis
- Deploy lead intelligence features

### Phase 4: Production Readiness (Week 7-8)
- Performance optimization
- Security hardening
- Monitoring and alerting setup
- Documentation and runbooks

## Monitoring & Observability

### Key Metrics

```yaml
# Prometheus metrics
- twenty_bridge_events_received_total{event_type}
- twenty_bridge_sync_latency_seconds{direction}
- twenty_bridge_sync_errors_total{error_type}
- twenty_bridge_queue_depth{status}
- graphiti_entities_total{entity_type}
- graphiti_relationships_total{relationship_type}
```

### Dashboards

1. **Sync Health Dashboard**
   - Event throughput (events/sec)
   - Sync latency (p50, p95, p99)
   - Error rate and types
   - Queue depth over time

2. **Entity Growth Dashboard**
   - Total leads, applications, interactions
   - Relationship graph complexity
   - Data freshness metrics
   - Sync coverage percentage

3. **Compliance Dashboard**
   - TRID timeline violations
   - Missing documentation alerts
   - Audit trail completeness
   - PII encryption status

### Alerting Rules

```yaml
- name: SyncLatencyHigh
  condition: twenty_bridge_sync_latency_seconds{quantile="0.95"} > 5
  severity: warning

- name: SyncErrorRateHigh
  condition: rate(twenty_bridge_sync_errors_total[5m]) > 0.05
  severity: critical

- name: QueueBacklog
  condition: twenty_bridge_queue_depth{status="pending"} > 1000
  severity: warning
```

## Operational Runbooks

### Runbook 1: Handle Sync Failure

```bash
# 1. Identify failed events
psql -c "SELECT * FROM event_queue WHERE status='failed' ORDER BY created_at DESC LIMIT 10;"

# 2. Check error patterns
psql -c "SELECT error_message, COUNT(*) FROM event_queue WHERE status='failed' GROUP BY error_message;"

# 3. Retry failed events
curl -X POST http://twenty-bridge:8020/api/v1/sync/retry \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"failed_event_ids": ["evt_123", "evt_124"]}'

# 4. Monitor retry success
watch -n 5 'curl -s http://twenty-bridge:8020/api/v1/sync/status | jq .failed_events'
```

### Runbook 2: Full Reconciliation

```bash
# 1. Trigger reconciliation job
curl -X POST http://twenty-bridge:8020/api/v1/sync/reconcile \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"entity_types": ["lead", "application"], "start_date": "2026-01-01"}'

# 2. Monitor progress
curl -s http://twenty-bridge:8020/api/v1/sync/reconcile/status

# 3. Review reconciliation report
curl -s http://twenty-bridge:8020/api/v1/sync/reconcile/report/latest | jq
```

## Performance Considerations

### Scalability Targets
- **Webhook Processing**: 1000 events/sec
- **Sync Latency**: < 2 seconds (p95)
- **Query Response**: < 500ms (p95)
- **Concurrent Connections**: 500+

### Optimization Strategies

1. **Event Batching**
   - Batch process similar events
   - Deduplicate rapid updates
   - Coalesce field changes

2. **Caching**
   - Cache CRM entity snapshots (TTL: 5 min)
   - Cache graph query results (TTL: 1 min)
   - Cache field mappings (invalidate on config change)

3. **Database Optimization**
   - Partition event_queue by date
   - Index on (status, created_at)
   - Regular VACUUM on high-churn tables

4. **Connection Pooling**
   - PostgreSQL: 50 max connections
   - FalkorDB: 20 max connections
   - HTTP keep-alive for TwentyCRM API

## Future Enhancements

### Phase 2 Features
- **Machine Learning Integration**
  - Lead scoring based on graph patterns
  - Churn prediction
  - Optimal team assignment

- **Advanced Analytics**
  - Referral network visualization
  - Conversion funnel analysis
  - Time-to-close predictions

- **Workflow Automation**
  - Auto-assign leads based on graph insights
  - Trigger follow-ups based on interaction patterns
  - Alert on stuck applications

### Phase 3 Features
- **Multi-CRM Support**
  - Abstract CRM adapter interface
  - Support Salesforce, HubSpot
  - Unified graph schema

- **External Data Integration**
  - Credit bureau soft pulls
  - Property valuation APIs
  - Market trend data

## Conclusion

This architecture provides a robust, scalable, and compliant integration between TwentyCRM and Graphiti for mortgage lead management. The event-driven design ensures data consistency while maintaining regulatory compliance. The graph-based approach enables rich contextual intelligence for mortgage operations.

Key benefits:
- **Real-time synchronization** between structured CRM and contextual graph
- **Regulatory compliance** with TRID, GDPR, and audit requirements
- **Scalable architecture** handling 1000+ events/sec
- **Rich lead intelligence** through relationship graphs
- **Operational resilience** with retry logic and monitoring

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Author**: System Architect (Nyra Project)
**Review Status**: Draft for Phase 2 Implementation
