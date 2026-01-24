# Twilio Integration Service

## 🎯 SERVICE CONTEXT

**Purpose**: Automated lead follow-up communications via SMS and voice calls for mortgage drip campaigns. Enables personalized, real-time customer engagement through Twilio's communication platform.

**Capabilities**:
- **SMS Campaigns**: Send automated lead follow-up texts with personalized mortgage rate offers
- **Voice Calling**: Outbound IVR (Interactive Voice Response) calls for mortgage consultations
- **Drip Campaigns**: Sequence SMS/voice messages based on lead engagement
- **Webhook Handling**: Real-time inbound SMS/call routing and status callbacks
- **Rate Limiting**: Compliance with Twilio throttling and cost optimization
- **Message Templating**: Dynamic personalization with lead data

**Technology Stack**:
- Twilio Node.js SDK v4+
- Express.js for webhook endpoints
- MongoDB for conversation/call history
- Rate Limiter Flexible for intelligent throttling
- Winston for structured logging

## 🚨 CRITICAL DEVELOPMENT RULES

### Rate Limiting & Cost Optimization (MANDATORY)
**Enforce strict rate limits to prevent bill shock:**

```typescript
// REQUIRED: Rate limit by phone number + campaign
const rateLimiter = new RateLimiterMemory({
  points: 3,           // Max 3 messages per window
  duration: 3600,      // Per hour
  blockDuration: 1800  // Block for 30 min if exceeded
});

// Cost optimization: Batch SMS operations
const batchSMS = async (messages: Message[]) => {
  // Group by recipient country for zone-based pricing
  // SMS to US: $0.01/msg, International: $0.02-$0.75/msg
  // Voice: $0.013/min + $0.015/min termination
  const grouped = groupByCountry(messages);
  return Promise.all(grouped.map(batch => sendBatch(batch)));
};
```

### Webhook Security (MANDATORY)
**Verify all Twilio webhooks with request validation:**

```typescript
// REQUIRED: Validate Twilio request signature
import twilio from 'twilio';

const validateTwilioWebhook = (req: Request): boolean => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const url = `${process.env.WEBHOOK_URL}${req.originalUrl}`;
  return twilio.validateRequest(authToken, req.headers['x-twilio-signature'], url, req.body);
};

// Use in Express middleware
app.post('/webhooks/sms', (req, res, next) => {
  if (!validateTwilioWebhook(req)) {
    return res.status(403).send('Forbidden');
  }
  next();
});
```

### Idempotency & Retry Logic (MANDATORY)
**Prevent duplicate messages due to network failures:**

```typescript
// Store idempotency keys to prevent duplicates
const sendMessageIdempotent = async (message: Message) => {
  const idempotencyKey = `${message.leadId}-${message.campaignId}-${Date.now()}`;

  // Check if already sent
  const existing = await ConversationModel.findOne({ idempotencyKey });
  if (existing) {
    return existing;
  }

  // Retry with exponential backoff
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await twilioClient.messages.create({
        to: message.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message.body
      });

      await ConversationModel.create({
        idempotencyKey,
        twilioSid: result.sid,
        leadId: message.leadId,
        messageType: 'sms',
        status: result.status
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

### Twilio Service Structure
```
services/twilio-integration/
├── src/
│   ├── config/
│   │   ├── twilio.config.ts          # Twilio credentials and settings
│   │   └── rate-limiter.config.ts    # Rate limiting rules by campaign
│   ├── models/
│   │   ├── call.model.ts             # Voice call records (duration, status, cost)
│   │   ├── conversation.model.ts     # SMS/message thread history
│   │   ├── phone-number.model.ts     # DNC list, opt-in tracking
│   │   └── campaign-run.model.ts     # Campaign execution tracking
│   ├── services/
│   │   ├── sms.service.ts            # SMS sending and templating
│   │   ├── voice.service.ts          # Voice call initiation
│   │   ├── ivr.service.ts            # IVR logic and routing
│   │   ├── webhook.service.ts        # Twilio callback handling
│   │   ├── rate-limiter.service.ts   # Cost optimization
│   │   └── retry.service.ts          # Exponential backoff retry
│   ├── controllers/
│   │   ├── sms.controller.ts         # SMS endpoints
│   │   ├── voice.controller.ts       # Voice call endpoints
│   │   └── webhook.controller.ts     # Webhook handlers
│   ├── middleware/
│   │   ├── twilio-validation.ts      # Request signature validation
│   │   ├── rate-limit.ts             # Rate limit enforcement
│   │   └── error-handler.ts          # Error responses
│   ├── utils/
│   │   ├── cost-calculator.ts        # Twilio cost estimation
│   │   ├── message-template.ts       # Dynamic message interpolation
│   │   └── validation.ts             # Phone number validation
│   ├── types/
│   │   └── twilio.types.ts           # TypeScript interfaces
│   ├── routes/
│   │   ├── sms.routes.ts             # SMS route definitions
│   │   ├── voice.routes.ts           # Voice route definitions
│   │   └── webhook.routes.ts         # Webhook route definitions
│   ├── index.ts                      # Express server bootstrap
│   └── logger.ts                     # Winston logging config
├── tests/
│   ├── unit/
│   │   ├── sms.service.test.ts
│   │   ├── voice.service.test.ts
│   │   ├── rate-limiter.test.ts
│   │   └── cost-calculator.test.ts
│   ├── integration/
│   │   ├── sms-webhook.test.ts
│   │   ├── voice-webhook.test.ts
│   │   └── retry-logic.test.ts
│   └── fixtures/
│       └── twilio-responses.json
├── docs/
│   ├── WEBHOOK-SETUP.md              # Webhook configuration guide
│   ├── COST-OPTIMIZATION.md          # Cost control strategies
│   ├── MESSAGE-TEMPLATES.md          # Template syntax guide
│   └── DNC-COMPLIANCE.md             # Do Not Call regulations
├── package.json
├── tsconfig.json
└── CLAUDE.md                         # This file
```

### Webhook Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/webhooks/sms/inbound` | POST | Incoming SMS from leads | TwiML (empty) |
| `/webhooks/sms/status` | POST | SMS delivery status updates | 200 OK |
| `/webhooks/voice/status` | POST | Call completion callbacks | 200 OK |
| `/webhooks/voice/inbound` | POST | Inbound call routing | TwiML |
| `/webhooks/voice/gather` | POST | IVR digit collection | TwiML |
| `/api/sms/send` | POST | Send SMS campaign | `{ twilioSid, status }` |
| `/api/voice/call` | POST | Initiate voice call | `{ callSid, status }` |
| `/api/campaigns/status` | GET | Campaign execution status | Campaign metrics |

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents

```yaml
agents:
  twilio_architect:
    role: Twilio API design and integration patterns
    focus: [sms-design, voice-design, webhook-security]
    responsibilities:
      - Design SMS campaign workflows
      - Plan voice IVR interactions
      - Implement webhook validation
      - Optimize Twilio API usage

  sms_campaign_specialist:
    role: SMS message optimization for conversions
    focus: [message-templates, personalization, compliance]
    responsibilities:
      - Design effective SMS templates with CTA
      - Implement lead personalization
      - Ensure TCPA/DNC compliance
      - Track SMS metrics (open rate, click rate)

  voice_ivr_specialist:
    role: IVR system design and voice interactions
    focus: [ivr-logic, call-routing, transcription]
    responsibilities:
      - Design IVR decision trees
      - Implement call routing logic
      - Configure voice recordings
      - Integrate speech-to-text

  cost_optimizer:
    role: Twilio cost management and rate limiting
    focus: [rate-limiting, batch-operations, regional-pricing]
    responsibilities:
      - Implement rate limiting strategies
      - Batch SMS for cost efficiency
      - Select optimal phone number regions
      - Monitor monthly Twilio bill

  webhook_security_expert:
    role: Webhook security and reliability
    focus: [request-validation, idempotency, retry-logic]
    responsibilities:
      - Implement Twilio request signature validation
      - Design idempotency keys
      - Implement exponential backoff
      - Ensure exactly-once delivery semantics
```

### Recommended Workflows

**1. New SMS Campaign (Tier 3 - Sonnet)**
```bash
# Get routing recommendation
npx @claude-flow/cli@latest hooks pre-task \
  --description "Design SMS drip campaign with rate limiting and cost optimization"

# Initialize swarm for concurrent agent work
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized

# Spawn agents
# 1. twilio_architect - Design campaign flow
# 2. sms_campaign_specialist - Write templates
# 3. cost_optimizer - Implement rate limiting
# 4. webhook_security_expert - Add validation
# 5. coder - Implement code
```

**2. Webhook Validation Setup (Tier 1 - Agent Booster)**
```bash
# Validate webhook signature implementation
npx @claude-flow/cli@latest hooks pre-task \
  --description "Add Twilio webhook request signature validation"
# Intent: add-error-handling (validation + error responses)
# Agent Booster can handle this directly
```

**3. Cost Monitoring (Tier 2 - Haiku)**
```bash
# Implement cost tracking
npx @claude-flow/cli@latest hooks pre-task \
  --description "Add Twilio cost tracking and alerting"
# Recommendation: haiku model for straightforward implementation
```

### Memory Operations

```bash
# Search for SMS campaign patterns
npx @claude-flow/cli@latest memory search \
  --query "high-converting mortgage SMS templates with CTA" \
  --namespace patterns

# Store successful campaign
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "sms-campaign-mortgage-success" \
  --value '{"conversion_rate": 0.12, "templates": ["rate-offer", "appointment"], "send_time": "morning"}'

# Store rate limit strategy
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "twilio-cost-optimization" \
  --value '{"batch_size": 100, "region": "US", "max_per_hour": 300, "retry_backoff": "exponential"}'

# Search for webhook security patterns
npx @claude-flow/cli@latest memory search \
  --query "webhook idempotency and request validation" \
  --namespace patterns
```

## 🔌 WEBHOOK HANDLING DETAILS

### Inbound SMS Webhook

```typescript
// POST /webhooks/sms/inbound
{
  MessageSid: "SM123456789",
  From: "+12015551234",
  To: "+12125552368",
  Body: "What's the current rate?"
}

// Response TwiML (empty)
<?xml version="1.0" encoding="UTF-8"?>
<Response/>
```

### SMS Status Callback

```typescript
// POST /webhooks/sms/status
{
  MessageSid: "SM123456789",
  MessageStatus: "delivered" | "failed" | "sent" | "queued",
  ErrorCode: "30001" // Only on failure
}
```

### Voice Call Status Callback

```typescript
// POST /webhooks/voice/status
{
  CallSid: "CA123456789",
  CallStatus: "completed",
  Duration: "245", // seconds
  RecordingUrl: "https://api.twilio.com/...",
  RecordingSid: "RE123456789"
}
```

### IVR Gather Callback (Digit Collection)

```typescript
// POST /webhooks/voice/gather
{
  CallSid: "CA123456789",
  Digits: "1", // User pressed 1 for schedule appointment
  SpeechResult: "yes" // From speech recognition
}
```

## 🚦 RATE LIMITING & RETRY LOGIC

### Rate Limiting Strategy

```typescript
// Tier 1: Per-phone-number rate limit (prevent lead spam)
const perPhoneLimit = {
  points: 3,              // Max 3 SMS per phone
  duration: 3600,         // Per hour
  blockDuration: 3600     // Block for 1 hour if exceeded
};

// Tier 2: Per-campaign rate limit (manage sending load)
const perCampaignLimit = {
  points: 1000,           // Max 1000 SMS per batch
  duration: 60,           // Per minute
  blockDuration: 300      // Back off 5 minutes if exceeded
};

// Tier 3: Account-level rate limit (Twilio best practices)
const accountLimit = {
  smsPerSecond: 100,      // 100 SMS/sec = 360k/hour
  voiceCallsPerSecond: 10, // 10 calls/sec = 36k/hour
  costAlert: 500          // Alert when daily Twilio cost > $500
};
```

### Retry Logic with Exponential Backoff

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,        // 1 second
  maxDelay: 30000,        // 30 seconds
  backoffMultiplier: 2,   // 2x exponential
  jitter: true            // Add randomness to prevent thundering herd
};

// Exponential backoff: 1s, 2s, 4s (with jitter)
// Retry reasons:
// - Network timeout (transient error, retry)
// - 429 Too Many Requests (rate limit, retry with backoff)
// - 50x Server Error (transient, retry)
// - 400 Bad Request (permanent, fail immediately)
// - 401 Unauthorized (permanent, fail immediately)
```

### Idempotency Implementation

```typescript
// Idempotency key: {leadId}-{campaignId}-{messageType}-{timestamp}
// Store in MongoDB with TTL: 24 hours
const idempotencySchema = {
  idempotencyKey: String,     // Unique identifier
  twilioSid: String,          // Twilio resource ID
  leadId: ObjectId,
  campaignId: ObjectId,
  messageType: String,        // 'sms' | 'voice'
  createdAt: Date,
  expiresAt: Date             // TTL index
};

// TTL index: automatically delete after 24 hours
db.idempotencyRecords.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

## 💰 COST OPTIMIZATION STRATEGIES

### SMS Cost Management

```typescript
// SMS Pricing by Region
const smsPricing = {
  US_CA: 0.0075,         // $0.0075 per SMS
  EUROPE: 0.02,          // $0.02 per SMS (higher)
  ASIA: 0.025,           // $0.025 per SMS
  INTERNATIONAL: 0.75    // Up to $0.75 for some countries
};

// Cost Optimization:
// 1. Send SMS during business hours (avoid premium rates)
// 2. Use 10DLC (10-digit long code) instead of shortcodes: 40% cost savings
// 3. Batch SMS sends: Fewer API calls, better throughput
// 4. Segment by geography: Route to cheapest regional gateway
// 5. Set up DNC list: Avoid sending to opted-out leads (saves cost)

// Example: Calculate campaign cost before sending
const estimateCampaignCost = (leads: Lead[]): number => {
  return leads.reduce((total, lead) => {
    const region = lead.phoneNumber.startsWith('+1') ? 'US_CA' : 'INTERNATIONAL';
    return total + smsPricing[region];
  }, 0);
};
```

### Voice Call Optimization

```typescript
// Voice Pricing
const voicePricing = {
  TERMINATION_US: 0.015,     // $0.015 per minute outbound
  OUTBOUND_BASE: 0.013,      // $0.013 per minute
  INBOUND: 0.0085,           // $0.0085 per minute (cheaper)
  IVR_INTERACTION: 0.0035    // per IVR action
};

// Cost Optimization:
// 1. Use inbound callback instead of outbound: 25% savings
// 2. Keep calls short: Monitor avg call duration
// 3. Use pre-recorded voice: Avoid $0.10/min text-to-speech
// 4. Batch calls in off-peak: Cheaper during nighttime
// 5. Use IVR instead of agent: 90% cost savings

// Example: Calculate call batch cost
const estimateCallCost = (callCount: number, avgDuration: number): number => {
  return callCount * (avgDuration / 60) * voicePricing.OUTBOUND_BASE;
};
```

### Daily Cost Alert System

```typescript
// Monitor and alert on excessive costs
const dailyCostMonitor = {
  smsTarget: 100,         // Target: $100/day SMS spend
  voiceTarget: 200,       // Target: $200/day voice spend
  alertThreshold: 1.2,    // Alert at 120% of target ($120 SMS, $240 voice)
  hardLimit: 500          // Hard stop at $500/day total
};

// Implementation
const checkDailyCost = async () => {
  const dailyUsage = await getTodaysTwilioUsage();
  if (dailyUsage.cost > dailyCostMonitor.hardLimit) {
    // Stop all campaigns immediately
    await pauseAllCampaigns();
    await sendAlert('CRITICAL: Twilio daily cost exceeded hard limit');
  } else if (dailyUsage.cost > dailyCostMonitor.alertThreshold * dailyCostMonitor.smsTarget) {
    // Alert but continue
    await sendAlert(`WARNING: SMS spending $${dailyUsage.smsCost} (target: $${dailyCostMonitor.smsTarget})`);
  }
};
```

## 📝 MESSAGE TEMPLATING

### SMS Template System

```typescript
// Template with variable interpolation
const smsTemplates = {
  rateOffer: `Hi {{firstName}}, current {{propertyType}} rates: {{rate}}% ({{points}} pts). Quote: {{quoteLink}}`,

  followUp: `{{firstName}}, still interested in that {{rate}}% mortgage rate? Limited time offer expires {{expiryDate}}.`,

  appointmentReminder: `Reminder: Your mortgage consultation with {{lenderName}} is {{appointmentTime}} tomorrow. Call {{supportPhone}} to reschedule.`,

  documentRequest: `Hi {{firstName}}, please upload your {{documentType}} by {{deadline}} at {{documentPortal}}. Questions? {{supportPhone}}`
};

// Template interpolation with safety
const interpolateTemplate = (template: string, data: Record<string, any>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(data[key] || '').substring(0, 20); // Truncate for SMS length
  });
};

// SMS length validation (160 chars standard, 306 for 2-part)
const validateSMSLength = (message: string): { valid: boolean; parts: number } => {
  const length = message.length;
  if (length <= 160) return { valid: true, parts: 1 };
  if (length <= 306) return { valid: true, parts: 2 };
  return { valid: false, parts: Math.ceil(length / 153) };
};
```

### Voice Template System

```typescript
// Voice greeting templates for IVR
const voiceTemplates = {
  greeting: `Hello {{firstName}}, thanks for calling {{companyName}}.`,

  rateQuery: `We have {{rate}}% rates available for {{propertyType}} mortgages.`,

  menuPrompt: `Press 1 to schedule a consultation, 2 for rates, 3 to speak with an agent.`,

  confirmAction: `Thank you. We'll send details to {{phoneNumber}}. Goodbye.`
};

// Text-to-speech configuration
const ttsConfig = {
  voice: 'woman' | 'man',     // Twilio voice
  language: 'en-US',          // Language code
  rate: 1.0,                  // Speech rate (0.8-1.5)
  pitch: 1.0                  // Pitch (0.5-1.5)
};
```

## 🧪 TESTING & DEPLOYMENT

### Unit Tests

```typescript
describe('SMS Service', () => {
  it('should rate limit SMS by phone number', async () => {
    const service = new SMSService();
    const leadPhone = '+12015551234';

    // Send 3 SMS (within limit)
    for (let i = 0; i < 3; i++) {
      const result = await service.sendSMS(leadPhone, 'Test message');
      expect(result.status).toBe('sent');
    }

    // 4th SMS should be blocked
    const blocked = await service.sendSMS(leadPhone, 'Test message');
    expect(blocked.status).toBe('rate_limited');
  });

  it('should validate Twilio webhook signature', async () => {
    const middleware = twilioValidationMiddleware();
    const req = { headers: { 'x-twilio-signature': 'invalid' } };
    const res = { status: jest.fn().returnThis(), send: jest.fn() };

    middleware(req as any, res as any, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

### Integration Tests

```typescript
describe('SMS Webhook', () => {
  it('should handle inbound SMS and store in database', async () => {
    const response = await request(app)
      .post('/webhooks/sms/inbound')
      .set('X-Twilio-Signature', validSignature)
      .send({
        From: '+12015551234',
        To: '+12125552368',
        Body: 'What rates do you have?'
      });

    expect(response.status).toBe(200);
    const stored = await ConversationModel.findOne({ twilioSid: 'SM123' });
    expect(stored).toBeDefined();
  });
});
```

### Pre-Deployment Checklist

- [ ] All SMS templates pass 160-character check
- [ ] Rate limits configured for all tiers
- [ ] Twilio webhook URLs configured in dashboard
- [ ] Request signature validation tested
- [ ] Cost alerts set up and tested
- [ ] DNC list imported and enabled
- [ ] Retry logic tested with network failures
- [ ] 100% test coverage on critical paths
- [ ] Staging environment matches production
- [ ] Twilio account verified for production rates

## 🔄 AUTO-LEARNING PROTOCOL

### Before SMS Campaign Launch
```bash
# Search for successful SMS templates
npx @claude-flow/cli@latest memory search \
  --query "high-converting mortgage SMS templates" \
  --namespace patterns

# Load cost optimization patterns
npx @claude-flow/cli@latest memory search \
  --query "Twilio cost optimization batching" \
  --namespace patterns
```

### After Campaign Execution
```bash
# Store campaign results
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "sms-campaign-results-$(date +%Y%m%d)" \
  --value '{"templates_used": ["rateOffer"], "delivery_rate": 0.98, "conversion_rate": 0.12, "cost_per_lead": 0.0075}'

# Train neural patterns on success
npx @claude-flow/cli@latest neural train \
  --pattern-type sms-optimization \
  --epochs 10
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns and swarm coordination
- **WEBHOOK-SETUP.md**: Complete webhook URL configuration in Twilio dashboard
- **COST-OPTIMIZATION.md**: Detailed cost control strategies
- **MESSAGE-TEMPLATES.md**: SMS template design best practices
- **DNC-COMPLIANCE.md**: TCPA and Do Not Call regulations

---

**Twilio integration enables real-time customer engagement through SMS and voice. Strict rate limiting and cost monitoring prevent bill shock while ensuring compliance with telemarketing regulations.**
