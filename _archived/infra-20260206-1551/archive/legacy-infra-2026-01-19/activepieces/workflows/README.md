# Activepieces Workflows for Project Nyra

## Overview

Activepieces workflows handle the actual message delivery for the Nyra campaign system. These workflows are called by n8n and integrate with Twilio (SMS/voice) and SendGrid (email).

## Workflows

### 1. send_sms.json
**Purpose**: Send SMS messages with TCPA compliance

**Features**:
- Twilio SMS integration
- Automatic opt-out keyword injection
- Opt-out keyword detection
- Prometheus metrics logging
- Error handling and retries

**Webhook**: `POST /webhooks/send_sms`

**Input**:
```json
{
  "to": "+15555551234",
  "body": "Hi John! Your mortgage quote is ready...",
  "lead_id": "lead_12345",
  "step_id": "day1_instant_sms"
}
```

**Output**:
```json
{
  "status": "success",
  "channel": "sms",
  "message_id": "SM1234567890",
  "lead_id": "lead_12345",
  "step_id": "day1_instant_sms",
  "sent_at": "2026-01-12T15:30:00.000Z"
}
```

**Compliance Features**:
- Automatically appends "Reply STOP to opt out" if not present
- Detects opt-out keywords in message body
- Logs all sends to Prometheus
- Returns detailed status for audit trail

### 2. send_email.json
**Purpose**: Send HTML/text emails with CAN-SPAM compliance

**Features**:
- SendGrid integration
- Automatic unsubscribe link injection
- HTML and text versions
- Prometheus metrics logging
- Error handling and retries

**Webhook**: `POST /webhooks/send_email`

**Input**:
```json
{
  "to": "john.doe@example.com",
  "subject": "Your Personalized Mortgage Quote - $400,000",
  "body": "Hi John,\n\nThank you for requesting a mortgage quote...",
  "lead_id": "lead_12345",
  "step_id": "day1_10min_email"
}
```

**Output**:
```json
{
  "status": "success",
  "channel": "email",
  "message_id": "EM1234567890",
  "lead_id": "lead_12345",
  "step_id": "day1_10min_email",
  "sent_at": "2026-01-12T15:40:00.000Z"
}
```

**Compliance Features**:
- Automatically converts plain text to HTML
- Adds unsubscribe link footer
- Adds privacy policy link
- Includes sender identification
- Logs all sends to Prometheus

### 3. drop_voicemail.json
**Purpose**: Drop voicemail messages using Twilio

**Features**:
- Twilio call API integration
- Text-to-speech (TTS) conversion using Polly
- Answering machine detection
- Prometheus metrics logging
- Call status tracking

**Webhook**: `POST /webhooks/drop_voicemail`

**Input**:
```json
{
  "to": "+15555551234",
  "body": "Hi John, this is Sarah from Nyra. I wanted to follow up...",
  "lead_id": "lead_12345",
  "step_id": "day1_50min_voicemail"
}
```

**Output**:
```json
{
  "status": "success",
  "channel": "voicemail",
  "call_sid": "CA1234567890",
  "lead_id": "lead_12345",
  "step_id": "day1_50min_voicemail",
  "sent_at": "2026-01-12T16:20:00.000Z"
}
```

**Features**:
- Converts text to TwiML
- Uses Polly.Joanna voice (natural, female)
- Detects answering machine with `DetectMessageEnd`
- Only plays message if voicemail detected
- Async AMD for faster processing

## Setup Instructions

### Prerequisites
- Activepieces instance running (PC4:3400)
- Twilio account with:
  - Account SID
  - Auth Token
  - Phone number
- SendGrid account with:
  - API Key
  - Verified sender email

### Import Workflows

1. **Access Activepieces**:
   ```
   http://localhost:3400
   ```

2. **Import Each Workflow**:
   - Click "Flows" → "Import"
   - Upload `send_sms.json`, `send_email.json`, `drop_voicemail.json`

3. **Configure Twilio Connection**:
   - Click "Connections" → "Add Connection"
   - Select "Twilio"
   - Enter:
     - Account SID: `ACxxxxxxxxxxxxxxxxxxxxx`
     - Auth Token: `your-auth-token`
     - From Number: `+15551234567`

4. **Configure SendGrid Connection**:
   - Click "Connections" → "Add Connection"
   - Select "SendGrid"
   - Enter:
     - API Key: `SG.xxxxxxxxxxxxxxxxxxxxx`
     - From Email: `sarah@nyra.io`
     - From Name: `Sarah Johnson - Nyra`

5. **Activate Workflows**:
   - For each workflow, click "Publish"

## Testing

### Test SMS Workflow
```bash
curl -X POST http://localhost:3400/webhooks/send_sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15555551234",
    "body": "Test SMS message from Nyra campaign",
    "lead_id": "test_lead_001",
    "step_id": "test_sms"
  }'
```

### Test Email Workflow
```bash
curl -X POST http://localhost:3400/webhooks/send_email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from Nyra",
    "body": "This is a test email from the Nyra campaign system.\n\nThank you!",
    "lead_id": "test_lead_001",
    "step_id": "test_email"
  }'
```

### Test Voicemail Workflow
```bash
curl -X POST http://localhost:3400/webhooks/drop_voicemail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15555551234",
    "body": "Hi, this is a test voicemail from the Nyra campaign system. Thank you.",
    "lead_id": "test_lead_001",
    "step_id": "test_voicemail"
  }'
```

## Workflow Architecture

### Common Pattern
Each workflow follows this pattern:

1. **Extract Webhook Data** - Parse incoming JSON
2. **Compliance Step** - Add opt-out/unsubscribe
3. **Send Message** - Call Twilio/SendGrid
4. **Log Metrics** - Push to Prometheus
5. **Return Response** - Send status back to n8n

### Error Handling
- All API calls have retry logic (3 attempts)
- Failed sends return error status
- Errors are logged to Prometheus
- n8n workflow handles retries at campaign level

## Monitoring

### Prometheus Metrics
Each workflow emits metrics:

**SMS Metrics**:
```
campaign_messages_sent{channel="sms",status="sent",step_id="day1_instant_sms"} 1
campaign_messages_sent{channel="sms",status="failed",step_id="day1_instant_sms"} 0
```

**Email Metrics**:
```
campaign_messages_sent{channel="email",status="sent",step_id="day1_10min_email"} 1
campaign_messages_sent{channel="email",status="failed",step_id="day1_10min_email"} 0
```

**Voicemail Metrics**:
```
campaign_messages_sent{channel="voicemail",status="completed",step_id="day1_50min_voicemail"} 1
campaign_messages_sent{channel="voicemail",status="no-answer",step_id="day1_50min_voicemail"} 0
```

### Grafana Dashboard
View metrics in Grafana:
```
http://localhost:3005
```

Dashboard: "Campaign Message Delivery"

## Compliance Notes

### SMS (TCPA Requirements)
- ✅ Opt-out keyword injection
- ✅ Express written consent (validated by Orchestrator)
- ✅ Quiet hours enforcement (handled by n8n)
- ✅ Immediate opt-out honor
- ✅ Audit logging

### Email (CAN-SPAM Requirements)
- ✅ Unsubscribe link in every email
- ✅ Physical address (in email template)
- ✅ Accurate subject lines
- ✅ Identification as advertisement
- ✅ Honor opt-out within 10 business days

### Voice (TCPA Requirements)
- ✅ Express written consent required
- ✅ Quiet hours enforcement
- ✅ Answering machine detection
- ✅ Clear identification
- ✅ Callback number provided

## Customization

### Change TTS Voice
Edit `drop_voicemail.json`, line with `<Say voice="Polly.Joanna">`:

Available voices:
- `Polly.Joanna` - Female, US English (recommended)
- `Polly.Matthew` - Male, US English
- `Polly.Kimberly` - Female, US English
- `Polly.Joey` - Male, US English

### Change Email Template
Edit `send_email.json`, look for the `inject_unsubscribe` step.

Modify the HTML template as needed while preserving:
- Unsubscribe link
- Privacy policy link
- Sender identification

### Add Custom Metrics
Edit the `log_metrics` step in any workflow to add custom labels or values.

## Troubleshooting

### SMS Not Sending
1. Check Twilio credentials
2. Verify phone number format (E.164: +1XXXXXXXXXX)
3. Check Twilio account balance
4. Review Twilio logs: https://console.twilio.com/

### Email Not Sending
1. Check SendGrid API key
2. Verify sender email is verified in SendGrid
3. Check SendGrid reputation
4. Review SendGrid activity: https://app.sendgrid.com/

### Voicemail Not Dropping
1. Verify Twilio voice-enabled number
2. Check answering machine detection settings
3. Test TwiML syntax
4. Review call logs in Twilio console

### Webhook Not Found
1. Verify workflow is published
2. Check webhook URL format
3. Ensure Activepieces is running on port 3400
4. Check firewall rules

## Integration with n8n

These workflows are called by the n8n `mortgage-drip-campaign` workflow:

```
n8n workflow → Activepieces webhook → Twilio/SendGrid → Message sent
```

Data flow:
1. n8n schedules message
2. n8n calls Activepieces webhook
3. Activepieces adds compliance features
4. Activepieces calls Twilio/SendGrid
5. Activepieces logs metrics
6. Activepieces returns status to n8n
7. n8n logs to TwentyCRM and Orchestrator

## Performance

### Expected Throughput
- SMS: 10 messages/second
- Email: 100 messages/second
- Voicemail: 5 calls/second

### Scaling
For higher volumes:
- Add multiple Twilio phone numbers
- Use SendGrid dedicated IPs
- Deploy multiple Activepieces instances
- Implement message queuing (RabbitMQ/Redis)

## Security

### API Keys
- Store in Activepieces credential manager
- Rotate every 90 days
- Never commit to git

### Webhook Security
In production, add webhook authentication:
1. Generate secret token
2. Add to n8n workflow headers
3. Validate in Activepieces webhook

### PII Protection
- All PII encrypted in transit (HTTPS)
- No PII logged to stdout
- Compliance audit logs stored securely

## Support

For issues or questions:
- Check Activepieces logs: `docker logs activepieces`
- Review Twilio console for SMS/call issues
- Review SendGrid dashboard for email issues
- See main documentation: `docs/CAMPAIGN_MIGRATION.md`
