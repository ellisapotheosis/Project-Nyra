# Campaign Engine

Last updated: 2026-05-24

## Overview

The Campaign Engine orchestrates multi-channel outreach sequences for leads and borrowers.
Activepieces is the primary workflow runtime. n8n is a constrained fallback used only when
an Activepieces capability gap is documented and approved.

Service path: `services/campaign-engine` + `services/campaign-service`
Primary runtime: Activepieces
Fallback runtime: n8n (constrained — see section below)

All automated outbound is blocked unless:

1. Consent status is `granted`, OR the message is broker-internal (no borrower delivery)
2. The lead is not flagged `dnc: true`
3. No active STOP request exists for the lead

---

## Consent Gate

Before any automated outbound action executes, the consent gate evaluates:

```
consent_status == "granted"
  AND dnc == false
  AND no active stop_request
```

If the gate fails, the action is skipped — not queued, not retried automatically.
Skipped actions are logged as `CampaignStopped` with `reason: consent_gate_blocked`.
Re-enrollment requires a broker action after consent is cleared.

Exception: broker-internal steps (broker notification emails, task creation) bypass
the borrower consent gate but still check DNC and STOP flags.

---

## STOP / DNC Immediate Halt

When a STOP or DNC signal arrives (reply classifier, manual broker action, or DNC list import):

1. Immediately halt all in-flight and scheduled actions for the lead across all channels
2. Update TwentyCRM via CRM API: set `dnc: true` if permanent, set `status: dead`
3. Update Supabase: set `consent_status: revoked`, write record to `stop_requests` table
4. Emit `StopRequested` and (if permanent) `DncAdded` audit events
5. Write memory entry: "Lead [id] requested STOP via [channel] on [date]. All outbound blocked."
6. Block all future outbound permanently — this block is not lifted by re-enrollment without
   a broker override AND a new verified `ConsentGranted` event

STOP/DNC halt is fully synchronous. There is no queue, no delay, no retry gap. It executes
inline before any other action proceeds in the same execution context.

---

## Campaign Templates

### 1. New Internet Lead

Trigger: `LeadIngested` with `source: website_form | third_party_lead`
Consent: assumed granted from web form submission; verify before step 3

| Step | Channel          | Delay     | Condition                |
| ---- | ---------------- | --------- | ------------------------ |
| 1    | SMS intro        | immediate | consent gate pass        |
| 2    | Email            | +5 min    | no reply on step 1       |
| 3    | SMS follow-up    | +1 day    | no positive-intent reply |
| 4    | Voicemail drop   | +2 days   | no reply any channel     |
| 5    | Email value-prop | +4 days   | no reply                 |
| 6    | SMS final        | +7 days   | no reply                 |

Exit on: positive-intent reply, appointment-intent reply, quote-request reply, STOP/DNC.

### 2. Purchase Pre-Approval

Trigger: `LoanOpportunity.loan_purpose == purchase` + broker manually enrolls
Consent: explicit consent required before step 1

| Step | Channel                  | Delay     | Condition             |
| ---- | ------------------------ | --------- | --------------------- |
| 1    | Email pre-approval intro | immediate | consent gate pass     |
| 2    | SMS doc checklist prompt | +1 day    | no docs-request reply |
| 3    | Broker call task created | +2 days   | no reply any channel  |
| 4    | Email rate watch signup  | +5 days   | no appointment set    |

### 3. Refinance Inquiry

Trigger: `LoanOpportunity.loan_purpose == refinance | cash_out_refi`
Consent: explicit consent required

| Step | Channel                   | Delay     | Condition         |
| ---- | ------------------------- | --------- | ----------------- |
| 1    | SMS rate check offer      | immediate | consent gate pass |
| 2    | Email break-even analysis | +1 day    | no reply          |
| 3    | SMS reminder              | +3 days   | no reply          |
| 4    | Rebump follow-up          | +7 days   | no reply          |

### 4. Realtor Partner Lead

Trigger: `LeadIngested` with `realtor_partner_id` populated
Consent: assumed from referral context; verify before step 2

| Step | Channel                    | Delay     | Condition                 |
| ---- | -------------------------- | --------- | ------------------------- |
| 1    | SMS warm referral intro    | immediate | always (broker-initiated) |
| 2    | Email pre-approval offer   | +30 min   | consent confirmed         |
| 3    | SMS follow-up              | +1 day    | no reply                  |
| 4    | Realtor notification email | +2 days   | no borrower reply         |

### 5. Credit Repair Follow-Up

Trigger: Manual broker enrollment; `credit_score_band` in 620-639 or below threshold
Consent: explicit consent required

| Step | Channel                        | Delay     | Condition                    |
| ---- | ------------------------------ | --------- | ---------------------------- |
| 1    | Email credit improvement guide | immediate | consent gate pass            |
| 2    | SMS 30-day check-in            | +30 days  | no reply                     |
| 3    | Email re-qualification offer   | +60 days  | score not yet updated in CRM |

### 6. Rate Watch

Trigger: Manual enrollment or `QuoteApproved` where borrower is not yet ready to proceed
Consent: explicit consent required

| Step | Channel                       | Delay                  | Condition               |
| ---- | ----------------------------- | ---------------------- | ----------------------- |
| 1    | Email enrollment confirmation | immediate              | consent gate pass       |
| 2    | SMS rate alert                | on rate drop >= 0.125% | rate engine event fired |
| 3    | Email updated quote offer     | +1 day after alert     | no reply to alert       |

### 7. Dormant Lead Reactivation

Trigger: Lead `status: contacted` with no activity for 90+ days
Consent: prior consent must still be valid (not expired or revoked)

| Step | Channel                  | Delay     | Condition         |
| ---- | ------------------------ | --------- | ----------------- |
| 1    | Email re-engagement      | immediate | consent gate pass |
| 2    | SMS brief check-in       | +2 days   | no reply          |
| 3    | Broker task: manual call | +5 days   | no reply          |

If no response in 14 days from enrollment: mark lead `status: dead`, emit `CampaignCompleted`.

### 8. Post-Close Referral

Trigger: `LoanOpportunity.stage == closed_won`
Consent: assumed (active customer relationship)

| Step | Channel                              | Delay              | Condition             |
| ---- | ------------------------------------ | ------------------ | --------------------- |
| 1    | Email congratulations + referral ask | +3 days post-close | always                |
| 2    | SMS referral reminder                | +30 days           | no referral submitted |
| 3    | Email annual review offer            | +365 days          | always                |

### 9. Missed Call Ping

Trigger: Twilio call event `no-answer` or `voicemail` on inbound lead call
Consent: inbound call implies consent for callback

| Step | Channel              | Delay     | Condition            |
| ---- | -------------------- | --------- | -------------------- |
| 1    | SMS missed you       | immediate | consent gate pass    |
| 2    | Email callback offer | +15 min   | no reply to SMS      |
| 3    | Voicemail drop       | +1 hour   | no reply any channel |

---

## Enrollment Lifecycle

```
enroll
  └─ consent gate check
       ├─ BLOCKED → log CampaignStopped(consent_gate_blocked), stop
       └─ PASS → emit CampaignEnrolled, schedule step 1
            └─ execute action
                 ├─ reply received → classify → route to handler
                 │    └─ pause or close campaign per classification
                 ├─ STOP/DNC at any point → immediate halt (see above)
                 ├─ action fails → emit CommunicationFailed, retry per policy
                 └─ all steps exhausted → emit CampaignCompleted, close enrollment
```

---

## Reply Classification Routing

The mortgage reply classifier categorizes inbound replies. The campaign engine routes on result:

| Classification       | Campaign engine action                                     |
| -------------------- | ---------------------------------------------------------- |
| `stop_dnc`           | Immediate STOP/DNC halt                                    |
| `wrong_number`       | Pause campaign, create broker task, emit LeadUpdated       |
| `positive_intent`    | Pause automation, notify broker, create follow-up task     |
| `quote_request`      | Pause automation, trigger Quote Engine flow, notify broker |
| `docs_request`       | Pause automation, send doc checklist link, notify broker   |
| `angry_escalation`   | Immediately pause all automation, send urgent broker alert |
| `appointment_intent` | Pause automation, send Calendly booking link               |

---

## Activepieces vs. n8n

| Capability               | Activepieces                                      | n8n fallback                             |
| ------------------------ | ------------------------------------------------- | ---------------------------------------- |
| Primary workflow runtime | Yes                                               | No                                       |
| Webhook triggers         | Yes                                               | Yes                                      |
| Delay and wait steps     | Yes                                               | Yes                                      |
| Conditional branching    | Yes                                               | Yes                                      |
| Approved integrations    | Twilio, SendGrid, Calendly, Rebump, internal APIs | Same plus custom HTTP                    |
| Audit on execution       | Yes                                               | Yes (via wrapper service)                |
| Usage requirement        | Default for all campaigns                         | Only when Activepieces gap is documented |

n8n workflows must be prefixed `[FALLBACK]` in their workflow name and must have a linked
Activepieces migration ticket before going to production. All n8n executions route through
the same audit wrapper as Activepieces to ensure consistent event emission.

---

## Audit Events Emitted

| Trigger                    | Event                                            |
| -------------------------- | ------------------------------------------------ |
| Lead enrolled in campaign  | `CampaignEnrolled`                               |
| Step executed successfully | `CommunicationSent`                              |
| Step failed                | `CommunicationFailed`                            |
| Inbound reply received     | `ReplyReceived`                                  |
| Reply classified           | `ReplyClassified`                                |
| STOP/DNC halt              | `CampaignStopped` (reason: stop_dnc)             |
| Consent gate blocked       | `CampaignStopped` (reason: consent_gate_blocked) |
| All steps exhausted        | `CampaignCompleted`                              |
| Broker manual stop         | `CampaignStopped` (reason: broker_action)        |
