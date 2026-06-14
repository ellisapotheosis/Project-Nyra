# Project Nyra - n8n Workflow Templates

This directory contains production-ready n8n workflow templates for automated mortgage lead management, campaign orchestration, and compliance monitoring.

## Available Workflows

### 1. Mortgage 45-Day Drip Campaign (`templates/mortgage-45-day-drip-campaign.json`) ✅
**Trigger**: HTTP Webhook (POST /start-campaign)
**Purpose**: Complete 45-day automated nurture campaign for mortgage leads

**Touchpoints**:
- **Day 0**: Welcome email with quote details
- **Day 3**: Follow-up SMS check-in
- **Day 7**: Educational email about mortgage rates
- **Day 14**: Application reminder SMS
- **Day 21**: Automated voice call check-in
- **Day 30**: Rate alert (conditional on rate changes)
- **Day 45**: Final touchpoint email

**Features**:
- Multi-channel (email, SMS, voice)
- Conditional logic for rate alerts
- Automatic campaign status tracking
- Complete audit logging
- Database integration (PostgreSQL)
- Compliance-ready messaging

**Required Credentials**:
- PostgreSQL (Nyra database)
- SMTP (Email delivery)
- Twilio (SMS/Voice)

**Webhook URL**: `http://n8n:5678/webhook/start-campaign`

**Integration**:
```bash
# Trigger campaign after quote generation
curl -X POST http://n8n:5678/webhook/start-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "borrower_id": "uuid-here",
    "body": {
      "borrower_id": "uuid-here"
    }
  }'
```

---

### 2. Lead Capture Webhook (`01-lead-capture-webhook.json`) 🚧
**Status**: Template available in existing README
**Trigger**: HTTP Webhook
**Purpose**: Capture leads from RateHunter frontend, generate quotes, and initiate welcome campaigns

---

### 3. Drip Campaign Automation (`02-drip-campaign-automation.json`) 🚧
**Status**: Superseded by 45-day drip campaign template
**Note**: The comprehensive 45-day template above provides all drip campaign functionality

---

### 3. Quote Follow-Up Sequence (`03-quote-follow-up-sequence.json`)
**Trigger**: Cron (3x daily at 10 AM, 2 PM, 6 PM)
**Purpose**: Multi-touch follow-up sequence for quoted leads

**Flow**:
1. Get leads with quotes from last 7 days (follow-up count < 3)
2. Calculate days since quote
3. Send appropriate email:
   - **Day 1**: Quote ready + next steps
   - **Day 3**: FAQ + consultation scheduling
   - **Day 5**: Urgency + rate lock expiration
4. Send SMS notification (Day 1 only)
5. Update follow-up tracking

**Features**:
- Smart template selection based on quote age
- Multi-channel (Email + SMS)
- Conversion-optimized copy with CTAs

---

### 4. Compliance Check Workflow (`04-compliance-check-workflow.json`)
**Trigger**: HTTP Webhook
**Purpose**: Automated regulatory compliance verification

**Flow**:
1. Webhook receives lead data for compliance check
2. Run comprehensive compliance checks:
   - **RESPA**: Disclosure timing (3 business days)
   - **TILA**: Truth in Lending Act disclosures
   - **ECOA**: Adverse action notices (30 days)
   - **FCRA**: Credit pull consent
   - **HMDA**: Demographic data collection
   - **ATR**: Ability to Repay (DTI ratio validation)
   - **SAFE Act**: Loan officer NMLS verification
3. Save compliance check results
4. Alert compliance team if issues found:
   - **Critical**: Immediate email + orchestrator notification
   - **High/Medium**: Standard alert email
5. Return compliance report

**Alert Thresholds**:
- Critical: FCRA violations, ECOA violations, missing NMLS
- High: RESPA/TILA timing issues, ATR concerns
- Medium: HMDA data gaps

---

### 5. Rate Alert Notifications (`05-rate-alert-notifications.json`)
**Trigger**: Cron (Every 4 hours)
**Purpose**: Monitor market rates and alert leads when rates drop

**Flow**:
1. Fetch current mortgage rates (Freddie Mac API)
2. Parse and save rate data
3. Query leads with rate alerts enabled
4. Calculate potential savings vs quoted rate
5. If rate dropped ≥0.125%:
   - Send email alert (major drop ≥0.25% or standard)
   - Send SMS notification
   - Log alert sent
6. Display monthly and lifetime savings

**Rate Types Monitored**:
- Conventional 30-year
- Conventional 15-year
- FHA 30-year
- VA 30-year

**Alert Logic**:
- Minor drop (0.125-0.24%): Standard email
- Major drop (≥0.25%): Enhanced email + SMS
- Savings calculated based on loan amount

---

## Setup Instructions

### 1. Import Workflows

1. Access n8n dashboard: `http://localhost:5678`
2. Navigate to **Workflows** → **Import from File**
3. Import each JSON file
4. Activate workflows after configuration

### 2. Configure Credentials

#### PostgreSQL - Letta Database
```
Host: letta_postgres
Port: 5432
Database: letta_db
User: letta
Password: <from .env>
```

#### SMTP - SendGrid
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: <SendGrid API Key>
```

#### Twilio SMS
```
Account SID: <from Twilio>
Auth Token: <from Twilio>
From Number: <your Twilio number>
```

#### Freddie Mac API (Rate Alerts)
```
Header Auth:
  Name: X-API-Key
  Value: <Freddie Mac API Key>
```

### 3. Environment Variables

Add to `.env`:
```bash
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<secure-password>

# Webhook Base URL
WEBHOOK_URL=http://n8n:5678/webhook

# SendGrid
SENDGRID_API_KEY=<your-key>

# Twilio
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>

# Freddie Mac
FREDDIE_MAC_API_KEY=<your-key>
```

### 4. Database Schema

Run these SQL migrations before activating workflows:

```sql
-- Compliance checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
  id SERIAL,
  lead_id INTEGER REFERENCES leads(id),
  check_date TIMESTAMP NOT NULL,
  compliant BOOLEAN NOT NULL,
  issues_count INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  issues_detail JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Rate alerts table
CREATE TABLE IF NOT EXISTS rate_alerts (
  id SERIAL,
  lead_id INTEGER REFERENCES leads(id),
  old_rate DECIMAL(5,3) NOT NULL,
  new_rate DECIMAL(5,3) NOT NULL,
  savings DECIMAL(5,3) NOT NULL,
  alert_sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Mortgage rates history
CREATE TABLE IF NOT EXISTS mortgage_rates (
  id SERIAL,
  conventional_30yr DECIMAL(5,3),
  conventional_15yr DECIMAL(5,3),
  fha_30yr DECIMAL(5,3),
  va_30yr DECIMAL(5,3),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Lead tracking fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_follow_up TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rate_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_status VARCHAR(50) DEFAULT 'active';
```

### 5. Webhook Integration

Update RateHunter frontend to call n8n webhooks:

**Lead Capture** (`apps/ratehunter/app/api/quote/route.ts`):
```typescript
// After generating quote, trigger n8n
await fetch('http://n8n:5678/webhook/lead-capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadData)
});
```

**Compliance Check** (Quote Engine service):
```python
# After lead data collection
response = httpx.post(
    "http://n8n:5678/webhook/compliance-check",
    json=lead_data
)
```

---

## Monitoring & Maintenance

### Workflow Execution History
- Access: n8n Dashboard → **Executions**
- Filter by workflow to see success/failure rates
- Review error logs for debugging

### Email Deliverability
- Monitor SendGrid dashboard for bounce/spam rates
- Keep complaint rate < 0.1%
- Maintain list hygiene (remove bounces)

### Compliance Alerts
- Review compliance dashboard weekly
- Address critical issues within 24 hours
- Document remediation actions

### Rate Data Quality
- Verify Freddie Mac API uptime
- Check rate data freshness (should update every 4 hours)
- Alert if rate data stale > 8 hours

---

## Customization

### Email Templates
Edit HTML in email node `message` parameter. Use Handlebars syntax:
```html
{{$json.firstName}} - Access lead data
{{$node['Previous Node'].json.field}} - Access previous node data
```

### Timing Adjustments
Cron expressions for schedule triggers:
```
0 9 * * *        - Daily at 9 AM
0 */4 * * *      - Every 4 hours
0 10,14,18 * * * - 10 AM, 2 PM, 6 PM daily
```

### Compliance Rules
Update `code-run-checks` node JavaScript to add/modify rules:
```javascript
// Add new check
if (!leadData.newRequirement) {
  issues.push({
    type: 'NEW_REG',
    severity: 'high',
    message: 'Description of issue',
    regulation: 'Citation'
  });
}
```

---

## Best Practices

1. **Test workflows** on staging before production
2. **Monitor execution logs** daily for errors
3. **Keep credentials secure** - use n8n's encrypted storage
4. **Rate limit external APIs** to avoid throttling
5. **Implement error handling** - add error branches for critical flows
6. **Document customizations** - maintain this README
7. **Regular backups** - export workflows monthly
8. **A/B test email copy** - track conversion metrics
9. **Compliance audits** - quarterly review of rules
10. **Performance optimization** - batch operations where possible

---

## Support

- **n8n Documentation**: https://docs.n8n.io
- **Workflow Issues**: Check execution logs and error output
- **Email Deliverability**: Contact SendGrid support
- **Compliance Questions**: Consult legal team

---

## Version History

- **v1.0.0** (2026-01-11): Initial workflow templates
  - Lead capture webhook
  - Drip campaign automation
  - Quote follow-up sequence
  - Compliance checking
  - Rate alert notifications

---

**Generated**: 2026-01-11
**Maintained by**: Project Nyra Development Team
