# Mortgage Lead Drip Campaign Workflows - Executive Summary

Automated email, SMS, and voice drip campaigns designed to nurture mortgage leads from initial inquiry through pre-approval, closing, and post-close follow-up. Powered by flow-nexus workflows and Nyra AI assistant.

---

## Campaign Types

### 1. New Lead Nurture (7-Day Sequence)
**Goal**: Convert cold inquiry to pre-qualified lead

| Day | Channel | Content | CTA |
|-----|---------|---------|-----|
| 0 (Immediate) | Email + SMS | Personalized quote + welcome | Schedule call |
| 1 | Email | "First-Time Homebuyer Guide" | PDF Download resource |
| 3 | SMS | Success story testimonial | Watch video |
| 5 | Email | Rate update + urgency ("rates may increase") | Lock rate now |
| 7 | Video Email | Personal message from Ellis | Book consultation |

**Exit Conditions**:
- Lead responds → Move to "Active Lead" sequence
- Lead unsubscribes → Stop all campaigns
- Lead qualified → Move to "Pre-Approval" sequence

---

### 2. Pre-Approval Follow-Up (30-Day Sequence)
**Goal**: Keep pre-approved buyer engaged until they find a home

| Day | Channel | Content | CTA |
|-----|---------|---------|-----|
| 0 | Email | Pre-approval letter + next steps checklist | Download letter |
| 7 | Email + SMS | "What to Expect" during home search | Read article |
| 14 | Email | Rate lock reminder (90-day expiration) | Review options |
| 21 | Email | Realtor referral (if needed) | Connect with agent |
| 30 | SMS + Email | Pre-approval renewal offer | Update application |

**Personalization**:
- If lead clicks "realtor referral" → Send top 3 agents in their area
- If rate drops 0.25%+ → Immediate alert
- If credit score improves → Recalculate affordability

---

### 3. Application In-Progress (Weekly Checklist)
**Goal**: Keep momentum through underwriting

| Week | Content | Focus |
|------|---------|-------|
| 1 | Document checklist progress | Upload missing docs |
| 2 | Underwriting milestone update | Answer underwriter questions |
| 3 | Appraisal scheduled notification | Prepare for appraiser visit |
| 4 | Clear-to-close celebration | Schedule closing date |

**Automation**:
- Auto-pause if lead uploads all documents (success!)
- Alert Ellis if no activity for 5 days
- Send reminders for conditionally approved items

---

### 4. Post-Close Delight (12-Month Sequence)
**Goal**: Generate reviews and referrals

| Timeline | Content | Goal |
|----------|---------|------|
| Day 0 | Thank you card + review request | Google Review |
| Day 30 | First payment reminder + tips | Financial literacy |
| Day 90 | Satisfaction survey + $25 gift card | NPS score |
| Month 6 | Home maintenance checklist | Goodwill |
| Month 12 | Refinance opportunity check | Repeat business |

**Incentives**:
- 5-star review → $50 Amazon gift card
- Referral that closes → $500 bonus

---

## Campaign Workflows (Flow-Nexus Workflow Example)

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

## Email Templates (Example)

**Subject**: Your Mortgage Quote: {{estimated_rate}}% APR (Valid 7 Days)

```html
<!-- Simplified for reference -->
<div class="quote-box">
  <h2>{{estimated_rate}}% APR</h2>
  <p><strong>Loan Amount:</strong> ${{loan_amount | number_format}}</p>
  <p><strong>Estimated Monthly Payment:</strong> ${{monthly_payment | number_format}}</p>
</div>
<p style="text-align:center;">
  <a href="{{calendar_link}}" class="cta-button">Schedule Your Free Consultation</a>
</p>
```

---

## Workflow Automation Rules

- **Trigger: Lead Created**: IF `lead.status == 'new'` AND `lead.consent_email == true` THEN Enroll in "New Lead Nurture" sequence.
- **Trigger: Lead Qualified**: IF `lead.status changes to 'qualified'` THEN Pause "New Lead Nurture", Start "Pre-Approval" sequence, Assign to Ellis.
- **Trigger: Email Opened**: IF `email.opened == true` AND `email.clicks > 0` THEN Increase lead score by +10 points, Tag as "hot-lead", Send SMS follow-up within 1 hour.
- **Trigger: SMS Reply**: IF `sms.reply_received == true` THEN Pause all automated campaigns, Notify Ellis immediately, Log conversation in CRM.
- **Trigger: Rate Change**: IF `abs(market_rate - lead.quoted_rate) > 0.25` THEN Send "Rate Alert" email/SMS.

---

## Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Email Open Rate | 25% | ✅ 28% |
| Email Click Rate | 5% | ✅ 6.2% |
| SMS Response Rate | 15% | ⚠️ 12% |
| Lead-to-Qualified | 30% | ✅ 34% |
| Unsubscribe Rate | <2% | ✅ 1.1% |

**Revenue Impact (Example)**:
- Total Leads: 1,000
- Closed Loans: 58
- Avg Commission: $1,200
- Total Revenue: $69,600
- Cost per Lead: $15
- **ROI: 364%**

---

## Compliance Considerations
- **CAN-SPAM**: Physical address, honor unsubscribe (10 days), no deceptive subjects.
- **TCPA**: Explicit consent, opt-out instructions in every message, DNC list maintenance.
- **GDPR**: Explicit consent, data deletion, documented timestamps.

---

**Last Updated**: 2025-12-31
**Owner**: Ellis D Andersen LLC / West Capital Lending
