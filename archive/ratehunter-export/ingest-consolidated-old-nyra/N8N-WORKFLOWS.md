# N8N Mortgage Lead Drip Campaign Workflows

## 📋 Overview

Comprehensive n8n workflow system for automated mortgage lead nurturing, featuring 35 production-ready workflows with multi-channel communication (SMS, Email, Voice), CRM integration, and intelligent scheduling.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lead Entry Points                             │
│  (Website Forms, API, Manual Entry, Referrals)                  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  mortgage-lead-      │
         │  intake.json         │◄── Initial Capture & Validation
         │                      │
         └──────────┬───────────┘
                    │
         ┌──────────▼──────────────────────────────────────┐
         │         CRM Integration                         │
         │  (apps/crm + PostgreSQL Orchestrator DB)        │
         └──────────┬──────────────────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  Lead Scoring &     │
         │  Segmentation       │
         └──────────┬──────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌────────┐  ┌──────────────┐  ┌──────────┐
│  SMS   │  │   Email      │  │  Call    │
│Campaign│  │  Campaign    │  │Scheduling│
└───┬────┘  └──────┬───────┘  └────┬─────┘
    │              │               │
    └──────────────┼───────────────┘
                   │
         ┌─────────▼──────────┐
         │   30-Day Drip      │
         │   Campaign         │
         │  (Days 1-30)       │
         └────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **N8N Instance** (v1.0.0+)
   - Docker: `docker pull n8nio/n8n:latest`
   - Self-hosted: https://docs.n8n.io/hosting/

2. **Required Services**
   - PostgreSQL 14+ (Orchestrator database)
   - Twilio Account (SMS)
   - SMTP Server (Email)
   - Calendly Account (Scheduling)
   - CRM API (apps/crm)

3. **Environment Variables** (via Infisical)
   ```bash
   # Core Configuration
   N8N_ENCRYPTION_KEY=your-encryption-key
   N8N_USER_MANAGEMENT_JWT_SECRET=your-jwt-secret
   N8N_WEBHOOK_URL=https://your-n8n-instance.com

   # Database
   POSTGRES_HOST=orchestrator-db
   POSTGRES_PORT=5432
   POSTGRES_DB=nyra_orchestrator
   POSTGRES_USER=nyra_user
   POSTGRES_PASSWORD=<from-infisical>

   # Twilio (SMS)
   TWILIO_ACCOUNT_SID=<from-infisical>
   TWILIO_AUTH_TOKEN=<from-infisical>
   TWILIO_PHONE_NUMBER=+1234567890

   # SMTP (Email)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<from-infisical>
   SMTP_PASSWORD=<from-infisical>
   SMTP_FROM_EMAIL=noreply@yourdomain.com

   # Calendly
   CALENDLY_API_KEY=<from-infisical>
   CALENDLY_API_URL=https://api.calendly.com

   # CRM Integration
   CRM_API_URL=http://localhost:3003
   CRM_API_KEY=<from-infisical>
   CRM_URL=https://crm.yourdomain.com

   # Office Details
   OFFICE_PHONE=+1234567890
   BOOKING_LINK=https://calendly.com/your-link
   ```

### Installation

#### Option 1: Docker Compose (Recommended)

```bash
# Navigate to orchestrator-mini
cd bootstrap/orchestrator-mini

# Start N8N with dependencies
docker-compose up -d n8n postgres

# Wait for services to be ready
docker-compose ps

# Import workflows
cd configs/n8n/workflows
for workflow in *.json; do
  curl -X POST http://localhost:5678/api/v1/workflows \
    -H "Content-Type: application/json" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -d @"$workflow"
done
```

#### Option 2: Oracle VPS Deployment (Production)

```bash
# Install Oracle VPS CLI
curl -fsSL https://oracle-vps.com/get-cli.sh | sh

# Login to Oracle VPS
oracle-vps login

# Deploy N8N service
oracle-vps service create n8n-production \
  --docker n8nio/n8n:latest \
  --ports 5678:http \
  --routes /:5678 \
  --env N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY \
  --env POSTGRES_HOST=$POSTGRES_HOST \
  --env POSTGRES_DB=$POSTGRES_DB \
  --env N8N_WEBHOOK_URL=https://n8n-production-yourorg.oracle-vps.ratehunter.net \
  --regions fra \
  --instance-type micro

# Deploy PostgreSQL (if not using external)
oracle-vps service create postgres-orchestrator \
  --docker postgres:14-alpine \
  --ports 5432:tcp \
  --env POSTGRES_DB=nyra_orchestrator \
  --env POSTGRES_USER=nyra_user \
  --env POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  --regions fra \
  --instance-type small

# Get service URL
oracle-vps service get n8n-production
```

#### Option 3: Manual Setup

1. **Import Workflows**
   - Open N8N UI: http://localhost:5678
   - Go to Workflows → Import from File
   - Import all JSON files from `configs/n8n/workflows/`

2. **Configure Credentials**
   - Settings → Credentials → Add Credential
   - Add: PostgreSQL, Twilio, SMTP, HTTP Header Auth (for CRM)

3. **Activate Workflows**
   - Enable each workflow individually
   - Test webhook endpoints

## 📊 Campaign Strategy

### 30-Day Drip Campaign Timeline

| Week | Days | Focus | Frequency | Channels | Priority |
|------|------|-------|-----------|----------|----------|
| **Week 1** | 1-7 | Onboarding & Education | Daily | SMS + Email | High |
| **Week 2** | 8-14 | Document Collection & Pre-approval | Every 2 days | Email + SMS | High |
| **Week 3** | 15-21 | Rate Lock & Urgency | Every 2 days | SMS + Email + Call | Critical |
| **Week 4** | 22-30 | Re-engagement & Final Push | Every 3 days | Email | Normal |

### Campaign Themes by Day

#### Week 1: Foundation Building
- **Day 1**: Welcome & Portal Access
- **Day 2**: Document Checklist
- **Day 3**: Mortgage Options Education
- **Day 5**: Personalized Rate Quote
- **Day 7**: Week 1 Milestone Celebration

#### Week 2: Momentum Building
- **Day 10**: Pre-Approval Benefits
- **Day 14**: 2-Week Milestone & Acceleration

#### Week 3: Urgency & Conversion
- **Day 17**: Social Proof (Success Stories)
- **Day 21**: Rate Alert & Lock-In Urgency

#### Week 4: Re-engagement
- **Day 24**: FAQ Guide
- **Day 28**: Final Rate Reminder
- **Day 30**: Re-engagement Touchpoint

### Lead Scoring Matrix

```javascript
// Base score: 50
// Adjustments:
let leadScore = 50;

// Credit score impact
if (creditScore > 750) leadScore += 25;
else if (creditScore > 700) leadScore += 20;
else if (creditScore > 650) leadScore += 10;

// LTV ratio impact
if (ltvRatio < 70) leadScore += 20;
else if (ltvRatio < 80) leadScore += 15;
else if (ltvRatio < 90) leadScore += 10;

// Property type impact
if (propertyType === 'primary') leadScore += 10;

// Source impact
if (source === 'referral') leadScore += 15;
if (source === 'organic') leadScore += 10;

// Engagement boost
leadScore += (emailOpenCount * 2);
leadScore += (emailClickCount * 5);
leadScore += (smsResponseCount * 8);

// Priority routing
// 75+: High-priority fast-track
// 50-74: Standard processing
// <50: Extended nurturing
```

## 📁 Workflow Descriptions

### Core Workflows

#### 1. mortgage-lead-intake.json
**Purpose**: Initial lead capture and validation

**Triggers**: Webhook (POST /webhook-lead-intake)

**Flow**:
1. Receive lead data from forms/API
2. Validate email and phone format
3. Calculate lead score and LTV ratio
4. Create lead in CRM
5. Log to orchestrator database
6. Route to high-priority or standard flow
7. Send welcome SMS + Email
8. Return success response

**Key Features**:
- Real-time validation
- Automatic lead scoring
- Duplicate detection
- Error handling with team notifications
- Tracking pixel integration

#### 2. sms-campaign.json
**Purpose**: Automated SMS drip sequences

**Triggers**: Cron (9AM, 2PM, 5PM daily)

**Flow**:
1. Fetch active campaign leads
2. Generate day-specific SMS content
3. Batch send (10 per batch, rate limiting)
4. Update campaign status
5. Log SMS activity
6. Handle incoming SMS responses
7. Parse intent (YES, LOCK, DOCS, HELP, STOP)
8. Create tasks in CRM for callbacks

**Key Features**:
- Day-specific messaging (30 variations)
- Response parsing and intent detection
- Automatic callback task creation
- Team notifications for hot leads
- Unsubscribe handling

#### 3. email-campaign.json
**Purpose**: Automated email drip sequences

**Triggers**: Cron (8AM, 1PM, 6PM daily)

**Flow**:
1. Fetch active email campaigns
2. Generate personalized content
3. Route by template type (welcome, education, rate-update)
4. Send HTML emails with tracking
5. Update campaign status
6. Track email opens via pixel
7. Log engagement metrics

**Key Features**:
- Rich HTML templates
- Personalized rate calculations
- Email open tracking
- Click tracking
- Responsive design
- Unsubscribe links

#### 4. call-scheduling.json
**Purpose**: Automated call scheduling and reminders

**Triggers**:
- Webhook (POST /schedule-call)
- Cron (every 15 minutes for reminders)

**Flow**:
1. Process scheduling request
2. Auto-assign loan officer (load balancing)
3. Create Calendly scheduling link
4. Store call record
5. Send confirmation (SMS + Email)
6. Send 1-hour reminder
7. Send 15-minute reminder (lead + officer)
8. Mark call as completed
9. Log activity to CRM

**Key Features**:
- Automatic loan officer assignment
- Calendar integration (Calendly)
- Multi-channel reminders
- Call outcome tracking
- CRM activity logging

### Drip Campaign Workflows (Days 1-30)

#### Generated Files
- `drip-campaign-day1.json` through `drip-campaign-day30.json`
- Auto-generated via `generate-drip-workflows.js`

**Common Structure**:
1. Cron trigger (10AM daily)
2. Fetch leads for specific day
3. Send SMS touchpoint
4. Send email touchpoint
5. Mark as sent in database
6. Log activity to CRM

**Customization by Day**:
- Day-specific subject lines
- Tailored message content
- Theme tags (welcome, education, urgency, etc.)
- Variable CTAs
- Priority levels

## 🔐 Infisical Integration

### Setup Infisical Secrets

```bash
# Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && apt-get install -y infisical

# Login
infisical login

# Initialize in project
cd bootstrap/orchestrator-mini
infisical init

# Set secrets
infisical secrets set TWILIO_ACCOUNT_SID "your-sid"
infisical secrets set TWILIO_AUTH_TOKEN "your-token"
infisical secrets set POSTGRES_PASSWORD "your-password"
infisical secrets set CRM_API_KEY "your-api-key"
infisical secrets set SMTP_PASSWORD "your-smtp-password"
infisical secrets set CALENDLY_API_KEY "your-calendly-key"
infisical secrets set N8N_ENCRYPTION_KEY "$(openssl rand -base64 32)"
```

### Docker Compose with Infisical

```yaml
# docker-compose.n8n.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
      - GENERIC_TIMEZONE=America/New_York
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./configs/n8n/workflows:/home/node/.n8n/workflows
    depends_on:
      - postgres
    command: >
      sh -c "infisical run --env=production -- n8n start"

  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./configs/databases/init-orchestrator.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  n8n_data:
  postgres_data:
```

### Runtime Secret Injection

N8N workflows use `$env` variables which are automatically injected:

```javascript
// In workflow nodes
"message": "={{ $env.TWILIO_PHONE_NUMBER }}"
"Authorization": "={{ 'Bearer ' + $env.CRM_API_KEY }}"
```

## 🗄️ Database Schema

### Required Tables

```sql
-- Create in bootstrap/orchestrator-mini/configs/databases/init-orchestrator.sql

-- Lead campaigns tracking
CREATE TABLE IF NOT EXISTS lead_campaigns (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_type VARCHAR(50) DEFAULT 'drip',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  day_number INTEGER DEFAULT 1,

  -- Channel preferences
  sms_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  call_enabled BOOLEAN DEFAULT true,

  -- Tracking fields
  last_sms_sent TIMESTAMP,
  last_email_sent TIMESTAMP,
  last_call_scheduled TIMESTAMP,
  last_touchpoint TIMESTAMP,

  -- Engagement metrics
  sms_count INTEGER DEFAULT 0,
  email_count INTEGER DEFAULT 0,
  email_open_count INTEGER DEFAULT 0,
  email_click_count INTEGER DEFAULT 0,
  sms_response_count INTEGER DEFAULT 0,

  -- Day-specific flags (for idempotency)
  day1_sent BOOLEAN DEFAULT false,
  day2_sent BOOLEAN DEFAULT false,
  day3_sent BOOLEAN DEFAULT false,
  -- ... day4 through day30
  day30_sent BOOLEAN DEFAULT false,

  -- Priority and scoring
  priority VARCHAR(20) DEFAULT 'normal',

  UNIQUE(lead_id, campaign_type)
);

-- SMS activity log
CREATE TABLE IF NOT EXISTS sms_activity_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'sent',
  direction VARCHAR(10) DEFAULT 'outbound', -- outbound/inbound
  response_text TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Email activity log
CREATE TABLE IF NOT EXISTS email_activity_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  template_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'sent',
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled calls
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  loan_officer_id INTEGER REFERENCES loan_officers(id),
  scheduled_for TIMESTAMP NOT NULL,
  call_type VARCHAR(50) DEFAULT 'initial-consultation',
  duration INTEGER DEFAULT 30, -- minutes
  status VARCHAR(20) DEFAULT 'scheduled',
  calendly_link TEXT,
  reminder_1hr_sent BOOLEAN DEFAULT false,
  reminder_15min_sent BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  call_notes TEXT,
  call_outcome VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead intake log
CREATE TABLE IF NOT EXISTS lead_intake_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(50),
  status VARCHAR(20),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Loan officers
CREATE TABLE IF NOT EXISTS loan_officers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  current_lead_count INTEGER DEFAULT 0,
  max_lead_capacity INTEGER DEFAULT 50,
  performance_score DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_lead_campaigns_lead_id ON lead_campaigns(lead_id);
CREATE INDEX idx_lead_campaigns_status ON lead_campaigns(status);
CREATE INDEX idx_lead_campaigns_day_number ON lead_campaigns(day_number);
CREATE INDEX idx_sms_activity_lead_id ON sms_activity_log(lead_id);
CREATE INDEX idx_email_activity_lead_id ON email_activity_log(lead_id);
CREATE INDEX idx_scheduled_calls_lead_id ON scheduled_calls(lead_id);
CREATE INDEX idx_scheduled_calls_scheduled_for ON scheduled_calls(scheduled_for);
```

## 🔗 CRM Integration

### API Endpoints Required

The workflows expect the following CRM API endpoints (from `apps/crm`):

#### POST /api/leads
Create new lead
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "propertyValue": 500000,
  "loanAmount": 400000,
  "leadScore": 75,
  "source": "website"
}
```

Response:
```json
{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "status": "new",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

#### POST /api/activities
Log activity
```json
{
  "leadId": 123,
  "type": "sms|email|call|drip-campaign",
  "outcome": "sent|opened|clicked|completed",
  "notes": "Optional notes",
  "timestamp": "2026-01-15T10:00:00Z"
}
```

#### POST /api/tasks
Create task
```json
{
  "leadId": 123,
  "type": "callback|follow-up|document-review",
  "priority": "high|normal|low",
  "dueDate": "2026-01-15T11:00:00Z",
  "assignedTo": "loan_officer_id"
}
```

#### GET /api/leads/:id
Get lead details

Response includes assigned loan officer information.

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Campaign Performance**
   ```sql
   -- Overall campaign stats
   SELECT
     campaign_type,
     COUNT(*) as total_leads,
     AVG(email_open_count) as avg_email_opens,
     AVG(email_click_count) as avg_email_clicks,
     AVG(sms_response_count) as avg_sms_responses
   FROM lead_campaigns
   WHERE created_at >= NOW() - INTERVAL '30 days'
   GROUP BY campaign_type;
   ```

2. **Daily Touchpoint Effectiveness**
   ```sql
   -- Which days get best engagement?
   SELECT
     day_number,
     COUNT(*) as leads_reached,
     AVG(email_open_count) as avg_opens,
     AVG(email_click_count) as avg_clicks
   FROM lead_campaigns
   WHERE status = 'active'
   GROUP BY day_number
   ORDER BY day_number;
   ```

3. **Channel Performance**
   ```sql
   -- SMS vs Email effectiveness
   SELECT
     'sms' as channel,
     COUNT(*) as total_sent,
     SUM(CASE WHEN response_text IS NOT NULL THEN 1 ELSE 0 END) as responses,
     (SUM(CASE WHEN response_text IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as response_rate
   FROM sms_activity_log
   WHERE sent_at >= NOW() - INTERVAL '30 days'

   UNION ALL

   SELECT
     'email' as channel,
     COUNT(*) as total_sent,
     SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
     (SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as open_rate
   FROM email_activity_log
   WHERE sent_at >= NOW() - INTERVAL '30 days';
   ```

4. **Conversion Funnel**
   ```sql
   -- Track lead progression
   SELECT
     source,
     COUNT(*) as total_leads,
     SUM(CASE WHEN lead_score >= 75 THEN 1 ELSE 0 END) as high_quality,
     SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
     (SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
   FROM leads
   WHERE created_at >= NOW() - INTERVAL '30 days'
   GROUP BY source;
   ```

### N8N Execution Monitoring

```bash
# Get workflow execution stats
curl -X GET http://localhost:5678/api/v1/executions \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  | jq '.data[] | {workflow: .workflowName, status: .status, duration: .duration}'

# Get failed executions
curl -X GET http://localhost:5678/api/v1/executions?status=error \
  -H "X-N8N-API-KEY: $N8N_API_KEY"

# Get specific workflow stats
curl -X GET "http://localhost:5678/api/v1/executions?workflowId=123" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in Infisical
- [ ] Database schema applied to orchestrator PostgreSQL
- [ ] CRM API endpoints tested and responding
- [ ] Twilio account verified and phone number active
- [ ] SMTP credentials tested
- [ ] Calendly API key valid
- [ ] Webhook URLs updated for production domain

### Deployment Steps

1. **Deploy Database**
   ```bash
   # Apply schema
   psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f configs/databases/init-orchestrator.sql
   ```

2. **Deploy N8N**
   - Option A: Oracle VPS (see Oracle VPS section)
   - Option B: Docker Compose (see Docker section)
   - Option C: Kubernetes (use provided manifests)

3. **Import Workflows**
   ```bash
   # Bulk import
   ./scripts/import-workflows.sh
   ```

4. **Configure Credentials**
   - Import credential templates
   - Test each credential connection

5. **Activate Workflows**
   ```bash
   # Activate all workflows
   curl -X PUT http://localhost:5678/api/v1/workflows/bulk/activate \
     -H "X-N8N-API-KEY: $N8N_API_KEY" \
     -d '{"workflowIds": ["all"]}'
   ```

6. **Test End-to-End**
   - Submit test lead via webhook
   - Verify lead appears in CRM
   - Check SMS/email delivery
   - Confirm database logging

### Post-Deployment

- [ ] Monitor execution logs for first 24 hours
- [ ] Verify cron schedules running correctly
- [ ] Check database for duplicate prevention
- [ ] Test unsubscribe flows
- [ ] Verify rate limiting working (Twilio)
- [ ] Set up alerting (PagerDuty/Slack)
- [ ] Document any environment-specific configurations

## 🐛 Troubleshooting

### Common Issues

#### 1. Workflows Not Triggering

**Problem**: Cron workflows not executing on schedule

**Solutions**:
- Check N8N timezone configuration: `GENERIC_TIMEZONE=America/New_York`
- Verify workflow is activated: Check workflow UI
- Check execution history: Settings → Executions
- Review cron expression syntax

#### 2. SMS Not Sending

**Problem**: Twilio SMS failures

**Solutions**:
- Verify Twilio credentials in N8N
- Check phone number format (E.164: +1234567890)
- Verify Twilio account balance
- Check rate limits (default: 1 msg/sec)
- Review Twilio error codes in logs

#### 3. Email Delivery Issues

**Problem**: Emails not reaching inbox

**Solutions**:
- Verify SMTP credentials
- Check SPF/DKIM/DMARC records
- Test with mail-tester.com
- Review spam score
- Check email size (< 10MB)
- Verify HTML template validity

#### 4. Database Connection Errors

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
- Verify database is running: `docker-compose ps`
- Check connection string format
- Verify credentials in Infisical
- Check network connectivity
- Review PostgreSQL logs

#### 5. CRM Integration Failures

**Problem**: CRM API calls failing

**Solutions**:
- Verify CRM is running and accessible
- Check API key validity
- Review CRM logs for errors
- Verify request payload format
- Check CORS configuration
- Test with curl/Postman

#### 6. Webhook Not Receiving Data

**Problem**: Lead intake webhook returns 404

**Solutions**:
- Verify webhook URL is correct
- Check workflow is activated
- Verify N8N is accessible from source
- Review webhook execution history
- Check firewall rules
- Test with curl:
  ```bash
  curl -X POST http://localhost:5678/webhook/webhook-lead-intake \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+1234567890","loanAmount":400000,"propertyValue":500000}'
  ```

### Debug Mode

Enable N8N debug logging:

```bash
# In docker-compose.yml or .env
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console,file
```

View logs:
```bash
# Docker
docker-compose logs -f n8n

# Oracle VPS
oracle-vps service logs n8n-production --follow
```

## 📚 Additional Resources

### Documentation
- N8N Official Docs: https://docs.n8n.io/
- Twilio API: https://www.twilio.com/docs/sms
- Calendly API: https://developer.calendly.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Related Files
- CRM Application: `apps/crm/`
- Database Init Scripts: `bootstrap/orchestrator-mini/configs/databases/`
- Docker Compose: `bootstrap/orchestrator-mini/docker-compose.yml`
- Infisical Config: `bootstrap/orchestrator-mini/.infisical.json`

### Support
- Project Issues: https://github.com/yourorg/project-nyra/issues
- Internal Documentation: `docs/`
- Team Slack: #mortgage-automation

---

**Generated**: 2026-01-15
**Version**: 1.0.0
**Maintainer**: Project Nyra Team
