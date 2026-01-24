# SendGrid Integration Service

## 🎯 SERVICE CONTEXT

**Purpose**: Automated email delivery for mortgage document requests, loan status updates, and customer communications. Enables transactional and marketing emails with high deliverability, template management, and compliance tracking.

**Capabilities**:
- **Transactional Emails**: Document request confirmations, loan status updates, rate quotes
- **Email Templates**: Dynamic personalization with borrower data and document links
- **Batch Sending**: Efficient bulk email campaigns for notifications
- **Webhook Handling**: Real-time delivery/bounce/click tracking callbacks
- **Compliance**: GDPR, CAN-SPAM, unsubscribe management
- **Rate Limiting**: SendGrid throttling and cost optimization
- **Email Analytics**: Open rates, click rates, bounce tracking

**Technology Stack**:
- SendGrid Node.js SDK (mail and events API)
- Express.js for webhook endpoints
- MongoDB for email history and templates
- Rate Limiter Flexible for intelligent throttling
- Winston for structured logging
- Handlebars for email templating

## 🚨 CRITICAL DEVELOPMENT RULES

### Email Rate Limiting & Deliverability (MANDATORY)
**Maintain sender reputation to ensure inbox delivery:**

```typescript
// REQUIRED: SendGrid reputation management
const emailRateLimiter = new RateLimiterMemory({
  points: 100,            // Max 100 emails per lead per day
  duration: 86400,        // Per 24 hours
  blockDuration: 3600     // Block for 1 hour if exceeded
});

// REQUIRED: Monitor bounce rate (SendGrid hard limit: 5%)
const monitorBounceRate = async () => {
  const stats = await sendGridClient.stats.get();
  const bounceRate = stats.bounces / (stats.sent || 1);

  if (bounceRate > 0.05) {
    // Alert and pause sending
    await pauseEmailCampaigns();
    await sendAlert(`CRITICAL: Bounce rate ${(bounceRate * 100).toFixed(2)}% exceeds 5% threshold`);
  }
};

// REQUIRED: Warm-up new IP addresses gradually
const ipWarmupSchedule = {
  day1: 100,              // 100 emails
  day2: 500,              // 500 emails
  day3: 1000,
  day4: 2000,
  day5: 5000,
  day6: 10000,
  day7: 50000             // Ramp to production volume over 7 days
};
```

### Webhook Security & Verification (MANDATORY)
**Verify all SendGrid webhooks with request validation:**

```typescript
// REQUIRED: Validate SendGrid webhook signature
import crypto from 'crypto';

const validateSendGridWebhook = (req: Request): boolean => {
  const signature = req.headers['x-twilio-email-event-webhook-signature'];
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];
  const body = req.rawBody; // Must be raw body buffer, not parsed JSON

  if (!signature || !timestamp) return false;

  // Verify timestamp is within 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - Number(timestamp)) > 300) return false;

  // Verify signature
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
  const signedContent = `${timestamp}${body}`;

  const verification = crypto
    .createVerify('RSA-SHA256')
    .update(signedContent)
    .verify(publicKey, signature, 'base64');

  return verification;
};

// Use in Express middleware
app.post('/webhooks/email/events', (req, res, next) => {
  if (!validateSendGridWebhook(req)) {
    return res.status(403).send('Unauthorized');
  }
  next();
});
```

### Idempotency & Duplicate Prevention (MANDATORY)
**Prevent duplicate emails due to webhook retries:**

```typescript
// REQUIRED: Idempotency key to prevent duplicates
const sendEmailIdempotent = async (emailRequest: EmailRequest) => {
  // Idempotency key: {recipientEmail}-{documentId}-{campaignId}-{timestamp}
  const idempotencyKey = `${emailRequest.to}-${emailRequest.documentId}-${emailRequest.campaignId}-${Math.floor(Date.now() / 1000)}`;

  // Check if already sent
  const existing = await EmailHistoryModel.findOne({ idempotencyKey });
  if (existing) {
    return existing;
  }

  // Retry with exponential backoff (3 attempts)
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const msg = {
        to: emailRequest.to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: emailRequest.subject,
        html: emailRequest.html,
        headers: {
          'X-Idempotency-Key': idempotencyKey
        },
        categories: [emailRequest.category],
        customargs: {
          leadId: emailRequest.leadId,
          campaignId: emailRequest.campaignId,
          documentType: emailRequest.documentType
        }
      };

      const result = await sgMail.send(msg);

      await EmailHistoryModel.create({
        idempotencyKey,
        messageId: result[0].headers['x-message-id'],
        recipientEmail: emailRequest.to,
        category: emailRequest.category,
        status: 'sent',
        createdAt: new Date()
      });

      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
};
```

## 📊 SERVICE ARCHITECTURE

### SendGrid Service Structure
```
services/sendgrid-integration/
├── src/
│   ├── config/
│   │   ├── sendgrid.config.ts       # SendGrid credentials and settings
│   │   ├── rate-limiter.config.ts   # Rate limiting rules
│   │   └── email-templates.config.ts # Template definitions
│   ├── models/
│   │   ├── email-history.model.ts   # Email records with status
│   │   ├── email-template.model.ts  # Custom email templates
│   │   ├── unsubscribe.model.ts     # Unsubscribe list (GDPR)
│   │   ├── bounce-log.model.ts      # Hard/soft bounce tracking
│   │   └── email-campaign.model.ts  # Campaign tracking
│   ├── services/
│   │   ├── email.service.ts         # Core email sending logic
│   │   ├── template.service.ts      # Handlebars template rendering
│   │   ├── webhook.service.ts       # SendGrid event processing
│   │   ├── rate-limiter.service.ts  # Delivery rate management
│   │   ├── retry.service.ts         # Exponential backoff retry
│   │   ├── compliance.service.ts    # GDPR/CAN-SPAM handling
│   │   └── analytics.service.ts     # Email metrics and reporting
│   ├── controllers/
│   │   ├── email.controller.ts      # Email sending endpoints
│   │   ├── template.controller.ts   # Template management
│   │   ├── webhook.controller.ts    # Webhook handlers
│   │   └── analytics.controller.ts  # Metrics endpoints
│   ├── middleware/
│   │   ├── sendgrid-validation.ts   # Webhook signature validation
│   │   ├── rate-limit.ts            # Rate limit enforcement
│   │   └── error-handler.ts         # Error responses
│   ├── utils/
│   │   ├── cost-calculator.ts       # SendGrid cost estimation
│   │   ├── email-validator.ts       # Email format validation
│   │   └── unsubscribe-manager.ts   # List unsubscribe handling
│   ├── types/
│   │   └── sendgrid.types.ts        # TypeScript interfaces
│   ├── routes/
│   │   ├── email.routes.ts          # Email route definitions
│   │   ├── template.routes.ts       # Template route definitions
│   │   └── webhook.routes.ts        # Webhook route definitions
│   ├── index.ts                     # Express server bootstrap
│   └── logger.ts                    # Winston logging config
├── tests/
│   ├── unit/
│   │   ├── email.service.test.ts
│   │   ├── template.service.test.ts
│   │   ├── rate-limiter.test.ts
│   │   └── compliance.test.ts
│   ├── integration/
│   │   ├── email-webhook.test.ts
│   │   ├── bounce-handling.test.ts
│   │   └── retry-logic.test.ts
│   └── fixtures/
│       └── sendgrid-responses.json
├── docs/
│   ├── WEBHOOK-SETUP.md             # Webhook URL configuration
│   ├── TEMPLATE-GUIDE.md            # Email template syntax
│   ├── COMPLIANCE.md                # GDPR and CAN-SPAM guidance
│   └── DELIVERABILITY.md            # Sender reputation tips
├── package.json
├── tsconfig.json
└── CLAUDE.md                        # This file
```

### Webhook Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/webhooks/email/events` | POST | Email delivery, bounce, click events | 200 OK |
| `/webhooks/email/bounce` | POST | Hard/soft bounce notification | 200 OK |
| `/webhooks/email/unsubscribe` | POST | Unsubscribe request | 200 OK |
| `/api/email/send` | POST | Send email | `{ messageId, status }` |
| `/api/email/send-batch` | POST | Batch send emails | `{ sent, failed, queued }` |
| `/api/templates` | GET/POST | List/create email templates | Templates array |
| `/api/templates/:id` | GET/PUT/DELETE | Manage template | Template object |
| `/api/analytics` | GET | Campaign metrics | Analytics data |

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents

```yaml
agents:
  sendgrid_architect:
    role: SendGrid API design and email strategy
    focus: [email-design, template-architecture, webhook-strategy]
    responsibilities:
      - Design email template system
      - Plan webhook event processing
      - Implement compliance mechanisms
      - Optimize SendGrid API usage

  email_designer:
    role: Email template creation and conversion optimization
    focus: [html-email, responsive-design, compliance]
    responsibilities:
      - Create responsive email templates
      - Optimize for mobile/desktop rendering
      - Implement dynamic content blocks
      - Ensure GDPR compliance

  compliance_specialist:
    role: Email compliance and deliverability
    focus: [gdpr, can-spam, spf-dkim, sender-reputation]
    responsibilities:
      - Implement GDPR consent management
      - Set up CAN-SPAM compliance
      - Configure SPF/DKIM/DMARC records
      - Monitor sender reputation and bounce rates

  rate_limiter_expert:
    role: SendGrid rate limiting and cost optimization
    focus: [rate-limiting, batch-operations, ip-warmup]
    responsibilities:
      - Implement delivery rate limiting
      - Design batch sending schedules
      - Plan IP address warm-up sequences
      - Monitor SendGrid quotas

  webhook_processor:
    role: Event-driven email status handling
    focus: [event-processing, idempotency, retry-logic]
    responsibilities:
      - Process SendGrid event webhooks
      - Implement bounce/complaint handling
      - Track email delivery metrics
      - Ensure exactly-once delivery
```

### Recommended Workflows

**1. Email Template Design (Tier 2/3)**
```bash
# Get routing recommendation for template design
npx @claude-flow/cli@latest hooks pre-task \
  --description "Design responsive mortgage document email template with personalization"

# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized

# Spawn agents
# 1. sendgrid_architect - Template structure
# 2. email_designer - HTML/CSS implementation
# 3. compliance_specialist - GDPR/CAN-SPAM
# 4. coder - Integration code
```

**2. Webhook Configuration (Tier 1 - Agent Booster)**
```bash
npx @claude-flow/cli@latest hooks pre-task \
  --description "Add SendGrid webhook signature validation"
# Intent: add-error-handling
# Agent Booster can implement validation directly
```

**3. Email Campaign Launch (Tier 3 - Sonnet)**
```bash
npx @claude-flow/cli@latest hooks pre-task \
  --description "Launch mortgage document request email campaign with rate limiting"

# Spawn full team for campaign planning
```

### Memory Operations

```bash
# Search for email templates
npx @claude-flow/cli@latest memory search \
  --query "high-converting mortgage document request emails" \
  --namespace patterns

# Store successful template
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "email-template-doc-request" \
  --value '{"open_rate": 0.32, "click_rate": 0.18, "template_id": "sg-template-123"}'

# Store rate limiting strategy
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "sendgrid-rate-optimization" \
  --value '{"batch_size": 500, "per_day_limit": 50000, "warmup_days": 7}'

# Search compliance patterns
npx @claude-flow/cli@latest memory search \
  --query "GDPR email compliance unsubscribe handling" \
  --namespace patterns
```

## 🔌 WEBHOOK HANDLING DETAILS

### Email Event Webhook

```typescript
// POST /webhooks/email/events
// Single event example
{
  email: "borrower@example.com",
  event: "delivered|opened|clicked|bounce|dropped|unsubscribe",
  timestamp: 1614556800,
  "message-id": "D7jK8kL9mN0pQrStUvWxYz",
  category: ["mortgage-documents", "loan-status"],
  sg_event_id: "sendgrid_internal_id",

  // For click events
  url: "https://documents.example.com/download/123",

  // For bounce/complaint events
  reason: "Unrecognized email address",
  status: "5.1.1"
}

// Webhook events sent as array
[
  { email: "user1@example.com", event: "delivered" },
  { email: "user2@example.com", event: "opened" },
  { email: "user3@example.com", event: "bounce", reason: "Invalid address" }
]
```

### Bounce Event Details

```typescript
// Hard bounce (permanent - recipient doesn't exist)
{
  email: "invalid@example.com",
  event: "bounce",
  type: "permanent",
  reason: "Unrecognized email address",
  status: "5.1.1"
}

// Soft bounce (temporary - mailbox full)
{
  email: "user@example.com",
  event: "bounce",
  type: "temporary",
  reason: "Recipient's mailbox was full",
  status: "4.2.2"
}

// Response: Add to bounce list, don't retry
// Hard bounce: Remove from all lists (prevent future sends)
// Soft bounce: Retry with backoff (max 3 times)
```

### Unsubscribe Event

```typescript
// POST /webhooks/email/unsubscribe
{
  email: "borrower@example.com",
  event: "unsubscribe",
  timestamp: 1614556800,
  category: ["mortgage-documents"]
}

// Response: Immediately stop sending to this email
// Store in unsubscribe list, check before every send
```

## 🚦 RATE LIMITING & RETRY LOGIC

### Rate Limiting Strategy

```typescript
// Tier 1: Per-recipient rate limit (prevent spam perception)
const perRecipientLimit = {
  points: 20,             // Max 20 emails per recipient
  duration: 2592000,      // Per 30 days
  blockDuration: 86400    // Block for 24 hours if exceeded
};

// Tier 2: Per-campaign rate limit (manage sending volume)
const perCampaignLimit = {
  points: 10000,          // Max 10k emails per batch
  duration: 3600,         // Per hour
  blockDuration: 1800     // Back off 30 min if exceeded
};

// Tier 3: Account-level rate limit (SendGrid quotas)
const accountLimit = {
  emailsPerSecond: 40,    // SendGrid limit: 40 req/sec
  emailsPerDay: 1000000,  // SendGrid plan-dependent
  monthlyQuota: 500000,   // Monthly plan quota
  costAlert: 1000         // Alert when monthly SendGrid cost > $1000
};

// IP Reputation monitoring
const ipReputationLimits = {
  bounceRateThreshold: 0.05,      // Alert if bounce rate > 5%
  complaintRateThreshold: 0.001,  // Alert if complaint rate > 0.1%
  unsubscribeRateThreshold: 0.001, // Alert if unsubscribe > 0.1%
  pauseSendingAt: 0.08            // Hard stop if bounce rate > 8%
};
```

### Retry Logic with Exponential Backoff

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 2000,        // 2 seconds
  maxDelay: 60000,        // 60 seconds
  backoffMultiplier: 2,   // 2x exponential
  jitter: true            // Add randomness
};

// Retry logic matrix:
// 429 Too Many Requests: RETRY (rate limit)
// 500+ Server Error: RETRY (transient)
// 400 Bad Request: FAIL (permanent)
// 401 Unauthorized: FAIL (config error)
// 403 Forbidden: FAIL (permissions)

// Exponential backoff: 2s, 4s, 8s (with jitter)
// Example: 2s, 5s, 11s

// Idempotency: Include 'X-Idempotency-Key' header
// SendGrid will return same messageId if duplicate detected
```

### Bounce Handling

```typescript
// Monitor bounce events in real-time
const processBounceEvent = async (event: BounceEvent) => {
  if (event.type === 'permanent') {
    // Hard bounce: Remove from all lists
    await BounceModel.create({
      email: event.email,
      type: 'hard',
      reason: event.reason,
      timestamp: new Date()
    });

    // Don't retry, add to suppression list
    await sendGridClient.suppressions.bounces.add([event.email]);

  } else {
    // Soft bounce: Retry with backoff
    await BounceModel.create({
      email: event.email,
      type: 'soft',
      retryCount: 0,
      timestamp: new Date()
    });

    // Schedule retry for later
    await scheduleRetry(event.email, 1800000); // Retry in 30 minutes
  }
};
```

## 💰 COST OPTIMIZATION STRATEGIES

### SendGrid Pricing & Optimization

```typescript
// SendGrid Pricing
const sendgridPricing = {
  free: {
    limit: 100,           // 100 emails/day
    cost: 0
  },
  pro: {
    limit: 500000,        // 500k emails/month
    cost: 29.95,
    costPer1k: 0.060      // ~$0.06 per 1000 emails
  },
  advanced: {
    limit: 5000000,       // 5M emails/month
    cost: 99.95,
    costPer1k: 0.020      // ~$0.02 per 1000 emails
  },
  custom: {
    limit: 'unlimited',
    cost: 'custom',
    costPer1k: 0.010      // ~$0.01 per 1000 emails at volume
  }
};

// Cost Optimization:
// 1. Batch sends: Group email requests (reduces API calls)
// 2. Template reuse: Use SendGrid dynamic templates
// 3. Segment lists: Send only to engaged recipients
// 4. Monitor bounce rate: High bounces waste quota
// 5. Use bulk send API: Up to 1M recipients per request

// Example: Calculate campaign cost
const estimateCampaignCost = (recipientCount: number, plan: 'pro' | 'advanced'): number => {
  const pricing = sendgridPricing[plan];
  return (recipientCount / 1000) * pricing.costPer1k;
};

// Monitor usage and estimate monthly cost
const monitorMonthlyUsage = async () => {
  const stats = await sendGridClient.stats.get();
  const emailsSent = stats.requests;
  const estimatedCost = (emailsSent / 1000) * 0.020; // Assuming Advanced plan

  if (estimatedCost > 500) { // Alert threshold
    await sendAlert(`Monthly SendGrid cost estimate: $${estimatedCost.toFixed(2)}`);
  }
};
```

### Batch Sending Optimization

```typescript
// Batch send API is most efficient
const batchSend = async (emails: EmailRequest[]): Promise<BatchResult> => {
  // Group by similar send times to optimize batching
  const batches = groupEmailsByTime(emails);

  const results = await Promise.all(
    batches.map(batch => sendGridClient.mail.send.batch(batch))
  );

  return {
    sent: results.filter(r => r.statusCode === 202).length,
    failed: results.filter(r => r.statusCode !== 202).length
  };
};

// Batch API benefits:
// - Single HTTP request for 1000 emails
// - Reduced API call overhead
// - Better throughput (40 requests/sec limit)
// - Lower cost per email

const sendGridBatchLimits = {
  maxRecipientsPerRequest: 1000,
  maxBatchSize: 1000000,  // 1M emails per batch
  maxRequestsPerSecond: 40
};
```

## 📝 EMAIL TEMPLATING

### SendGrid Dynamic Templates

```typescript
// Define email templates in SendGrid
const emailTemplates = {
  documentRequest: {
    id: 'sg-template-doc-request',
    name: 'Mortgage Document Request',
    variables: [
      'firstName',      // {{firstName}}
      'loanOfficer',
      'documentType',
      'downloadUrl',
      'deadline',
      'supportPhone'
    ]
  },

  loanStatus: {
    id: 'sg-template-loan-status',
    name: 'Loan Status Update',
    variables: [
      'firstName',
      'loanNumber',
      'currentStatus', // 'Under Review', 'Approved', 'Conditionally Approved'
      'nextSteps',
      'estimatedClosing',
      'loanOfficer'
    ]
  },

  rateQuote: {
    id: 'sg-template-rate-quote',
    name: 'Personalized Rate Quote',
    variables: [
      'firstName',
      'propertyType',
      'loanAmount',
      'rate',
      'points',
      'estimatedPayment',
      'quoteExpiration',
      'applyUrl'
    ]
  }
};

// Send email with template
const sendTemplateEmail = async (request: TemplateEmailRequest) => {
  const msg = {
    to: request.recipientEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId: request.templateId,
    dynamicTemplateData: {
      firstName: request.borrower.firstName,
      loanOfficer: request.loanOfficer.name,
      documentType: request.document.type,
      downloadUrl: request.document.downloadUrl,
      deadline: request.deadline.toISOString().split('T')[0],
      supportPhone: process.env.SUPPORT_PHONE
    },
    categories: ['mortgage-documents', request.borrower.state],
    customArgs: {
      leadId: request.borrower._id.toString(),
      campaignId: request.campaign._id.toString(),
      documentId: request.document._id.toString()
    }
  };

  return sgMail.send(msg);
};
```

### Handlebars Template System (Fallback)

```typescript
// For custom emails, use Handlebars
const emailTemplates = {
  customDocument: `
    <h2>Hello {{firstName}},</h2>
    <p>Your {{documentType}} is ready for review.</p>
    {{#if urgent}}
      <p style="color: red;"><strong>Please review by {{deadline}}</strong></p>
    {{/if}}
    <a href="{{downloadUrl}}" class="btn">Download Document</a>
    <p>Questions? Call us at {{supportPhone}}</p>
  `
};

// Render template with data
const renderTemplate = (template: string, data: Record<string, any>): string => {
  const compiled = Handlebars.compile(template);
  return compiled(data);
};

// Add custom helpers for mortgage-specific formatting
Handlebars.registerHelper('currency', (value: number) => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
});

Handlebars.registerHelper('rate', (value: number) => {
  return `${value.toFixed(3)}%`;
});
```

## 🧪 TESTING & DEPLOYMENT

### Unit Tests

```typescript
describe('Email Service', () => {
  it('should rate limit emails per recipient', async () => {
    const service = new EmailService();
    const recipientEmail = 'borrower@example.com';

    // Send 20 emails (within limit)
    for (let i = 0; i < 20; i++) {
      const result = await service.sendEmail({
        to: recipientEmail,
        subject: `Email ${i + 1}`,
        html: `Content ${i + 1}`
      });
      expect(result.status).toBe('sent');
    }

    // 21st email should be blocked
    const blocked = await service.sendEmail({
      to: recipientEmail,
      subject: 'Email 21',
      html: 'Content 21'
    });
    expect(blocked.status).toBe('rate_limited');
  });

  it('should validate SendGrid webhook signature', async () => {
    const middleware = sendgridValidationMiddleware();
    const req = { headers: { 'x-twilio-email-event-webhook-signature': 'invalid' } };
    const res = { status: jest.fn().returnThis(), send: jest.fn() };

    middleware(req as any, res as any, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should prevent duplicate emails with idempotency key', async () => {
    const service = new EmailService();
    const request = {
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      idempotencyKey: 'unique-key-123'
    };

    const result1 = await service.sendEmail(request);
    const result2 = await service.sendEmail(request);

    // Both should return same messageId
    expect(result1.messageId).toBe(result2.messageId);
  });
});
```

### Integration Tests

```typescript
describe('Email Webhook', () => {
  it('should process email delivered event', async () => {
    const response = await request(app)
      .post('/webhooks/email/events')
      .set('X-Twilio-Email-Event-Webhook-Signature', validSignature)
      .set('X-Twilio-Email-Event-Webhook-Timestamp', Date.now().toString())
      .send([{
        email: 'borrower@example.com',
        event: 'delivered',
        'message-id': 'MSG123'
      }]);

    expect(response.status).toBe(200);
    const record = await EmailHistoryModel.findOne({ messageId: 'MSG123' });
    expect(record.status).toBe('delivered');
  });

  it('should handle hard bounce and stop sending', async () => {
    const response = await request(app)
      .post('/webhooks/email/events')
      .set('X-Twilio-Email-Event-Webhook-Signature', validSignature)
      .set('X-Twilio-Email-Event-Webhook-Timestamp', Date.now().toString())
      .send([{
        email: 'invalid@example.com',
        event: 'bounce',
        type: 'permanent',
        reason: 'Unrecognized email address'
      }]);

    expect(response.status).toBe(200);
    const bounce = await BounceModel.findOne({ email: 'invalid@example.com' });
    expect(bounce.type).toBe('hard');
  });
});
```

### Pre-Deployment Checklist

- [ ] All email templates responsive on mobile
- [ ] Rate limits configured for all tiers
- [ ] SendGrid webhook URLs configured in dashboard
- [ ] Request signature validation tested
- [ ] Bounce rate monitoring set up
- [ ] Hard bounce suppression list enabled
- [ ] Unsubscribe links present in all emails
- [ ] GDPR consent verified before sending
- [ ] SPF/DKIM/DMARC records configured
- [ ] Test email delivery to all regions
- [ ] Staging environment matches production
- [ ] 100% test coverage on critical paths

## 🔄 AUTO-LEARNING PROTOCOL

### Before Email Campaign Launch
```bash
# Search for successful email templates
npx @claude-flow/cli@latest memory search \
  --query "high-converting mortgage document request emails" \
  --namespace patterns

# Load compliance patterns
npx @claude-flow/cli@latest memory search \
  --query "GDPR email compliance best practices" \
  --namespace patterns

# Load rate limiting strategy
npx @claude-flow/cli@latest memory search \
  --query "SendGrid batch sending optimization" \
  --namespace patterns
```

### After Campaign Execution
```bash
# Store campaign results
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "email-campaign-results-$(date +%Y%m%d)" \
  --value '{"open_rate": 0.32, "click_rate": 0.18, "bounce_rate": 0.01, "unsubscribe_rate": 0.002, "cost": 125.50}'

# Train neural patterns on success
npx @claude-flow/cli@latest neural train \
  --pattern-type email-optimization \
  --epochs 10

# Record metrics
npx @claude-flow/cli@latest hooks post-task \
  --task-id "email-campaign-001" \
  --success true \
  --store-results true
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns and swarm coordination
- **WEBHOOK-SETUP.md**: Complete webhook URL configuration in SendGrid dashboard
- **TEMPLATE-GUIDE.md**: Email template syntax and best practices
- **COMPLIANCE.md**: GDPR, CAN-SPAM, and unsubscribe management
- **DELIVERABILITY.md**: Sender reputation and bounce rate management

---

**SendGrid integration enables reliable email delivery for mortgage documents with high deliverability, compliance tracking, and real-time event processing. Strict rate limiting and bounce monitoring maintain sender reputation.**
