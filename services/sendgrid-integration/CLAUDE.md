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
Maintain sender reputation to ensure inbox delivery. Monitor bounce rate (SendGrid hard limit: 5%).

### Webhook Security & Verification (MANDATORY)
Verify all SendGrid webhooks with request validation using SendGrid's signature validation.

### Idempotency & Duplicate Prevention (MANDATORY)
Prevent duplicate emails due to webhook retries by using idempotency keys.

## 📊 SERVICE ARCHITECTURE

```
services/sendgrid-integration/
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

Use Archon workflows for designing email templates and managing email compliance audits.

### Recommended Workflows

```bash
# Example Archon command
archon workflow run email-audit "path/to/templates"
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: Archon OS orchestration patterns
- **WEBHOOK-SETUP.md**: Webhook URL configuration
- **TEMPLATE-GUIDE.md**: Email template syntax

---

**SendGrid integration enables reliable email delivery. Strict rate limiting and security ensure reliable operations.**
