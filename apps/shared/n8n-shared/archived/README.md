# n8n Workflows for Project Nyra

## Overview

This directory contains n8n workflow definitions for the Nyra mortgage platform, specifically the 5-day drip campaign system.

## Workflows

### 1. mortgage-drip-campaign.json
**Purpose**: Complete 5-day mortgage nurture campaign with compliance checking

**Features**:
- Webhook enrollment endpoint (`POST /campaigns/enroll`)
- Loads campaign definition from YAML
- Expands message placeholders with lead data
- Schedules messages with proper delays
- Multi-channel routing (SMS, Email, Voicemail)
- Compliance checking before enrollment and before each message send
- Integration with Activepieces for message delivery
- Audit logging to Orchestrator service
- Activity logging to TwentyCRM

**Workflow Steps**:
1. **Webhook: Enroll Lead** - Receives lead enrollment request
2. **Extract Lead Data** - Parses lead information
3. **Check Compliance** - Initial TCPA compliance check
4. **Compliance Gate** - Blocks if no consent/opt-out detected
5. **Load Campaign YAML** - Reads `day1-5.yaml` campaign definition
6. **Parse YAML** - Parses campaign structure
7. **Build Message Schedule** - Expands placeholders, calculates send times
8. **Split Into Messages** - Processes each message individually
9. **Wait Until Scheduled Time** - Delays until scheduled send time
10. **Re-check Compliance** - Validates compliance at send time
11. **Final Compliance Check** - Final gate before delivery
12. **Route by Channel** - Routes to SMS/Email/Voicemail
13. **Send via Activepieces** - Delivers message
14. **Log to TwentyCRM** - Records activity in CRM
15. **Log Audit Trail** - Records compliance audit

### 2. campaign-scheduler.json
**Purpose**: Generic campaign scheduler (legacy)

Simpler workflow for scheduling individual campaign steps. Use `mortgage-drip-campaign.json` for the full 5-day campaign.

## Setup Instructions

### Prerequisites
- n8n instance running (PC4:5678)
- Activepieces instance running (PC4:3400)
- Orchestrator service running (PC4:8010)
- Campaign Engine service running (PC4:8002)
- TwentyCRM running (PC3:3000)

### Import Workflow

1. **Access n8n**:
   ```
   http://localhost:5678
   ```

2. **Import Workflow**:
   - Click "Workflows" → "Add Workflow"
   - Click "..." menu → "Import from File"
   - Select `mortgage-drip-campaign.json`

3. **Configure Environment Variables**:
   n8n uses environment variables for service URLs. Set these in your `.env` file or n8n settings:

   ```bash
   ORCHESTRATOR_URL=http://orchestrator:8010
   CAMPAIGN_ENGINE_URL=http://campaign-engine:8002
   ACTIVEPIECES_URL=http://activepieces:3400
   TWENTYCRM_URL=http://twentycrm:3000
   CAMPAIGN_PATH=/app/assets/campaigns
   ```

4. **Configure Credentials**:
   - **TwentyCRM API**: Settings → Credentials → Add Credential → "TwentyCRM API"
   - **Twilio**: Already configured in Activepieces workflows

5. **Activate Workflow**:
   - Click "Activate" toggle in top-right

## Usage

### Enroll a Lead in the Campaign

**Endpoint**: `POST http://localhost:5678/webhook/campaigns/enroll`

**Request Body**:
```json
{
  "lead_id": "lead_12345",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+15555551234",
  "email": "john.doe@example.com",
  "loan_amount": "400000",
  "interest_rate": "6.75",
  "monthly_payment": "2594",
  "credit_score_range": "740-760",
  "property_address": "123 Main St, Seattle, WA",
  "agent_name": "Sarah Johnson",
  "agent_phone": "(555) 123-4567",
  "agent_email": "sarah@nyra.io",
  "agent_nmls": "123456",
  "calendly_link": "https://calendly.com/sarah/15min",
  "unsubscribe_link": "https://nyra.io/opt-out?lead=lead_12345",
  "down_payment_estimate": "20000",
  "quote_expiry_date": "2026-02-12"
}
```

**Response**:
```json
{
  "status": "enrolled",
  "campaign_id": "day1-5",
  "scheduled_messages": 12,
  "first_message_at": "2026-01-12T15:30:00Z"
}
```

### Campaign Schedule

The workflow automatically schedules these messages:

| Day | Time | Channel | Message |
|-----|------|---------|---------|
| 0 | Instant | SMS | Quote confirmation |
| 0 | +10 min | Email | Full quote details |
| 0 | +50 min | Voicemail | Personal follow-up |
| 1 | +10 hours | SMS | Morning check-in |
| 1 | +16 hours | Email | Rate benefits |
| 2 | +13 hours | SMS | Engagement question |
| 2 | +19.5 hours | Email | Pre-approval process |
| 3 | +9 hours | SMS | Soft reminder |
| 3 | +15 hours | Email | FAQ |
| 4 | +10 hours | SMS | Final check-in |
| 4 | +16 hours | Email | Respectful close |

## Compliance Features

### TCPA Compliance
- **Express Written Consent**: Required for SMS/calls
- **Quiet Hours**: Enforced 9am-9pm local time
- **Opt-Out Keywords**: STOP, UNSUBSCRIBE, etc.
- **Immediate Opt-Out Honor**: Campaign stops immediately

### Audit Logging
Every message logs:
- Lead ID
- Step ID
- Channel
- Timestamp
- Consent status
- Compliance check result

### Compliance Gates
- **Initial Check**: Before campaign enrollment
- **Pre-Send Check**: Before each message
- **Quiet Hours**: Automatically blocks outside 9am-9pm
- **Opt-Out Check**: Prevents sending to opted-out leads

## Monitoring

### Workflow Executions
View execution history in n8n:
- Workflows → mortgage-drip-campaign → Executions

### Metrics
Prometheus metrics are emitted by:
- Activepieces workflows (send success/failure)
- Orchestrator service (compliance checks)
- Campaign Engine (campaign status)

Access Grafana dashboard:
```
http://localhost:3005
```

## Troubleshooting

### Workflow Not Triggering
1. Check webhook is activated
2. Verify firewall allows port 5678
3. Check n8n logs: `docker logs n8n`

### Messages Not Sending
1. Verify Activepieces webhooks are configured
2. Check Twilio/SendGrid credentials
3. Review compliance logs in Orchestrator

### Compliance Blocks
1. Check consent records: `GET http://localhost:8010/audit/logs`
2. Verify lead has consent: `POST http://localhost:8010/consent/add`
3. Check for opt-out: `GET http://localhost:8010/audit/stats`

## Development

### Testing Workflow
Use n8n's "Execute Workflow" button with test data:

```json
{
  "lead_id": "test_lead_001",
  "first_name": "Test",
  "last_name": "User",
  "phone": "+15555550000",
  "email": "test@example.com",
  "loan_amount": "300000",
  "interest_rate": "6.50",
  "monthly_payment": "1896",
  "credit_score_range": "700-720",
  "property_address": "Test Property",
  "agent_name": "Test Agent",
  "agent_phone": "(555) 000-0000",
  "agent_email": "test@nyra.io",
  "agent_nmls": "000000",
  "calendly_link": "https://calendly.com/test",
  "unsubscribe_link": "https://nyra.io/opt-out?lead=test"
}
```

### Modifying Campaign
1. Edit `assets/campaigns/day1-5.yaml`
2. Workflow automatically loads latest version
3. No n8n restart required

## Integration with Other Services

### Campaign Engine (PC4:8002)
- Campaign CRUD operations
- Campaign status management

### Orchestrator (PC4:8010)
- Compliance validation
- Audit logging
- Consent management

### TwentyCRM (PC3:3000)
- Lead storage
- Activity timeline
- Contact management

### Activepieces (PC4:3400)
- SMS delivery (Twilio)
- Email delivery (SendGrid)
- Voicemail drops (Twilio)

## Security Notes

- **API Keys**: Store in n8n credential manager
- **Webhook Security**: Use webhook authentication in production
- **PII Protection**: All PII is encrypted at rest
- **Audit Trail**: Complete compliance audit log maintained

## Support

For issues or questions:
- Check n8n logs: `docker logs n8n`
- Review Orchestrator compliance logs: `GET /audit/logs`
- See main documentation: `docs/architecture/WORKFLOW-ORCHESTRATION.md`
