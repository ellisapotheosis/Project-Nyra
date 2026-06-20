# Activepieces Flows - Workflow Orchestration & Automation

## 🎯 SERVICE CONTEXT

**Purpose**: Activepieces no-code/low-code workflow automation platform for mortgage lead engagement, document processing, multi-channel communications, and CRM integration with TwentyCRM and N8N orchestration.

**Type**: Workflow Automation & Integration Platform
**Language**: Activepieces YAML + TypeScript expressions
**Runtime**: Node.js via Activepieces container
**Port**: 3000
**Dependencies**: activepieces, redis, postgresql, nodejs, n8n, docker
**Template**: CLAUDE-MD-Activepieces-Flows.md (hierarchical topology for workflow coordination)

## 🚨 CRITICAL DEVELOPMENT RULES

### Flow Development Pattern
**MANDATORY**: All flows must follow the declarative flow pattern with clear triggers, actions, and error paths:

```yaml
# ✅ CORRECT: Activepieces flow structure
flow:
  name: "Lead Processing Flow"
  enabled: true

  trigger:
    type: webhook
    displayName: "Lead Submission Webhook"

  steps:
    - action: validation
    - action: database_check
    - action: api_call
    - errorPath:
        - action: retry
        - action: alert

  successPath:
    - action: notify_downstream
    - action: log_event
```

### Flow Quality Standards

**CRITICAL**: Every flow MUST have:

- **Clear Triggers**: Webhook, Schedule, Manual, or Event-based
- **Modular Design**: Reusable sub-flows and components
- **Error Handling**: Try-catch, retry logic, fallback paths
- **Input Validation**: Schema validation for all inputs
- **Rate Limiting**: Respect external API limits
- **Idempotency**: Safe to execute multiple times
- **State Management**: Proper variable scoping
- **Documentation**: Clear step descriptions
- **Testing**: Sample data and dry-run mode
- **Monitoring**: Execution logs and metrics

## 📊 ACTIVEPIECES FLOW ARCHITECTURE

### Core Flow Modules

#### 1. Lead Intake & Validation Flow
```yaml
name: "Lead Intake & Validation"
displayName: "Handle new lead submissions"
enabled: true

trigger:
  type: webhook
  displayName: "Lead Submission Webhook"
  description: "Receives lead data from web forms and APIs"

steps:
  # Step 1: Extract Input
  - displayName: "Parse Lead Data"
    action: core.extract_json
    params:
      jsonData: "{{ trigger.body }}"
    result: lead_data

  # Step 2: Validate Input
  - displayName: "Validate Required Fields"
    action: core.json_schema_validation
    params:
      schema:
        type: object
        required:
          - firstName
          - lastName
          - email
          - phone
          - tcpaConsentGiven
        properties:
          firstName:
            type: string
            minLength: 2
          lastName:
            type: string
            minLength: 2
          email:
            type: string
            format: email
          phone:
            type: string
            pattern: "^\\+1[0-9]{10}$"
          tcpaConsentGiven:
            type: boolean
      data: "{{ lead_data }}"
    result: validation_result

  # Step 3: Check TCPA Consent
  - displayName: "Verify TCPA Consent"
    action: core.conditional
    params:
      condition: "{{ lead_data.tcpaConsentGiven === false }}"
    thenPath:
      - displayName: "Reject - No TCPA Consent"
        action: core.return_response
        params:
          statusCode: 400
          body:
            error: "TCPA consent required"
            message: "Cannot process lead without TCPA consent"
    elsePath:
      - displayName: "Continue Processing"
        action: core.continue_flow

  # Step 4: Check for Duplicates
  - displayName: "Query Duplicate Leads"
    action: postgres.query
    params:
      host: "{{ environment.DB_HOST }}"
      database: "{{ environment.DB_NAME }}"
      query: >
        SELECT id, email, phone FROM leads
        WHERE (email = $1 OR phone = $2)
        AND created_at > NOW() - INTERVAL '90 days'
        LIMIT 1
      values:
        - "{{ lead_data.email }}"
        - "{{ lead_data.phone }}"
    result: duplicate_check

  # Step 5: Handle Duplicate
  - displayName: "Is Duplicate?"
    action: core.conditional
    params:
      condition: "{{ duplicate_check.rows.length > 0 }}"
    thenPath:
      - displayName: "Mark as Duplicate"
        action: postgres.insert
        params:
          table: "leads"
          data:
            firstName: "{{ lead_data.firstName }}"
            lastName: "{{ lead_data.lastName }}"
            email: "{{ lead_data.email }}"
            phone: "{{ lead_data.phone }}"
            isDuplicate: true
            originalLeadId: "{{ duplicate_check.rows[0].id }}"
            status: "duplicate"
            createdAt: "{{ now() }}"
        result: created_lead
      - displayName: "Return Duplicate Response"
        action: core.return_response
        params:
          statusCode: 409
          body:
            leadId: "{{ created_lead.id }}"
            status: "duplicate"
            originalLeadId: "{{ duplicate_check.rows[0].id }}"
    elsePath:
      - displayName: "Create New Lead Record"
        action: postgres.insert
        params:
          table: "leads"
          data:
            firstName: "{{ lead_data.firstName }}"
            lastName: "{{ lead_data.lastName }}"
            email: "{{ lead_data.email }}"
            phone: "{{ lead_data.phone }}"
            loanAmount: "{{ lead_data.loanAmount }}"
            propertyType: "{{ lead_data.propertyType }}"
            propertyState: "{{ lead_data.propertyState }}"
            creditScoreTier: "{{ lead_data.creditScoreTier }}"
            source: "{{ lead_data.source }}"
            status: "new"
            leadScore: 0
            tcpaConsentGiven: true
            tcpaConsentTimestamp: "{{ now() }}"
            emailValidated: false
            phoneValidated: false
            isDuplicate: false
            createdAt: "{{ now() }}"
        result: created_lead

  # Step 6: Calculate Lead Score (Async)
  - displayName: "Queue Lead Scoring"
    action: core.http_request
    params:
      method: POST
      url: "{{ environment.LEAD_SCORING_URL }}"
      body:
        leadId: "{{ created_lead.id }}"
        loanAmount: "{{ lead_data.loanAmount }}"
        propertyType: "{{ lead_data.propertyType }}"
        creditScoreTier: "{{ lead_data.creditScoreTier }}"
    result: scoring_response

  # Step 7: Sync to TwentyCRM
  - displayName: "Create Contact in TwentyCRM"
    action: http_request
    params:
      method: POST
      url: "{{ environment.TWENTYCRM_API_URL }}/graphql"
      headers:
        Authorization: "Bearer {{ environment.TWENTYCRM_API_KEY }}"
        Content-Type: "application/json"
      body:
        query: |
          mutation CreateContact($input: CreateContactInput!) {
            createContact(input: $input) {
              id
              firstName
              lastName
              email
              phone
            }
          }
        variables:
          input:
            firstName: "{{ lead_data.firstName }}"
            lastName: "{{ lead_data.lastName }}"
            email: "{{ lead_data.email }}"
            phone: "{{ lead_data.phone }}"
            customFields:
              loanAmount: "{{ lead_data.loanAmount }}"
              propertyType: "{{ lead_data.propertyType }}"
              propertyState: "{{ lead_data.propertyState }}"
              leadSource: "{{ lead_data.source }}"
              tcpaConsent: true
    result: crm_response
    errorPath:
      - displayName: "CRM Sync Failed - Log and Continue"
        action: core.log
        params:
          message: "TwentyCRM sync failed for lead {{ created_lead.id }}"
          error: "{{ crm_response.error }}"
      - displayName: "Queue for Retry"
        action: core.http_request
        params:
          method: POST
          url: "{{ environment.QUEUE_URL }}"
          body:
            action: "sync_to_crm"
            leadId: "{{ created_lead.id }}"
            retryCount: 0

  # Step 8: Assign to Campaign
  - displayName: "Queue Campaign Assignment"
    action: core.http_request
    params:
      method: POST
      url: "{{ environment.CAMPAIGN_ENGINE_URL }}"
      body:
        leadId: "{{ created_lead.id }}"
        campaignType: "drip"
        priority: "{{ scoring_response.score > 70 ? 'high' : 'normal' }}"

  # Step 9: Return Success Response
  - displayName: "Return Success Response"
    action: core.return_response
    params:
      statusCode: 202
      body:
        leadId: "{{ created_lead.id }}"
        status: "processing"
        message: "Lead received and queued for processing"
        estimatedProcessingTime: "5-10 seconds"
        score: "{{ scoring_response.score }}"
        crmId: "{{ crm_response.data.createContact.id }}"
```

#### 2. Lead Drip Campaign Flow
```yaml
name: "Lead Drip Campaign Orchestrator"
displayName: "Execute multi-stage, multi-channel lead campaigns"
enabled: true

trigger:
  type: event
  displayName: "Lead Assigned to Campaign"
  eventName: "lead.campaign_assigned"

steps:
  # Step 1: Fetch Lead Details
  - displayName: "Get Lead Information"
    action: postgres.query
    params:
      query: >
        SELECT * FROM leads WHERE id = $1
      values:
        - "{{ trigger.leadId }}"
    result: lead_record

  # Step 2: Log Campaign Start
  - displayName: "Log Campaign Start"
    action: postgres.insert
    params:
      table: "campaign_events"
      data:
        leadId: "{{ lead_record.id }}"
        campaignType: "drip"
        stage: "initialized"
        timestamp: "{{ now() }}"
        metadata:
          score: "{{ lead_record.leadScore }}"
          source: "{{ lead_record.source }}"

  # Day 0: Welcome Email
  - displayName: "Send Welcome Email (Day 0)"
    action: core.sleep
    params:
      duration: 0
    then:
      - displayName: "Render Welcome Template"
        action: core.template_string
        params:
          template: "welcome_email"
          variables:
            firstName: "{{ lead_record.firstName }}"
            loanAmount: "{{ lead_record.loanAmount }}"
            propertyType: "{{ lead_record.propertyType }}"
        result: email_content

      - displayName: "Send Welcome Email"
        action: sendgrid.send_email
        params:
          toEmail: "{{ lead_record.email }}"
          toName: "{{ lead_record.firstName }} {{ lead_record.lastName }}"
          subject: "Welcome to Your Mortgage Journey"
          htmlContent: "{{ email_content.html }}"
          trackingEnabled: true
          tags:
            - "drip-campaign"
            - "day0"
            - "leadId:{{ lead_record.id }}"
        result: email_result
        errorPath:
          - displayName: "Retry Email Send"
            action: core.retry_step
            params:
              maxRetries: 3
              backoffType: "exponential"
              initialDelay: 2000

  # Day 0 + 2 hours: Welcome SMS
  - displayName: "Send Welcome SMS (Day 0 + 2h)"
    action: core.sleep
    params:
      duration: 7200000
    then:
      - displayName: "Check SMS Consent"
        action: core.conditional
        params:
          condition: "{{ lead_record.tcpaConsentGiven }}"
        thenPath:
          - displayName: "Send SMS via Twilio"
            action: twilio.send_sms
            params:
              toPhone: "{{ lead_record.phone }}"
              message: "Hi {{ lead_record.firstName }}, get personalized mortgage rates instantly. Reply STOP to opt out."
              tags:
                - "drip-campaign"
                - "day0-2h"
            result: sms_result

  # Day 1: Informational Email
  - displayName: "Send Informational Email (Day 1)"
    action: core.sleep
    params:
      duration: 86400000
    then:
      - displayName: "Send Day 1 Email"
        action: sendgrid.send_email
        params:
          toEmail: "{{ lead_record.email }}"
          subject: "Your Personalized Mortgage Rates"
          htmlContent: "Day 1 educational content with rate scenarios"
          trackingEnabled: true

  # Day 3: Document Email
  - displayName: "Generate & Send Document (Day 3)"
    action: core.sleep
    params:
      duration: 259200000
    then:
      - displayName: "Generate Personalized PDF"
        action: core.http_request
        params:
          method: POST
          url: "{{ environment.DOC_GENERATOR_URL }}"
          body:
            leadId: "{{ lead_record.id }}"
            documentType: "application"
            personalizeWith:
              firstName: "{{ lead_record.firstName }}"
              loanAmount: "{{ lead_record.loanAmount }}"
              propertyType: "{{ lead_record.propertyType }}"
        result: doc_response

      - displayName: "Send Document via Email"
        action: sendgrid.send_email
        params:
          toEmail: "{{ lead_record.email }}"
          subject: "Your Application Checklist"
          htmlContent: "Day 3 document delivery"
          attachments:
            - url: "{{ doc_response.pdfUrl }}"
              filename: "application_checklist.pdf"

  # Day 5: Follow-up SMS
  - displayName: "Send Follow-up SMS (Day 5)"
    action: core.sleep
    params:
      duration: 432000000
    then:
      - displayName: "Send Follow-up SMS"
        action: twilio.send_sms
        params:
          toPhone: "{{ lead_record.phone }}"
          message: "{{ lead_record.firstName }}, ready to move forward? Reply YES or visit our site."

  # Engagement Check
  - displayName: "Check Lead Engagement"
    action: core.conditional
    params:
      condition: "{{ check_engagement_status(lead_record.id) }}"
    thenPath:
      - displayName: "High Engagement - Accelerate Campaign"
        action: core.http_request
        params:
          method: POST
          url: "{{ environment.CAMPAIGN_ENGINE_URL }}"
          body:
            leadId: "{{ lead_record.id }}"
            action: "accelerate"
            newCampaign: "fast_track"
    elsePath:
      - displayName: "Low Engagement - Pause Campaign"
        action: core.http_request
        params:
          method: POST
          url: "{{ environment.CAMPAIGN_ENGINE_URL }}"
          body:
            leadId: "{{ lead_record.id }}"
            action: "pause"
```

#### 3. Document Processing Flow
```yaml
name: "Document Upload & Processing"
displayName: "Handle document uploads with OCR and extraction"
enabled: true

trigger:
  type: webhook
  displayName: "Document Upload Webhook"

steps:
  # Step 1: Validate File
  - displayName: "Validate Document"
    action: core.conditional
    params:
      condition: "{{ ['pdf', 'jpg', 'png'].includes(trigger.fileType) && trigger.fileSize < 10485760 }}"
    elsePath:
      - displayName: "Return Invalid File Error"
        action: core.return_response
        params:
          statusCode: 400
          body:
            error: "Invalid file"
            message: "File must be PDF or image (< 10MB)"

  # Step 2: Scan for Viruses
  - displayName: "Virus Scan Document"
    action: core.http_request
    params:
      method: POST
      url: "{{ environment.VIRUS_SCAN_URL }}"
      body:
        fileUrl: "{{ trigger.fileUrl }}"
    result: scan_result
    errorPath:
      - displayName: "Quarantine Document"
        action: core.log
        params:
          level: "error"
          message: "Document flagged by virus scan"

  # Step 3: Extract Text via OCR
  - displayName: "Extract Text via OCR"
    action: core.http_request
    params:
      method: POST
      url: "{{ environment.OCR_SERVICE_URL }}"
      body:
        fileUrl: "{{ trigger.fileUrl }}"
        language: "en"
    result: ocr_result

  # Step 4: Extract Structured Data
  - displayName: "Extract Structured Data"
    action: core.http_request
    params:
      method: POST
      url: "{{ environment.DOCUMENT_PARSER_URL }}"
      body:
        documentType: "{{ trigger.documentType }}"
        extractedText: "{{ ocr_result.text }}"
        confidence_threshold: 0.85
    result: extracted_data

  # Step 5: Validate Extracted Data
  - displayName: "Validate Extracted Data"
    action: core.conditional
    params:
      condition: "{{ extracted_data.confidence > 0.85 }}"
    thenPath:
      - displayName: "Store in Database"
        action: postgres.insert
        params:
          table: "documents"
          data:
            leadId: "{{ trigger.leadId }}"
            documentType: "{{ trigger.documentType }}"
            fileUrl: "{{ trigger.fileUrl }}"
            extractedData: "{{ JSON.stringify(extracted_data) }}"
            confidence: "{{ extracted_data.confidence }}"
            status: "processed"
            processedAt: "{{ now() }}"
    elsePath:
      - displayName: "Low Confidence - Queue for Manual Review"
        action: postgres.insert
        params:
          table: "document_manual_review_queue"
          data:
            leadId: "{{ trigger.leadId }}"
            documentType: "{{ trigger.documentType }}"
            fileUrl: "{{ trigger.fileUrl }}"
            extractedData: "{{ JSON.stringify(extracted_data) }}"
            confidence: "{{ extracted_data.confidence }}"
            status: "pending_review"

  # Step 6: Update Lead Status
  - displayName: "Update Lead Status"
    action: postgres.update
    params:
      table: "leads"
      where:
        id: "{{ trigger.leadId }}"
      data:
        documentsReceived: "{{ now() }}"
        status: "documents_received"

  # Step 7: Notify Lead
  - displayName: "Send Confirmation to Lead"
    action: sendgrid.send_email
    params:
      toEmail: "{{ trigger.leadEmail }}"
      subject: "We Received Your {{ trigger.documentType }}"
      htmlContent: "Document received confirmation"
```

#### 4. CRM Webhook Handler Flow
```yaml
name: "TwentyCRM Webhook Handler"
displayName: "Process incoming webhooks from TwentyCRM"
enabled: true

trigger:
  type: webhook
  displayName: "TwentyCRM Webhook"

steps:
  # Step 1: Validate Webhook Signature
  - displayName: "Validate Webhook Signature"
    action: core.javascript
    params:
      code: |
        const crypto = require('crypto');
        const signature = trigger.headers['x-twenty-signature'];
        const timestamp = trigger.headers['x-twenty-timestamp'];
        const secret = environment.TWENTY_WEBHOOK_SECRET;

        // Check timestamp (prevent replay)
        const requestTime = parseInt(timestamp);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - requestTime > 300) {
          throw new Error('Webhook timestamp too old');
        }

        // Verify signature
        const data = `${timestamp}.${JSON.stringify(trigger.body)}`;
        const hash = crypto
          .createHmac('sha256', secret)
          .update(data)
          .digest('hex');

        if (hash !== signature) {
          throw new Error('Invalid webhook signature');
        }

        return { valid: true };
    result: sig_validation

  # Step 2: Route by Event Type
  - displayName: "Route by Event Type"
    action: core.conditional
    params:
      condition: "{{ trigger.body.event }}"
    branches:
      - value: "contact.created"
        path:
          - displayName: "Handle Contact Created"
            action: postgres.update
            params:
              table: "leads"
              where:
                email: "{{ trigger.body.data.email }}"
              data:
                twentyCrmId: "{{ trigger.body.data.id }}"
                twentyCrmStatus: "synced"
      - value: "contact.updated"
        path:
          - displayName: "Handle Contact Updated"
            action: postgres.update
            params:
              table: "leads"
              where:
                twentyCrmId: "{{ trigger.body.data.id }}"
              data:
                status: "{{ trigger.body.data.customFields.status }}"
                lastUpdatedFromCrm: "{{ now() }}"
      - value: "document.added"
        path:
          - displayName: "Handle Document Added"
            action: core.http_request
            params:
              method: POST
              url: "{{ environment.DOC_PROCESSOR_URL }}"
              body:
                documentId: "{{ trigger.body.data.id }}"
                leadId: "{{ trigger.body.data.leadId }}"
                documentType: "{{ trigger.body.data.type }}"

  # Step 3: Return Success Response
  - displayName: "Return Success"
    action: core.return_response
    params:
      statusCode: 200
      body:
        success: true
        message: "Webhook processed"
```

## 🔧 ACTIVEPIECES PATTERNS & BEST PRACTICES

### Error Handling Pattern
```yaml
errorPath:
  - displayName: "Handle Error"
    action: core.conditional
    params:
      condition: "{{ error.status === 429 }}"
    thenPath:
      - displayName: "Rate Limited - Retry with Backoff"
        action: core.retry_step
        params:
          maxRetries: 3
          backoffType: "exponential"
          initialDelay: 5000
    elsePath:
      - displayName: "Log Error & Alert"
        action: core.log
        params:
          level: "error"
          message: "Operation failed"
          error: "{{ error }}"
      - displayName: "Send Alert to Admin"
        action: sendgrid.send_email
        params:
          toEmail: "{{ environment.ADMIN_EMAIL }}"
          subject: "Flow Error Alert: {{ flowName }}"
          htmlContent: "Error details: {{ error }}"
```

### Idempotency Pattern
```yaml
- displayName: "Check Idempotency"
  action: postgres.query
  params:
    query: >
      SELECT id FROM processed_events
      WHERE idempotency_key = $1
    values:
      - "{{ trigger.id }}"
  result: existing_record

- displayName: "Already Processed?"
  action: core.conditional
  params:
    condition: "{{ existing_record.rows.length > 0 }}"
  thenPath:
    - displayName: "Return Cached Result"
      action: core.return_response
      params:
        statusCode: 200
        body:
          alreadyProcessed: true
  elsePath:
    - displayName: "Process New Event"
      action: core.continue_flow
```

### Rate Limiting Pattern
```yaml
- displayName: "Check Rate Limit"
  action: core.javascript
  params:
    code: |
      const redis = require('redis').createClient({
        host: environment.REDIS_HOST,
        port: environment.REDIS_PORT
      });

      const key = `rate_limit:${trigger.service}`;
      const limit = 100;
      const window = 1000;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.ceil(window / 1000));
      }

      if (current > limit) {
        throw new Error('Rate limit exceeded');
      }

      return { allowed: true, remaining: limit - current };
  result: rate_check
```

## 🐝 ACTIVEPIECES FLOW SWARM

### Flow Coordination Configuration
```yaml
topology: hierarchical
maxFlows: 20
strategy: specialized
runtime: nodejs
batchSize: 100

flows:
  lead_intake:
    enabled: true
    trigger: webhook
    errorHandling: dead_letter_queue
    retryPolicy: exponential_backoff
    maxRetries: 3

  drip_campaign:
    enabled: true
    trigger: event
    parallelization: 50
    timeout: 604800000

  document_processor:
    enabled: true
    trigger: webhook
    parallelization: 10
    timeout: 300000
    errorHandling: manual_review_queue

  crm_webhook:
    enabled: true
    trigger: webhook
    idempotency: required
    timeout: 30000

  email_campaign:
    enabled: true
    trigger: schedule
    batchSize: 1000
    timeout: 3600000

  sms_campaign:
    enabled: true
    trigger: schedule
    batchSize: 500
    rateLimit: 100/sec
    timeout: 1800000
```

## 📈 PERFORMANCE TARGETS

### Flow Performance
- Lead intake: < 3 seconds end-to-end
- Document processing: < 30 seconds with OCR
- CRM sync: < 2 seconds
- Email campaign: < 100ms per email
- SMS campaign: < 50ms per SMS

### Throughput
- 150 lead intakes/minute
- 500 concurrent webhook operations
- 5,000 emails/hour
- 2,500 SMS/hour

### Reliability
- 99.8% flow success rate
- < 0.01% duplicate processing
- Zero data loss (persistent event sourcing)

## 🧪 FLOW TESTING

### Test Configuration
```yaml
testData:
  lead:
    firstName: "John"
    lastName: "Doe"
    email: "john+test@example.com"
    phone: "+12125551234"
    tcpaConsentGiven: true

  webhook:
    event: "contact.created"
    data:
      id: "contact-123"
      email: "john+test@example.com"
```

### Testing Modes
- **Dry Run**: Test flow without side effects
- **Debug Mode**: Step-through with variable inspection
- **Test Execution**: Full execution with test data
- **Performance Profile**: Monitor execution time and resource usage

## 🚀 DEPLOYMENT

### Activepieces Configuration
```yaml
environment:
  ACTIVEPIECES_ENVIRONMENT: production
  ACTIVEPIECES_API_PORT: 3000

  # Database
  DATABASE_URL: "postgres://user:pass@postgres:5432/activepieces"

  # Redis
  REDIS_URL: "redis://redis:6379"

  # External Services
  SENDGRID_API_KEY: "${SENDGRID_API_KEY}"
  TWILIO_ACCOUNT_SID: "${TWILIO_ACCOUNT_SID}"
  TWILIO_AUTH_TOKEN: "${TWILIO_AUTH_TOKEN}"
  TWENTYCRM_API_KEY: "${TWENTYCRM_API_KEY}"

  # Security
  ENCRYPTION_KEY: "${ENCRYPTION_KEY}"
  WEBHOOK_TIMEOUT: 30000
  MAX_LOG_SIZE: 100MB
```

### Monitoring & Observability
- Flow execution metrics (count, duration, success rate)
- Queue depth monitoring
- Error rate by flow
- API response time tracking
- Resource utilization (CPU, memory)

### Alerting
- Flow failure rate > 0.5% → Alert
- Queue depth > 500 → Alert
- Webhook timeout > 30s → Alert
- CRM sync failures → Critical Alert

---

**Activepieces provides the orchestration layer for Nyra's workflow automation. Modular, reusable flows ensure maintainability, and clear error handling prevents data loss and ensures compliance with TCPA regulations.**
