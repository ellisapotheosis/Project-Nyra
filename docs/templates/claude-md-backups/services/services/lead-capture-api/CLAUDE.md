# Lead Capture API - Lead Management Service

## 🎯 SERVICE CONTEXT

**Purpose**: Express.js TypeScript service for capturing, qualifying, enriching, and managing mortgage leads from multiple sources with TwentyCRM integration.

**Port**: 3300
**Language**: TypeScript + Express.js + Bull Queue
**Dependencies**: express, bull, redis, postgresql, axios, @types/node
**Template**: CLAUDE-MD-TypeScript.md (mesh topology for data processing)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Express Development Pattern
**MANDATORY**: All lead endpoints, processors, and integrations MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Lead capture endpoints
  - Write("src/routes/leads.routes.ts", allLeadRoutes)
  - Write("src/routes/webhooks.routes.ts", webhookHandlers)
  - Write("src/routes/qualification.routes.ts", qualificationRoutes)

  // Lead processors
  - Write("src/processors/lead-enrichment.processor.ts", enrichmentLogic)
  - Write("src/processors/duplicate-detection.processor.ts", duplicationCheck)
  - Write("src/processors/lead-scoring.processor.ts", scoringAlgorithm)

  // Integrations
  - Write("src/integrations/twentycrm.integration.ts", crmSync)
  - Write("src/integrations/email-validation.integration.ts", emailValidation)

  // Models and validation
  - Write("src/models/lead.model.ts", leadModel)
  - Write("src/validation/lead.validation.ts", inputValidation)

  // Tests
  - Write("tests/lead-capture.test.ts", leadTests)
  - Bash("pnpm test")
```

### Lead Quality Rules
**CRITICAL**: Every lead MUST be validated and qualified:

- **Required Fields**: First name, last name, email, phone
- **Email Validation**: Syntax + MX record verification + disposable email detection
- **Phone Validation**: E.164 format, valid area code, not VoIP (optional check)
- **Duplicate Detection**: Check email + phone across last 90 days
- **Lead Scoring**: Credit score tier, loan amount, property type, urgency
- **Consent Tracking**: TCPA consent required for automated communications
- **Source Attribution**: Track lead source for ROI analysis
- **Data Enrichment**: Append additional data (location, income estimates)

## 📊 LEAD CAPTURE ARCHITECTURE

### Lead Processing Pipeline
```
Lead Submission → Input Validation → Duplicate Check → Lead Scoring
    ↓
Email/Phone Validation → Data Enrichment → TwentyCRM Sync
    ↓
Campaign Assignment → Queue for Orchestrator → Webhook Notification
    ↓
Response: { leadId, status, score, duplicateStatus, crmId }
```

### Lead Sources

**1. Web Form Submissions**
- RateHunter.net quote calculator
- Nyra Admin manual entry
- Direct API submissions

**2. Third-Party APIs**
- freerateupdate.com API
- lendingtree.com webhooks
- Partner lead aggregators

**3. Webhook Integrations**
- External CRM webhooks
- Marketing platform webhooks
- Lead generation services

## 🐝 LEAD CAPTURE SWARM

### Agent Configuration
```yaml
topology: mesh  # Optimal for data processing workflows
maxAgents: 7
strategy: parallel
language: typescript
framework: express + bull

agents:
  lead_validator:
    role: Input Validation & Sanitization
    focus: [schema-validation, sanitization, type-safety]
    responsibilities:
      - Validate lead data schema
      - Sanitize inputs (XSS prevention)
      - Enforce required fields
      - Normalize phone/email formats
    concurrent_tasks: [multiple-validations, parallel-checks]

  duplicate_detector:
    role: Duplicate Lead Detection
    focus: [fuzzy-matching, database-queries, deduplication]
    responsibilities:
      - Check email exact match
      - Check phone number match
      - Fuzzy name matching
      - Link duplicate leads
    concurrent_tasks: [multiple-checks, parallel-queries]

  lead_scorer:
    role: Lead Qualification Scoring
    focus: [scoring-algorithm, qualification-rules, prioritization]
    responsibilities:
      - Calculate lead score (0-100)
      - Determine qualification tier
      - Assess purchase readiness
      - Prioritize high-value leads
    concurrent_tasks: [multiple-scores, parallel-calculations]

  enrichment_specialist:
    role: Data Enrichment
    focus: [external-apis, data-append, validation]
    responsibilities:
      - Validate email deliverability
      - Enrich with location data
      - Estimate income ranges
      - Append property data
    concurrent_tasks: [multiple-enrichments, parallel-api-calls]

  crm_integrator:
    role: TwentyCRM Synchronization
    focus: [graphql-api, bidirectional-sync, conflict-resolution]
    responsibilities:
      - Sync leads to TwentyCRM
      - Handle CRM webhooks
      - Resolve sync conflicts
      - Track sync status
    concurrent_tasks: [multiple-syncs, parallel-operations]

  queue_manager:
    role: Bull Queue Management
    focus: [job-processing, retry-logic, error-handling]
    responsibilities:
      - Manage processing queues
      - Handle job failures
      - Implement retry strategies
      - Monitor queue health
    concurrent_tasks: [multiple-queues, parallel-processing]

  webhook_handler:
    role: Webhook Event Processing
    focus: [signature-validation, event-routing, idempotency]
    responsibilities:
      - Validate webhook signatures
      - Route events to processors
      - Ensure idempotent processing
      - Send webhook responses
    concurrent_tasks: [multiple-webhooks, parallel-processing]
```

## 🔧 EXPRESS + TYPESCRIPT PATTERNS

### Lead Model with Validation
```typescript
import { IsEmail, IsPhoneNumber, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum LeadSource {
  WEB_FORM = 'web_form',
  API = 'api',
  WEBHOOK = 'webhook',
  MANUAL = 'manual',
  PARTNER = 'partner'
}

export enum LeadStatus {
  NEW = 'new',
  QUALIFIED = 'qualified',
  DISQUALIFIED = 'disqualified',
  DUPLICATE = 'duplicate',
  CONTACTED = 'contacted',
  CONVERTED = 'converted'
}

export class CreateLeadDto {
  @MinLength(2)
  firstName!: string;

  @MinLength(2)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber('US')
  phone!: string;

  @IsOptional()
  loanAmount?: number;

  @IsOptional()
  propertyType?: string;

  @IsOptional()
  propertyState?: string;

  @IsOptional()
  propertyZip?: string;

  @IsOptional()
  creditScoreTier?: 'excellent' | 'good' | 'fair' | 'poor';

  @IsEnum(LeadSource)
  source!: LeadSource;

  @IsOptional()
  sourceDetails?: string;

  // TCPA Consent
  tcpaConsentGiven!: boolean;
  tcpaConsentTimestamp!: Date;
  tcpaConsentIpAddress?: string;

  // UTM Parameters
  @IsOptional()
  utmSource?: string;

  @IsOptional()
  utmMedium?: string;

  @IsOptional()
  utmCampaign?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanAmount?: number;
  propertyType?: string;
  propertyState?: string;
  propertyZip?: string;
  creditScoreTier?: string;
  source: LeadSource;
  sourceDetails?: string;
  status: LeadStatus;
  leadScore: number;
  isDuplicate: boolean;
  originalLeadId?: string;
  tcpaConsentGiven: boolean;
  tcpaConsentTimestamp: Date;
  tcpaConsentIpAddress?: string;
  emailValidated: boolean;
  phoneValidated: boolean;
  enrichmentData?: any;
  twentyCrmId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}
```

### Lead Capture Endpoint
```typescript
import express, { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LeadQueue } from '../queues/lead.queue';
import { CreateLeadDto } from '../models/lead.model';

const router = express.Router();
const leadQueue = new LeadQueue();

router.post('/leads', async (req: Request, res: Response) => {
  try {
    // Transform and validate input
    const createLeadDto = plainToClass(CreateLeadDto, req.body);
    const errors = await validate(createLeadDto);

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.map(e => ({
          field: e.property,
          constraints: e.constraints
        }))
      });
    }

    // Check TCPA consent
    if (!createLeadDto.tcpaConsentGiven) {
      return res.status(400).json({
        error: 'TCPA consent required',
        message: 'Cannot process lead without TCPA consent for automated communications'
      });
    }

    // Create lead record (quick response)
    const lead = await prisma.lead.create({
      data: {
        ...createLeadDto,
        status: LeadStatus.NEW,
        leadScore: 0, // Will be calculated by processor
        emailValidated: false,
        phoneValidated: false
      }
    });

    // Queue for async processing
    await leadQueue.add('process-lead', {
      leadId: lead.id,
      operations: [
        'duplicate-check',
        'email-validation',
        'phone-validation',
        'lead-scoring',
        'data-enrichment',
        'crm-sync',
        'campaign-assignment'
      ]
    });

    // Return quick response
    return res.status(202).json({
      leadId: lead.id,
      status: 'processing',
      message: 'Lead received and queued for processing',
      estimatedProcessingTime: '5-10 seconds'
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return res.status(500).json({ error: 'Failed to process lead' });
  }
});

router.get('/leads/:leadId/status', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.status(200).json({
      leadId: lead.id,
      status: lead.status,
      leadScore: lead.leadScore,
      isDuplicate: lead.isDuplicate,
      originalLeadId: lead.originalLeadId,
      emailValidated: lead.emailValidated,
      phoneValidated: lead.phoneValidated,
      twentyCrmId: lead.twentyCrmId,
      processedAt: lead.updatedAt
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: 'Failed to retrieve status' });
  }
});

export default router;
```

### Bull Queue Processing
```typescript
import Queue from 'bull';
import { Lead, LeadStatus } from '../models/lead.model';
import { DuplicateDetector } from '../services/duplicate-detector.service';
import { EmailValidator } from '../services/email-validator.service';
import { LeadScorer } from '../services/lead-scorer.service';
import { TwentyCRMService } from '../integrations/twentycrm.integration';

export class LeadQueue {
  private queue: Queue.Queue;

  constructor() {
    this.queue = new Queue('lead-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.registerProcessors();
  }

  async add(jobName: string, data: any): Promise<void> {
    await this.queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  private registerProcessors(): void {
    this.queue.process('process-lead', async (job) => {
      const { leadId, operations } = job.data;

      const lead = await prisma.lead.findUnique({ where: { id: leadId } });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // Run operations in parallel where possible
      const results = await Promise.allSettled([
        operations.includes('duplicate-check') ? this.checkDuplicate(lead) : null,
        operations.includes('email-validation') ? this.validateEmail(lead) : null,
        operations.includes('phone-validation') ? this.validatePhone(lead) : null,
        operations.includes('lead-scoring') ? this.scoreLead(lead) : null,
        operations.includes('data-enrichment') ? this.enrichLead(lead) : null
      ]);

      // After all operations, sync to CRM
      if (operations.includes('crm-sync')) {
        await this.syncToCRM(lead);
      }

      // Assign to campaign
      if (operations.includes('campaign-assignment') && !lead.isDuplicate) {
        await this.assignCampaign(lead);
      }

      return { leadId, results };
    });
  }

  private async checkDuplicate(lead: Lead): Promise<void> {
    const duplicateDetector = new DuplicateDetector();
    const duplicate = await duplicateDetector.findDuplicate(lead);

    if (duplicate) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          isDuplicate: true,
          originalLeadId: duplicate.id,
          status: LeadStatus.DUPLICATE
        }
      });
    }
  }

  private async validateEmail(lead: Lead): Promise<void> {
    const emailValidator = new EmailValidator();
    const valid = await emailValidator.validate(lead.email);

    await prisma.lead.update({
      where: { id: lead.id },
      data: { emailValidated: valid }
    });
  }

  private async validatePhone(lead: Lead): Promise<void> {
    // Phone validation logic
    const phoneValid = /^\+1[0-9]{10}$/.test(lead.phone);

    await prisma.lead.update({
      where: { id: lead.id },
      data: { phoneValidated: phoneValid }
    });
  }

  private async scoreLead(lead: Lead): Promise<void> {
    const leadScorer = new LeadScorer();
    const score = await leadScorer.calculateScore(lead);

    const status = score >= 70 ? LeadStatus.QUALIFIED :
                   score >= 40 ? LeadStatus.NEW :
                   LeadStatus.DISQUALIFIED;

    await prisma.lead.update({
      where: { id: lead.id },
      data: { leadScore: score, status }
    });
  }

  private async enrichLead(lead: Lead): Promise<void> {
    // Data enrichment logic
    // Call external APIs for additional data
  }

  private async syncToCRM(lead: Lead): Promise<void> {
    const crmService = new TwentyCRMService();
    const crmId = await crmService.syncLead(lead);

    await prisma.lead.update({
      where: { id: lead.id },
      data: { twentyCrmId: crmId }
    });
  }

  private async assignCampaign(lead: Lead): Promise<void> {
    // Assign to appropriate campaign based on lead score and status
    // Call campaign-engine API
  }
}
```

## 📈 PERFORMANCE TARGETS

### API Performance
- Lead submission: < 100ms p95 latency (synchronous part)
- Async processing: < 10 seconds total
- Duplicate check: < 200ms
- Lead scoring: < 300ms

### Throughput
- 100 leads per minute sustained
- 1000 concurrent API requests
- Queue processing: 50 leads per second

## 🧪 TESTING REQUIREMENTS

```typescript
describe('Lead Capture API', () => {
  it('should create lead with valid data', async () => {
    const response = await request(app)
      .post('/leads')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+12125551234',
        loanAmount: 300000,
        source: 'web_form',
        tcpaConsentGiven: true,
        tcpaConsentTimestamp: new Date()
      });

    expect(response.status).toBe(202);
    expect(response.body).toHaveProperty('leadId');
  });

  it('should reject lead without TCPA consent', async () => {
    const response = await request(app)
      .post('/leads')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+12125551234',
        tcpaConsentGiven: false
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('TCPA consent');
  });
});
```

---

**This service is the front door for all leads entering Project Nyra. Quality control here determines campaign success and ROI. Every lead must be validated, scored, and synced properly.**
