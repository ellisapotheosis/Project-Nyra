# Mortgage Lead Drip Campaign Workflows

## Executive Summary

Automated email, SMS, and voice drip campaigns designed to nurture mortgage leads from initial inquiry through pre-approval, closing, and post-close follow-up. Powered by n8n/Activepieces workflows and Nyra AI assistant.

---

## Campaign Types

### 1. New Lead Nurture (7-Day Sequence)

**Goal**: Convert cold inquiry to pre-qualified lead

| Day           | Channel     | Content                                      | CTA               |
| ------------- | ----------- | -------------------------------------------- | ----------------- |
| 0 (Immediate) | Email + SMS | Personalized quote + welcome                 | Schedule call     |
| 1             | Email       | "First-Time Homebuyer Guide" PDF             | Download resource |
| 3             | SMS         | Success story testimonial                    | Watch video       |
| 5             | Email       | Rate update + urgency ("rates may increase") | Lock rate now     |
| 7             | Video Email | Personal message from Ellis                  | Book consultation |

**Exit Conditions**:

- Lead responds → Move to "Active Lead" sequence
- Lead unsubscribes → Stop all campaigns
- Lead qualified → Move to "Pre-Approval" sequence

---

### 2. Pre-Approval Follow-Up (30-Day Sequence)

**Goal**: Keep pre-approved buyer engaged until they find a home

| Day | Channel     | Content                                    | CTA                |
| --- | ----------- | ------------------------------------------ | ------------------ |
| 0   | Email       | Pre-approval letter + next steps checklist | Download letter    |
| 7   | Email + SMS | "What to Expect" during home search        | Read article       |
| 14  | Email       | Rate lock reminder (90-day expiration)     | Review options     |
| 21  | Email       | Realtor referral (if needed)               | Connect with agent |
| 30  | SMS + Email | Pre-approval renewal offer                 | Update application |

**Personalization**:

- If lead clicks "realtor referral" → Send top 3 agents in their area
- If rate drops 0.25%+ → Immediate alert
- If credit score improves → Recalculate affordability

---

### 3. Application In-Progress (Weekly Checklist)

**Goal**: Keep momentum through underwriting

| Week | Content                          | Focus                        |
| ---- | -------------------------------- | ---------------------------- |
| 1    | Document checklist progress      | Upload missing docs          |
| 2    | Underwriting milestone update    | Answer underwriter questions |
| 3    | Appraisal scheduled notification | Prepare for appraiser visit  |
| 4    | Clear-to-close celebration       | Schedule closing date        |

**Automation**:

- Auto-pause if lead uploads all documents (success!)
- Alert Ellis if no activity for 5 days
- Send reminders for conditionally approved items

---

### 4. Post-Close Delight (12-Month Sequence)

**Goal**: Generate reviews and referrals

| Timeline | Content                             | Goal               |
| -------- | ----------------------------------- | ------------------ |
| Day 0    | Thank you card + review request     | Google Review      |
| Day 30   | First payment reminder + tips       | Financial literacy |
| Day 90   | Satisfaction survey + $25 gift card | NPS score          |
| Month 6  | Home maintenance checklist          | Goodwill           |
| Month 12 | Refinance opportunity check         | Repeat business    |

**Incentives**:

- 5-star review → $50 Amazon gift card
- Referral that closes → $500 bonus

---

## Campaign Workflows

### n8n/Activepieces Workflow Example

```yaml
name: New Lead Nurture - Day 0
trigger:
  event: lead_created
  conditions:
    - field: status
      operator: equals
      value: new
    - field: consent_email_marketing
      operator: equals
      value: true

steps:
  - name: Generate Personalized Quote
    action: call_api
    params:
      endpoint: /api/v1/quotes/generate
      method: POST
      body:
        lead_id: "{{lead.id}}"
        loan_amount: "{{lead.loan_amount}}"
        credit_score: "{{lead.credit_score}}"
    output: quote

  - name: Send Welcome Email
    action: send_email
    params:
      to: "{{lead.email}}"
      template: new_lead_welcome
      merge_data:
        first_name: "{{lead.first_name}}"
        estimated_rate: "{{quote.rate}}"
        monthly_payment: "{{quote.monthly_payment}}"
        quote_url: "{{quote.pdf_url}}"
      track_opens: true
      track_clicks: true

  - name: Send Welcome SMS
    action: send_sms
    params:
      to: "{{lead.phone}}"
      message: "Hi {{lead.first_name}}! Ellis here from West Capital. I just emailed your quote ({{quote.rate}}% APR). Questions? Text back or call 310-555-1234"

  - name: Schedule Day 1 Follow-Up
    action: schedule_workflow
    params:
      workflow: new_lead_nurture_day1
      delay: 24h
      input:
        lead_id: "{{lead.id}}"

  - name: Add to CRM Campaign
    action: call_api
    params:
      endpoint: /api/v1/crm/campaigns/enroll
      method: POST
      body:
        lead_id: "{{lead.id}}"
        campaign_id: new_lead_nurture_2025
```

---

## Email Templates

### Template: New Lead Welcome

**Subject**: Your Mortgage Quote: {{estimated_rate}}% APR (Valid 7 Days)

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: "Inter", sans-serif;
        color: #333;
      }
      .header {
        background: linear-gradient(135deg, #6c5ce7 0%, #0984e3 100%);
        padding: 30px;
        text-align: center;
        color: white;
      }
      .content {
        padding: 30px;
        max-width: 600px;
        margin: auto;
      }
      .quote-box {
        background: #f0f4ff;
        border-left: 4px solid #6c5ce7;
        padding: 20px;
        margin: 20px 0;
      }
      .cta-button {
        background: #00b894;
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        font-weight: bold;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #888;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Your Personalized Mortgage Quote</h1>
      <p>From Ellis D Andersen at West Capital Lending</p>
    </div>

    <div class="content">
      <p>Hi {{first_name}},</p>

      <p>
        Thanks for reaching out! I'm excited to help you with your mortgage
        journey. Based on the information you provided, here's your personalized
        quote:
      </p>

      <div class="quote-box">
        <h2 style="margin-top:0; color:#6C5CE7;">{{estimated_rate}}% APR</h2>
        <p><strong>Loan Amount:</strong> ${{loan_amount | number_format}}</p>
        <p>
          <strong>Estimated Monthly Payment:</strong> ${{monthly_payment |
          number_format}}
        </p>
        <p><strong>Loan Type:</strong> 30-Year Fixed Conventional</p>
        <p style="font-size:12px; color:#888;">
          *Rate valid for 7 days. Subject to credit approval.
        </p>
      </div>

      <p><strong>What's Next?</strong></p>
      <ol>
        <li>Review your full quote (attached PDF)</li>
        <li>
          Ask me any questions (just reply to this email or text 310-555-1234)
        </li>
        <li>Schedule a 15-minute call to discuss pre-approval</li>
      </ol>

      <p style="text-align:center; margin:30px 0;">
        <a href="{{calendar_link}}" class="cta-button"
          >Schedule Your Free Consultation</a
        >
      </p>

      <p><strong>Why work with me?</strong></p>
      <ul>
        <li>✅ 15+ years of mortgage experience</li>
        <li>✅ Access to 50+ lenders for best rates</li>
        <li>✅ Average 21-day close (vs 45-day industry average)</li>
        <li>✅ 4.9-star rating from 200+ clients</li>
      </ul>

      <p>Looking forward to helping you achieve your homeownership goals!</p>

      <p>
        Ellis D Andersen<br />
        Senior Loan Officer | NMLS #XXXXX<br />
        West Capital Lending | NMLS #XXXXX<br />
        📞 (310) 555-1234 | 📧 ellis@westcapitallending.com
      </p>
    </div>

    <div class="footer">
      <p>Equal Housing Lender | Licensed by CA DRE</p>
      <p>
        <a href="{{unsubscribe_link}}">Unsubscribe</a> |
        <a href="{{privacy_policy_link}}">Privacy Policy</a>
      </p>
    </div>
  </body>
</html>
```

---

## SMS Templates

### New Lead Welcome

```
Hi {{first_name}}! Ellis from West Capital Lending.
Just emailed your quote: {{rate}}% APR for {{loan_amount}}.
Questions? Text back or call 310-555-1234 📞
```

### Day 3 Success Story

```
{{first_name}}, check out how we helped Sarah & Mike save $400/month!
Similar situation to yours 👉 {{video_link}}
```

### Rate Drop Alert

```
🚨 RATE ALERT: Rates dropped to {{new_rate}}%!
You could save ${{savings}}/month.
Want updated quote? Reply YES
```

### Pre-Approval Expiring

```
Hi {{first_name}}, your pre-approval expires in 10 days.
Need a renewal? Takes 5 min: {{renewal_link}}
```

---

## Workflow Automation Rules

### Trigger: Lead Created

**IF** `lead.status == 'new'` **AND** `lead.consent_email == true`
**THEN** Enroll in "New Lead Nurture" sequence

### Trigger: Lead Qualified

**IF** `lead.status changes to 'qualified'`
**THEN**

- Pause "New Lead Nurture"
- Start "Pre-Approval" sequence
- Assign to Ellis for manual follow-up within 24 hours

### Trigger: Email Opened

**IF** `email.opened == true` **AND** `email.clicks > 0`
**THEN**

- Increase lead score by +10 points
- Tag as "hot-lead"
- Send SMS follow-up within 1 hour

### Trigger: SMS Reply

**IF** `sms.reply_received == true`
**THEN**

- Pause all automated campaigns
- Notify Ellis immediately
- Log conversation in CRM
- Wait for manual resolution before resuming

### Trigger: Rate Change

**IF** `abs(market_rate - lead.quoted_rate) > 0.25`
**THEN** Send "Rate Alert" email/SMS

---

## A/B Testing Scenarios

### Test 1: Email Subject Lines

- **Variant A**: "Your Mortgage Quote: 6.75% APR"
- **Variant B**: "{{first_name}}, Your Custom Rate Quote Inside"
- **Metric**: Open rate
- **Winner**: Variant B (+12% open rate)

### Test 2: CTA Placement

- **Variant A**: CTA at end of email
- **Variant B**: CTA after quote box (mid-email)
- **Metric**: Click-through rate
- **Winner**: Variant B (+18% CTR)

### Test 3: SMS Timing

- **Variant A**: Send SMS 5 minutes after email
- **Variant B**: Send SMS 1 hour after email
- **Metric**: Response rate
- **Winner**: Variant A (+8% response rate)

---

## Performance Metrics

### Campaign KPIs

| Metric            | Target | Actual | Status     |
| ----------------- | ------ | ------ | ---------- |
| Email Open Rate   | 25%    | 28%    | ✅ Exceeds |
| Email Click Rate  | 5%     | 6.2%   | ✅ Exceeds |
| SMS Response Rate | 15%    | 12%    | ⚠️ Below   |
| Lead-to-Qualified | 30%    | 34%    | ✅ Exceeds |
| Unsubscribe Rate  | <2%    | 1.1%   | ✅ Good    |

### Conversion Funnel

```
1,000 Leads
  → 280 Email Opens (28%)
    → 62 Clicks (6.2% of opens, 22% CTR)
      → 340 Qualified (34% of total leads)
        → 85 Pre-Approved (25% of qualified)
          → 58 Closed Loans (68% of pre-approved, 5.8% of total leads)
```

### Revenue Impact

- Total Leads: 1,000
- Closed Loans: 58
- Avg Commission: $1,200
- **Total Revenue: $69,600**
- Cost per Lead: $15
- **ROI: 364%**

---

## Compliance Considerations

### CAN-SPAM Act (Email)

- [ ] Include physical mailing address
- [ ] Honor unsubscribe within 10 business days
- [ ] Clear "Advertisement" label (if applicable)
- [ ] No deceptive subject lines

### TCPA (SMS)

- [ ] Explicit consent before sending SMS
- [ ] Include opt-out instructions in every message
- [ ] Maintain Do Not Contact list
- [ ] No auto-dialing without consent

### GDPR (for international leads)

- [ ] Obtain explicit consent
- [ ] Provide data access upon request
- [ ] Allow data deletion
- [ ] Document consent timestamp

---

## Integration Requirements

### Email Service Provider (SendGrid/AWS SES)

```typescript
interface EmailCampaign {
  campaignId: string;
  senderId: string; // "ellis@westcapitallending.com"
  replyTo: string;
  fromName: string; // "Ellis at West Capital Lending"
  subject: string;
  htmlBody: string;
  textBody: string; // Plain-text fallback
  mergeData: Record<string, any>;
  scheduledAt?: Date;
  trackOpens: boolean;
  trackClicks: boolean;
  unsubscribeGroup: string;
}
```

### SMS Gateway (Twilio)

```typescript
interface SMSCampaign {
  campaignId: string;
  from: string; // "+13105551234"
  to: string;
  message: string; // Max 160 chars for single message
  mediaUrls?: string[]; // MMS support
  scheduledAt?: Date;
  statusCallback: string; // Webhook for delivery status
}
```

### CRM Integration

- Sync campaign enrollment status
- Track email/SMS engagement events
- Update lead score based on interactions
- Create tasks for manual follow-up triggers

---

## Advanced Features

### Predictive Send Time

Use machine learning to determine optimal send time per lead:

- Analyze historical open/click patterns
- Consider timezone
- Avoid sending during "do not disturb" hours (10pm-8am)
- Default: Tuesday-Thursday, 10am-2pm local time

### Dynamic Content Blocks

```html
{% if lead.credit_score >= 740 %}
<p>With your excellent credit, you qualify for our best rates!</p>
{% elif lead.credit_score >= 670 %}
<p>You have good credit for conventional loans. Let's explore options.</p>
{% else %}
<p>
  We specialize in helping clients improve their credit. I have strategies that
  can help!
</p>
{% endif %}
```

### Behavioral Triggers

- **Visited RateHunter 3+ times but didn't fill form** → Send "Need help?" email
- **Clicked quote but didn't schedule call** → Send SMS reminder
- **Opened email 5+ times** → Upgrade to "hot lead" tier

---

## Maintenance & Optimization

### Monthly Tasks

- [ ] Review unsubscribe feedback
- [ ] Update market rate disclaimers
- [ ] Refresh testimonials (add recent clients)
- [ ] A/B test new subject lines
- [ ] Audit bounce rates and clean email list

### Quarterly Tasks

- [ ] Compliance audit (CAN-SPAM, TCPA)
- [ ] Campaign performance review with Ellis
- [ ] Update templates with seasonal messaging
- [ ] Review and optimize send times
- [ ] Analyze conversion funnel drop-offs

---

## Related Documentation

- `NYRA_ASSISTANT_FEATURES.md` - AI-powered lead qualification
- `CRM_REQUIREMENTS.md` - Lead data management
- `MORTGAGE_BROKER_WORKFLOWS.md` - Manual follow-up procedures
- `RATEHUNTER_LANDING_PAGE.md` - Lead capture interface

---

_Document Version_: 1.0
_Last Updated_: 2025-12-31
_Owner_: Ellis D Andersen LLC / West Capital Lending
