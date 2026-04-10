# Twilio Integration Service

## 🎯 SERVICE CONTEXT

**Purpose**: Automated lead follow-up communications via SMS and voice calls for mortgage drip campaigns. Enables personalized, real-time customer engagement through Twilio's communication platform.

**Capabilities**:
- **SMS Campaigns**: Send automated lead follow-up texts
- **Voice Calling**: Outbound IVR calls
- **Drip Campaigns**: Sequence SMS/voice messages
- **Webhook Handling**: Real-time inbound SMS/call routing
- **Rate Limiting**: Compliance and cost optimization

**Technology Stack**:
- Twilio Node.js SDK v4+
- Express.js for webhook endpoints
- MongoDB for conversation/call history
- Rate Limiter Flexible for intelligent throttling
- Winston for structured logging

## 🚨 CRITICAL DEVELOPMENT RULES

### Rate Limiting & Cost Optimization (MANDATORY)
Enforce strict rate limits to prevent bill shock.

### Webhook Security (MANDATORY)
Verify all Twilio webhooks with request validation using Twilio's signature validation.

### Idempotency & Retry Logic (MANDATORY)
Prevent duplicate messages due to network failures by storing idempotency keys.

## 📊 SERVICE ARCHITECTURE

```
services/twilio-integration/
├── src/
│   ├── config/
│   ├── models/
│   ├── services/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   ├── routes/
│   ├── index.ts
│   └── logger.ts
├── tests/
└── CLAUDE.md
```

## 🧠 ARCHON OS INTEGRATION

Use Archon workflows for designing SMS campaigns and managing webhook security audits.

### Recommended Workflows

```bash
# Example Archon command
archon workflow run twilio-audit "path/to/webhooks"
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: Archon OS orchestration patterns
- **WEBHOOK-SETUP.md**: Webhook configuration guide
- **COST-OPTIMIZATION.md**: Cost control strategies

---

**Twilio integration enables real-time customer engagement. Strict rate limiting and security ensure reliable operations.**
