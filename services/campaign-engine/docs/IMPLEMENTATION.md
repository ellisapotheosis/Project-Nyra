# Campaign Engine Implementation Guide

## Overview

The Campaign Engine is a production-ready service built for Project Nyra that manages automated drip campaigns with:

- **Multi-channel messaging** (SMS, Email, Voicemail)
- **n8n workflow integration** for scheduling and execution
- **Activepieces integration** for message delivery
- **Compliance guardrails** following logistics-only guidelines
- **Real-time status tracking** and execution management

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Campaign Engine                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ DOCX Parser  │─────>│   Campaign   │─────>│  Scheduler   │  │
│  │              │      │    Service   │      │   Service    │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                               │                      │          │
│                               │                      │          │
│                               v                      v          │
│                    ┌──────────────────┐   ┌──────────────────┐ │
│                    │   Guardrail      │   │   n8n / Active   │ │
│                    │   Middleware     │   │   pieces         │ │
│                    └──────────────────┘   └──────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                             │
                             v
                    ┌─────────────────┐
                    │  PostgreSQL DB  │
                    │  (Twenty CRM)   │
                    └─────────────────┘
```

## Components

### 1. DOCX Parser (`src/parsers/docx-parser.js`)

Extracts campaign data from Word documents following the Project Nyra campaign format.

**Features**:
- Parses day/time structure
- Extracts SMS, Email, and Voicemail steps
- Converts time offsets to minutes
- Handles metadata and personalization placeholders

**Supported Format**:
```
Day 1
SMS Time: instant
Message content

Email Time: 30 mins
Subject: Email subject
Body content

Day 2
SMS Time: 1 hour
Next day message
```

### 2. Campaign Models (`src/models/`)

**Campaign Model**:
- Campaign metadata and configuration
- Step definitions with timing
- Validation rules
- JSON serialization

**Campaign Execution Model**:
- Tracks execution for each contact
- Step-by-step progress monitoring
- Status management (pending, active, paused, completed, failed)
- Metadata and audit trail

### 3. Services

#### Campaign Service (`src/services/campaign.service.js`)
Core business logic for campaign management:
- CRUD operations for campaigns
- Execution lifecycle management
- Statistics and reporting
- Compliance checks integration

#### Campaign Scheduler Service (`src/services/campaign-scheduler.service.js`)
Handles scheduling and execution:
- Calculates scheduled times based on campaign start
- Schedules jobs using node-schedule
- Executes steps via n8n/Activepieces
- Retry mechanism for failed deliveries
- Personalization of messages

#### n8n Service (`src/services/n8n.service.js`)
Integration with n8n workflows:
- Webhook-based message sending
- Workflow execution tracking
- Connection testing
- Error handling and logging

#### Activepieces Service (`src/services/activepieces.service.js`)
Integration with Activepieces flows:
- Flow-based message sending
- Scheduling capabilities
- Run status tracking
- Alternative to n8n for message delivery

### 4. Guardrail Middleware (`src/middleware/guardrails.middleware.js`)

Implements compliance checks based on `logistics_guardrail.md`:

**Prohibited Content Detection**:
- Rate quotes without API reference
- Payment quotes without API reference
- Approval promises
- SSN collection requests
- Bank account number requests
- Steering language
- Discriminatory content

**Allowed Content**:
- Scheduling and appointments
- Document collection requests
- Status updates
- Follow-up messages

**Features**:
- Pattern-based content validation
- DNC (Do Not Contact) checks
- Consent verification
- Content sanitization
- Compliance event logging

### 5. Controllers & Routes (`src/controllers/`, `src/routes/`)

RESTful API endpoints for:
- Campaign CRUD operations
- DOCX parsing
- Execution management (start, pause, resume, stop)
- Status tracking
- Statistics and reporting

## Data Flow

### Campaign Creation Flow

```
DOCX File
   │
   v
DOCX Parser
   │
   v
Campaign Model (validation)
   │
   v
Campaign Service (save)
   │
   v
Database
```

### Campaign Execution Flow

```
Contact Data + Campaign ID
   │
   v
Campaign Service (startCampaignExecution)
   │
   ├─> DNC Check
   ├─> Consent Check
   │
   v
Campaign Execution Created
   │
   v
Scheduler Service (scheduleCampaign)
   │
   ├─> Calculate times
   ├─> Create scheduled jobs
   │
   v
Jobs Scheduled (node-schedule)
   │
   v
(At scheduled time)
   │
   v
Execute Step
   │
   ├─> Personalize message
   ├─> Guardrail check
   ├─> Send via n8n/Activepieces
   │
   v
Update Execution Status
```

## Configuration

### Environment Variables

See `.env.example` for all configuration options.

Key settings:
- **Database**: PostgreSQL connection
- **n8n**: Base URL, API key, webhook URL
- **Activepieces**: Base URL, API key
- **Campaign**: Timezone, retry settings
- **Compliance**: Guardrails, DNC, consent

### n8n Workflow Setup

1. Import `n8n-workflows/campaign-scheduler.json`
2. Configure credentials:
   - Twilio (for SMS)
   - SMTP (for Email)
3. Set webhook URL in environment
4. Activate workflow

### Database Schema

The service uses in-memory storage by default. For production:

**campaigns table**:
```sql
CREATE TABLE campaigns (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  timezone VARCHAR(50),
  version VARCHAR(20),
  status VARCHAR(20),
  steps JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**campaign_executions table**:
```sql
CREATE TABLE campaign_executions (
  id UUID PRIMARY KEY,
  campaign_id VARCHAR(255) REFERENCES campaigns(id),
  contact_id VARCHAR(255) NOT NULL,
  lead_id VARCHAR(255),
  status VARCHAR(20),
  current_step INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  paused_at TIMESTAMP,
  steps JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Unit Tests

Located in `tests/unit/`:
- `docx-parser.test.js` - Parser functionality
- `campaign.model.test.js` - Model validation
- `guardrails.test.js` - Compliance checks

### Integration Tests

Located in `tests/integration/`:
- `campaign.integration.test.js` - Full API testing

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm test -- tests/unit

# Integration tests
npm run test:integration

# Coverage report
npm test -- --coverage
```

### Test Coverage Goals

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Deployment

### Docker Deployment

```bash
# Build
docker build -t nyra/campaign-engine:latest .

# Run
docker-compose up -d
```

### Production Considerations

1. **Database**: Replace in-memory storage with PostgreSQL
2. **Secrets**: Use environment-specific .env files or secret management
3. **Logging**: Integrate with Loki/Grafana stack
4. **Monitoring**: Add Prometheus metrics
5. **Rate Limiting**: Implement per-IP and per-API-key limits
6. **HTTPS**: Enable TLS/SSL certificates
7. **CORS**: Configure allowed origins
8. **Backups**: Set up automated database backups
9. **DNC Integration**: Connect to actual DNC service
10. **Consent Management**: Integrate with consent platform

## Integration Points

### Twenty CRM
- Contact data retrieval
- Lead information
- Campaign assignment

### n8n
- Webhook triggers for message sending
- Workflow execution
- Status callbacks

### Activepieces
- Flow-based message delivery
- Alternative to n8n
- Scheduling capabilities

### PostgreSQL
- Campaign storage
- Execution tracking
- Audit logs

### Observability Stack
- Loki: Log aggregation
- Prometheus: Metrics collection
- Grafana: Dashboards and alerting

## Monitoring

### Key Metrics

- Campaign execution success rate
- Message delivery rate
- Step completion time
- Guardrail violation rate
- API response times
- Database connection pool

### Logging

All logs are written to:
- Console (development)
- File: `logs/campaign-engine.log`
- Loki (production)

Log levels:
- `error`: Critical failures
- `warn`: Guardrail violations, retries
- `info`: Normal operations
- `debug`: Detailed execution flow

## Troubleshooting

### Common Issues

**1. Campaign not scheduling**
- Verify n8n is running
- Check webhook URL configuration
- Review n8n workflow activation

**2. Messages not sending**
- Check Twilio/SMTP credentials
- Verify contact has valid phone/email
- Review guardrail compliance in logs

**3. Guardrail violations**
- Check message content against prohibited patterns
- Review `logistics_guardrail.md`
- Test content with validation endpoint

**4. DOCX parsing errors**
- Ensure file follows expected format
- Check for special characters
- Verify file path is accessible

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
```

## API Examples

See `docs/API.md` for complete API documentation with examples.

## Future Enhancements

1. **Database Persistence**: Migrate from in-memory to PostgreSQL
2. **Webhook Support**: Add outbound webhooks for events
3. **A/B Testing**: Support variant testing for campaigns
4. **Analytics Dashboard**: Real-time campaign performance
5. **Template Library**: Pre-built campaign templates
6. **Internationalization**: Multi-language support
7. **Advanced Scheduling**: Business hours, timezone-aware delivery
8. **ML-Based Optimization**: Send time optimization
9. **Rich Media**: Support for images, videos, attachments
10. **Two-Way Messaging**: Handle responses and conversations

## Support

- **Code**: `services/campaign-engine/`
- **Tests**: `services/campaign-engine/tests/`
- **Documentation**: `services/campaign-engine/docs/`
- **Workflows**: `services/campaign-engine/n8n-workflows/`

## License

MIT - See LICENSE file for details
