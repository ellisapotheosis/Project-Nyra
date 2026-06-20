# N8N Workflows - Mortgage Lead Automation Engine

## 🎯 SERVICE CONTEXT

**Purpose**: N8N workflow engine for mortgage lead drip campaigns, automated multi-channel communications, document processing, and CRM synchronization with TwentyCRM integration.

**Type**: Workflow Automation Engine
**Language**: N8N JSON + JavaScript expressions
**Runtime**: Node.js via N8N container
**Port**: 5678
**Dependencies**: n8n, redis, postgresql, twilio, sendgrid, nodejs
**Template**: CLAUDE-MD-N8N-Workflows.md (mesh topology for event-driven workflows)

## 🚨 CRITICAL DEVELOPMENT RULES

### Workflow Development Pattern
**MANDATORY**: All workflows, triggers, and actions must be developed with full error handling and retry logic:

```yaml
# ✅ CORRECT: Workflow development pattern
[Single Task]:
  Workflows:
    - Lead Capture → Validation → Score → Queue
    - Lead Drip Campaign → Email → SMS → Call → Document
    - Document Processing → Extract → Validate → Archive
    - CRM Sync → Webhook → TwentyCRM → Status Update

  Triggers:
    - Webhook (lead submission)
    - Schedule (daily, hourly)
    - Webhook (TwentyCRM callbacks)
    - Manual trigger (admin actions)

  Actions:
    - Database operations
    - API calls (Twilio, SendGrid, TwentyCRM)
    - Document processing
    - Error notifications
    - Retry logic (exponential backoff)

  Error Handling:
    - Try-catch for all API calls
    - Retry with exponential backoff (3 attempts)
    - Dead-letter queue for failed items
    - Error notifications to admin
    - Logging of all operations
```

### Workflow Quality Standards

**CRITICAL**: Every workflow MUST have:

- **Idempotency**: Safe to retry without duplicating side effects
- **Error Handling**: Try-catch, retry logic, fallback paths
- **Logging**: All operations logged with timestamps and context
- **Monitoring**: Health checks, performance metrics
- **Documentation**: Clear node descriptions and variable names
- **Testing**: Sample data, dry-run capability
- **Rate Limiting**: Respect API rate limits (Twilio, SendGrid, TwentyCRM)
- **State Management**: Handle concurrent executions properly

## 📊 WORKFLOW ARCHITECTURE

### Lead Processing Workflows

#### 1. Lead Capture & Qualification Workflow
```
Webhook (Lead Received)
    ↓
Input Validation
    ├─ Required fields check
    ├─ Email format validation
    ├─ Phone format validation
    └─ TCPA consent verification
    ↓
Database: Create Lead Record
    ↓
Duplicate Check Query
    ├─ Email match (90 days)
    ├─ Phone match (90 days)
    └─ Fuzzy name match
    ↓
If Duplicate → Mark & Exit
If New → Continue
    ↓
Lead Scoring Calculation
    ├─ Credit tier points
    ├─ Loan amount points
    ├─ Property type points
    └─ Urgency assessment
    ↓
TwentyCRM: Create Contact
    ├─ Map lead data
    ├─ Set custom fields
    └─ Handle errors (retry)
    ↓
Assign to Drip Campaign
    ├─ Select campaign by score
    ├─ Set automation schedule
    └─ Queue for orchestrator
    ↓
Webhook Response
    └─ Return: leadId, status, score, crmId
```

#### 2. Lead Drip Campaign Workflow (Automated Multi-Channel)
```
Trigger: Lead Assigned to Campaign
    ↓
Day 0 - Welcome Email
    ├─ Fetch lead from DB
    ├─ Render email template
    ├─ Send via SendGrid
    ├─ Log send status
    └─ On error → Retry (max 3)
    ↓
Day 0 + 2 Hours - Welcome SMS
    ├─ Check TCPA consent for SMS
    ├─ Fetch lead phone
    ├─ Send via Twilio
    ├─ Track delivery status
    └─ On error → Retry
    ↓
Day 1 - Informational Email
    ├─ Personalized content
    ├─ Rate scenarios
    ├─ CTA: Get Quote
    └─ Track opens/clicks
    ↓
Day 2 - Follow-up SMS
    ├─ Check opt-out status
    ├─ Send via Twilio
    ├─ Track response
    └─ Store engagement
    ↓
Day 3 - Application Document
    ├─ Generate personalized PDF
    ├─ Store in doc management
    ├─ Send download link via email
    └─ Log delivery
    ↓
Day 5 - Qualification Call Reminder
    ├─ Create call task
    ├─ Send reminder SMS
    ├─ Update CRM status
    └─ Queue for agent
    ↓
[Conditional Branches Based on Engagement]
    ├─ High engagement → Accelerated campaign
    ├─ No engagement → Pause sequence
    └─ Opt-out → Remove from all campaigns
```

#### 3. Document Processing Workflow
```
Trigger: Document Upload (Webhook)
    ↓
Document Validation
    ├─ File type check (PDF, JPG, PNG)
    ├─ File size validation
    ├─ Virus scan via CLAMAV
    └─ Format check
    ↓
OCR Processing (if image)
    ├─ Extract text via Tesseract
    ├─ Validate extracted data
    └─ Handle errors
    ↓
Data Extraction
    ├─ Parse required fields
    ├─ Extract dates, amounts, names
    ├─ Validate accuracy
    └─ Confidence score check
    ↓
Database: Store Extracted Data
    ├─ Create document record
    ├─ Link to lead
    └─ Store metadata
    ↓
TwentyCRM: Update Lead
    ├─ Add document reference
    ├─ Update status
    └─ Trigger next step
    ↓
Notification
    ├─ Email confirmation to lead
    ├─ Admin notification if extraction failed
    └─ Log all operations
```

#### 4. CRM Synchronization Workflow
```
Trigger: Webhook from TwentyCRM
    ↓
Validate Webhook Signature
    ├─ Check HMAC-SHA256
    ├─ Verify timestamp (< 5 min)
    └─ Prevent replay attacks
    ↓
Process Event Type
    ├─ Lead created → Create in DB, send welcome
    ├─ Lead updated → Sync to DB, trigger action
    ├─ Lead status changed → Update campaign
    ├─ Document added → Process document
    └─ Task completed → Update lead status
    ↓
Database Transaction
    ├─ Update lead record
    ├─ Handle conflicts (CRM wins for external data)
    ├─ Audit log all changes
    └─ Notify dependent systems
    ↓
Trigger Downstream Actions
    ├─ Campaign updates
    ├─ Communication scheduling
    ├─ Report updates
    └─ Alert notifications
    ↓
Response to TwentyCRM
    └─ Return: { success: true, syncedAt: timestamp }
```

### Communication Workflows

#### 5. Email Campaign Workflow
```
Trigger: Scheduled or Manual
    ↓
Fetch Recipients
    ├─ Query leads by status/segment
    ├─ Filter opt-outs
    ├─ Check email validation
    └─ Deduplicate
    ↓
For Each Lead (Parallel):
    ├─ Render template (personalization)
    ├─ Generate UTM parameters
    ├─ Prepare metadata
    └─ Queue send
    ↓
Rate Limiting Check
    ├─ Respect SendGrid limits (100/sec)
    ├─ Batch sends if needed
    └─ Add delays
    ↓
Send via SendGrid
    ├─ Include reply-to headers
    ├─ Set click/open tracking
    ├─ Add unsubscribe link
    └─ Handle bounces
    ↓
Log Results
    ├─ Sent count, failed count
    ├─ Error details
    ├─ Response from SendGrid
    └─ Timestamp
    ↓
Update Database
    ├─ Record send event
    ├─ Store SendGrid message ID
    ├─ Update campaign metrics
    └─ Set next send date
    ↓
Webhooks Received
    ├─ Bounce notification
    ├─ Complaint notification
    ├─ Open/click tracking
    └─ Unsubscribe event
```

#### 6. SMS Campaign Workflow
```
Trigger: Scheduled or Manual
    ↓
Fetch Recipients
    ├─ Query leads with SMS consent (TCPA)
    ├─ Filter opt-outs
    ├─ Check phone validation
    └─ Deduplicate
    ↓
For Each Lead:
    ├─ Generate personalized message
    ├─ Check message length
    ├─ Add tracking parameters
    └─ Queue send
    ↓
Rate Limiting Check
    ├─ Respect Twilio limits
    ├─ Batch sends (max 100/sec)
    └─ Add delays
    ↓
Send via Twilio
    ├─ Use dedicated short code if available
    ├─ Include opt-out instructions
    ├─ Set delivery callbacks
    └─ Handle errors
    ↓
Log Results
    ├─ Sent count, failed count
    ├─ Cost tracking
    ├─ Error details
    └─ Timestamp
    ↓
Update Database
    ├─ Record send event
    ├─ Store Twilio SID
    ├─ Update campaign metrics
    └─ Set next send
    ↓
Webhooks Received
    ├─ Delivery confirmation
    ├─ Failed delivery
    ├─ Reply received (handoff to agent)
    └─ Opt-out event
```

#### 7. Voice Call Workflow
```
Trigger: Lead assigned for calling
    ↓
Fetch Lead & Script
    ├─ Get lead contact info
    ├─ Load call script
    ├─ Fetch lead history
    └─ Prepare talking points
    ↓
Queue Task for Agent
    ├─ Create in call-queue
    ├─ Set priority by lead score
    ├─ Add lead context
    └─ Set timeout
    ↓
[On Agent Available]
    ├─ Fetch lead details
    ├─ Display in CRM
    ├─ Log call start time
    └─ Record call (if enabled)
    ↓
[After Call Completion]
    ├─ Get call notes from agent
    ├─ Update lead status
    ├─ Log call result
    ├─ Record outcome
    └─ Determine next step
    ↓
Trigger Follow-up Workflow
    ├─ If interested → Accelerate campaign
    ├─ If not interested → Mark status
    ├─ If callback needed → Schedule
    └─ If converted → Update status
    ↓
Send Confirmation to Lead
    ├─ Email with discussion summary
    ├─ Next steps
    └─ CTA
```

## 🔧 N8N WORKFLOW PATTERNS

### Error Handling Pattern (All Workflows)
```json
{
  "nodes": [
    {
      "name": "Try Operation",
      "type": "n8n-nodes-base.http",
      "parameters": {
        "url": "{{ $env.API_ENDPOINT }}/leads",
        "method": "POST",
        "body": "{{ $json }}"
      }
    },
    {
      "name": "Error Catch",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "comparator": "notEqual",
              "value1": "{{ $execution.lastNodeOutput.statusCode }}",
              "value2": 200
            }
          ]
        }
      }
    },
    {
      "name": "Retry Handler",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "expression": "*/1 * * * *"
      }
    },
    {
      "name": "Max Retries Check",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "comparator": "lessThan",
              "value1": "{{ $json.retryCount | default(0) }}",
              "value2": 3
            }
          ]
        }
      }
    },
    {
      "name": "Log Error & Dead Letter",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "INSERT INTO dead_letter_queue (workflow, data, error, timestamp) VALUES ($1, $2, $3, now())",
        "values": [
          "{{ $workflow.id }}",
          "{{ JSON.stringify($json) }}",
          "{{ $execution.lastNodeOutput.body }}"
        ]
      }
    },
    {
      "name": "Notify Admin",
      "type": "n8n-nodes-base.sendGrid",
      "parameters": {
        "subject": "Workflow Error: {{ $workflow.name }}",
        "message": "Error in workflow at {{ now.toISOString() }}: {{ $execution.lastNodeOutput.body }}"
      }
    }
  ]
}
```

### Retry Logic with Exponential Backoff
```json
{
  "retryConfig": {
    "maxRetries": 3,
    "initialDelay": 2000,
    "backoffMultiplier": 2,
    "maxDelay": 30000
  },
  "calculateDelay": "{{ 2000 * Math.pow(2, $json.retryCount || 0) }}"
}
```

### Idempotent Database Operations
```javascript
// Check if already processed
const existingRecord = await db.query(
  'SELECT id FROM operations WHERE idempotency_key = $1',
  [$json.idempotencyKey]
);

if (existingRecord.rows.length > 0) {
  // Already processed, return existing result
  return { alreadyProcessed: true, id: existingRecord.rows[0].id };
}

// Process and store with idempotency key
const result = await db.query(
  'INSERT INTO operations (idempotency_key, data, created_at) VALUES ($1, $2, now()) RETURNING id',
  [$json.idempotencyKey, JSON.stringify($json)]
);

return { processed: true, id: result.rows[0].id };
```

### Webhook Signature Validation (TwentyCRM)
```javascript
const crypto = require('crypto');

const signature = $json.headers['x-twenty-signature'];
const timestamp = $json.headers['x-twenty-timestamp'];
const payload = $json.body;

// Prevent replay attacks
const requestTime = parseInt(timestamp);
const currentTime = Math.floor(Date.now() / 1000);
if (currentTime - requestTime > 300) {
  throw new Error('Webhook timestamp too old');
}

// Verify HMAC-SHA256
const secret = $env.TWENTY_WEBHOOK_SECRET;
const data = `${timestamp}.${JSON.stringify(payload)}`;
const hash = crypto
  .createHmac('sha256', secret)
  .update(data)
  .digest('hex');

if (hash !== signature) {
  throw new Error('Invalid webhook signature');
}

return { valid: true };
```

### Rate Limiting for API Calls
```javascript
// Store rate limit counters in Redis
const redis = require('redis').createClient({
  host: $env.REDIS_HOST,
  port: $env.REDIS_PORT
});

const service = 'sendgrid';
const key = `rate_limit:${service}`;
const limit = 100; // per second
const window = 1000; // milliseconds

const current = await redis.incr(key);
if (current === 1) {
  await redis.expire(key, Math.ceil(window / 1000));
}

if (current > limit) {
  throw new Error(`Rate limit exceeded for ${service}`);
}

return { allowed: true, remaining: limit - current };
```

## 🐝 N8N WORKFLOW SWARM

### Workflow Agents Configuration
```yaml
topology: mesh
maxWorkflows: 15
strategy: specialized
language: n8n
runtime: nodejs

workflows:
  lead_capture:
    role: Lead Ingestion & Validation
    frequency: On webhook
    retry_policy: exponential_backoff_3x
    error_handling: dead_letter_queue
    dependencies: [database, twentycrm]

  lead_drip_campaign:
    role: Automated Multi-Channel Campaign
    frequency: Scheduled + events
    parallel_processing: leads
    rate_limits: [sendgrid, twilio]
    error_handling: retry_with_fallback

  document_processing:
    role: Document OCR & Data Extraction
    frequency: On upload + scheduled
    parallelization: 5 concurrent
    error_handling: admin_notification
    dependencies: [s3, ocr_service, database]

  crm_sync:
    role: Bidirectional CRM Synchronization
    frequency: Webhook-triggered
    idempotency_required: true
    error_handling: conflict_resolution
    dependencies: [twentycrm, database]

  email_campaign:
    role: Email Distribution
    frequency: Scheduled
    batch_size: 1000
    rate_limit: 100/sec
    error_handling: sendgrid_webhook_validation

  sms_campaign:
    role: SMS Distribution
    frequency: Scheduled
    batch_size: 500
    rate_limit: 100/sec
    compliance: tcpa_tracking
    error_handling: twilio_callback_validation

  voice_call:
    role: Call Queue Management
    frequency: Continuous
    priority_queue: lead_score
    error_handling: agent_notification
    dependencies: [call_queue, crm]

  webhook_receiver:
    role: External Webhook Processing
    frequency: Real-time
    validation_required: signature_validation
    idempotency: tracking_id
    error_handling: retry_queue
```

## 📈 PERFORMANCE TARGETS

### Workflow Performance
- Lead capture: < 2 seconds total processing
- Duplicate check: < 500ms
- CRM sync: < 1 second (including API call)
- Email send: < 100ms per email (batch processing)
- SMS send: < 50ms per SMS (batch processing)

### Throughput
- 200 leads/minute sustained
- 1000 concurrent webhook operations
- 10,000 emails/hour via SendGrid
- 5,000 SMS/hour via Twilio

### Reliability
- 99.9% workflow success rate
- < 0.1% duplicate processing
- < 5 minute end-to-end drip campaign response time

## 🧪 WORKFLOW TESTING

### Test Data Setup
```json
{
  "testLead": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john+test@example.com",
    "phone": "+12125551234",
    "loanAmount": 300000,
    "propertyType": "single_family",
    "propertyState": "NY",
    "creditScoreTier": "good",
    "source": "web_form",
    "tcpaConsentGiven": true
  },
  "testDocument": {
    "type": "1040",
    "filename": "test_1040.pdf",
    "url": "s3://test-bucket/test_1040.pdf"
  },
  "testWebhook": {
    "event": "lead.created",
    "leadId": "test-lead-123",
    "timestamp": "2024-01-22T00:00:00Z"
  }
}
```

### Workflow Test Cases
- **Happy path**: Lead created → Validated → Scored → CRM synced
- **Error path**: API failure → Retry → Success
- **Error path**: Max retries exceeded → Dead letter queue
- **Idempotency**: Same webhook twice → Only processed once
- **Rate limiting**: Batch send → Respects API limits
- **Webhook validation**: Invalid signature → Rejected
- **Document processing**: Valid PDF → Data extracted → Stored

## 🚀 DEPLOYMENT & MONITORING

### N8N Configuration
```yaml
environment:
  N8N_HOST: n8n.nyra.local
  N8N_PORT: 5678
  N8N_PROTOCOL: https
  N8N_EDITOR_BASE_URL: https://n8n.nyra.local/

  # Database
  DB_POSTGRESDB_HOST: postgres
  DB_POSTGRESDB_PORT: 5432
  DB_POSTGRESDB_DATABASE: n8n
  DB_POSTGRESDB_USER: n8n_user

  # Redis (for Bull queue)
  QUEUE_REDIS_HOST: redis
  QUEUE_REDIS_PORT: 6379

  # Logging
  N8N_LOG_LEVEL: info
  N8N_LOG_OUTPUT: console,file

  # External Services
  SENDGRID_API_KEY: ${SENDGRID_API_KEY}
  TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
  TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
  TWENTYCRM_API_KEY: ${TWENTYCRM_API_KEY}
```

### Monitoring & Alerts
- Workflow execution times (p50, p95, p99)
- Failure rates by workflow
- Queue depth (stuck jobs)
- API error rates by service
- Email/SMS delivery rates
- CRM sync conflicts

### Alerting Rules
- Workflow failure rate > 1% → Alert
- Queue depth > 1000 → Alert
- CRM sync conflicts > 10 → Alert
- API rate limit warnings → Log
- Webhook signature failures → Alert

---

**N8N is the operational backbone of Nyra's lead engagement. Reliable, well-tested workflows ensure every lead receives consistent, compliant, and timely communications. Every workflow must be production-ready with error handling, monitoring, and recovery capabilities.**
