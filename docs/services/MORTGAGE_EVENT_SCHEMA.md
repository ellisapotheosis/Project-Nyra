# Mortgage Event Schema

Last updated: 2026-05-24

## Overview

All service mutations in Project Nyra produce structured integration events. Events flow
through the internal event bus and are consumed by audit logging, memory writing, campaign
orchestration, and CRM sync. This document is the canonical reference for event shapes,
required fields, and retention rules.

---

## Universal Required Fields

Every event — regardless of type — must include these fields:

```json
{
  "event_id": "evt_01HABC123",
  "event_type": "LeadIngested",
  "source_service": "crm-api | quote-engine | campaign-engine | rate-comparison-engine | quote-api | system",
  "timestamp": "2026-05-24T12:00:00.000Z",
  "schema_version": "1.0",
  "lead_id": "lead_01HXYZ | null",
  "actor": {
    "type": "agent | human | system",
    "id": "broker_01H000 | agent_nyra | system",
    "display_name": "optional"
  },
  "audit_required": true,
  "environment": "production | staging | development"
}
```

`lead_id` is null only for system-level events not associated with a specific lead
(health checks, schema migrations). All events touching a lead must carry `lead_id`.

---

## Lead Lifecycle Events

### LeadIngested

Emitted when a new lead record is created (web form, import, or manual entry).

```json
{
  "event_type": "LeadIngested",
  "source_service": "crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "source": "website_form | third_party_lead | import | manual",
    "initial_consent_status": "unknown | granted",
    "phone_hash": "sha256-truncated",
    "email_hash": "sha256-truncated",
    "external_crm_id": "twenty_person_abc123"
  }
}
```

### LeadUpdated

Emitted on any field change to a lead or borrower record.

```json
{
  "event_type": "LeadUpdated",
  "source_service": "crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "changed_fields": ["status", "assigned_broker_id"],
    "previous": { "status": "new" },
    "current": { "status": "contacted" },
    "reason": "broker_action | system | campaign_trigger"
  }
}
```

### ConsentGranted

```json
{
  "event_type": "ConsentGranted",
  "source_service": "crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "channel": "sms | email | all",
    "consent_source": "reply | form | broker",
    "consent_text_hash": "sha256-truncated",
    "ip_address": "redacted_or_null"
  }
}
```

### ConsentRevoked

```json
{
  "event_type": "ConsentRevoked",
  "source_service": "crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "channel": "sms | email | all",
    "revocation_source": "reply | broker | dnc_import",
    "permanent": false
  }
}
```

---

## STOP / DNC Events

### StopRequested

```json
{
  "event_type": "StopRequested",
  "source_service": "campaign-engine | crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "reason": "borrower_request | wrong_number | dnc_list | broker_action",
    "channel_trigger": "sms | email | call | manual",
    "inbound_message_id": "twilio_msg_xyz | null",
    "permanent": false
  }
}
```

### DncAdded

```json
{
  "event_type": "DncAdded",
  "source_service": "crm-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "dnc_source": "borrower_request | federal_dnc_list | state_list | broker_action",
    "phone_hash": "sha256-truncated",
    "email_hash": "sha256-truncated",
    "effective_date": "2026-05-24"
  }
}
```

---

## Campaign Events

### CampaignEnrolled

```json
{
  "event_type": "CampaignEnrolled",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "campaign_template": "new_internet_lead | purchase_pre_approval | refinance_inquiry | realtor_partner_lead | credit_repair_follow_up | rate_watch | dormant_reactivation | post_close_referral | missed_call_ping",
    "enrollment_id": "enroll_01HABC",
    "runtime": "activepieces | n8n",
    "enrolled_by": "system | broker_01H000"
  }
}
```

### CampaignCompleted

```json
{
  "event_type": "CampaignCompleted",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "enrollment_id": "enroll_01HABC",
    "campaign_template": "new_internet_lead",
    "completion_reason": "all_steps_exhausted | reply_converted | appointment_set | manual_close",
    "steps_executed": 4,
    "steps_skipped": 2
  }
}
```

### CampaignStopped

```json
{
  "event_type": "CampaignStopped",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "enrollment_id": "enroll_01HABC",
    "stop_reason": "stop_dnc | consent_gate_blocked | broker_action | wrong_number",
    "stopped_at_step": 2,
    "all_channels_halted": true
  }
}
```

---

## Quote Events

### QuoteRequested

```json
{
  "event_type": "QuoteRequested",
  "source_service": "quote-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "request_id": "qe_req_01HABC",
    "opportunity_id": "opp_01HJKL",
    "broker_id": "broker_01H000",
    "is_mock": false
  }
}
```

### QuoteGenerated

```json
{
  "event_type": "QuoteGenerated",
  "source_service": "quote-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "quote_id": "qpkg_01HSTU",
    "request_id": "qe_req_01HABC",
    "is_mock": false,
    "options_count": 3,
    "approval_status": "pending",
    "expires_at": "2026-05-24T16:01:00Z"
  }
}
```

### QuoteApproved

```json
{
  "event_type": "QuoteApproved",
  "source_service": "quote-api",
  "lead_id": "lead_01HXYZ",
  "data": {
    "quote_id": "qpkg_01HSTU",
    "approved_by": "broker_01H000",
    "approved_at": "2026-05-24T13:22:00Z"
  }
}
```

### QuoteSent

```json
{
  "event_type": "QuoteSent",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "quote_id": "qpkg_01HSTU",
    "channel": "sms | email | portal",
    "sent_at": "2026-05-24T13:25:00Z",
    "is_mock": false
  }
}
```

---

## Rate Quote Events

### RateQuoteRequested

```json
{
  "event_type": "RateQuoteRequested",
  "source_service": "quote-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "request_id": "rqr_01HABCD",
    "opportunity_id": "opp_01HJKL",
    "loan_type": "conventional",
    "loan_amount_usd": 360000,
    "is_mock": false
  }
}
```

### RateQuoteReturned

```json
{
  "event_type": "RateQuoteReturned",
  "source_service": "rate-comparison-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "request_id": "rqr_01HABCD",
    "status": "ok | degraded",
    "candidates_returned": 5,
    "is_mock": false,
    "latency_ms": 340
  }
}
```

### RateQuoteDegraded

```json
{
  "event_type": "RateQuoteDegraded",
  "source_service": "rate-comparison-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "request_id": "rqr_01HABCD",
    "health_status": "degraded | unavailable",
    "reason": "upstream_timeout | rate_sheet_stale | invalid_scenario",
    "retry_after_seconds": 30
  }
}
```

---

## Communication Events

### CommunicationSent

```json
{
  "event_type": "CommunicationSent",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "channel": "sms | email | voicemail | call",
    "provider": "twilio | sendgrid | rebump | calendly",
    "external_message_id": "twilio_sm_xyz",
    "campaign_enrollment_id": "enroll_01HABC",
    "step_number": 1,
    "template_id": "tmpl_new_internet_lead_sms_1"
  }
}
```

### CommunicationFailed

```json
{
  "event_type": "CommunicationFailed",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "channel": "sms",
    "provider": "twilio",
    "error_code": "21610",
    "error_message": "The message From/To pair violates a blacklist rule.",
    "is_dnc_signal": true,
    "campaign_enrollment_id": "enroll_01HABC",
    "step_number": 1
  }
}
```

### ReplyReceived

```json
{
  "event_type": "ReplyReceived",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "channel": "sms | email",
    "provider": "twilio | sendgrid",
    "inbound_id": "twilio_msg_inbound_xyz",
    "body_hash": "sha256-truncated",
    "received_at": "2026-05-24T12:05:00Z"
  }
}
```

### ReplyClassified

```json
{
  "event_type": "ReplyClassified",
  "source_service": "campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "inbound_id": "twilio_msg_inbound_xyz",
    "classification": "stop_dnc | wrong_number | positive_intent | quote_request | docs_request | angry_escalation | appointment_intent",
    "confidence": 0.97,
    "routing_action": "halt_campaign | pause_notify_broker | trigger_quote_flow | send_doc_checklist | urgent_escalation | send_calendly_link",
    "classifier_model": "nyra-reply-classifier-v2"
  }
}
```

---

## System and Agent Events

### AuditEventCreated

```json
{
  "event_type": "AuditEventCreated",
  "source_service": "crm-api | campaign-engine | quote-engine",
  "lead_id": "lead_01HXYZ | null",
  "data": {
    "referenced_event_id": "evt_01HPREV",
    "referenced_event_type": "LeadUpdated",
    "degraded": false,
    "retention_class": "permanent | two_years | ttl"
  }
}
```

### MemoryWritten

```json
{
  "event_type": "MemoryWritten",
  "source_service": "crm-api | campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "memory_key": "stop_request_2026-05-24",
    "memory_summary": "Lead requested STOP via SMS on 2026-05-24. All outbound blocked.",
    "ttl_days": 730,
    "memory_provider": "mem0 | supabase"
  }
}
```

### AgentToolCalled

```json
{
  "event_type": "AgentToolCalled",
  "source_service": "agent-nyra",
  "lead_id": "lead_01HXYZ | null",
  "data": {
    "tool_name": "send_sms | create_quote | update_crm | classify_reply",
    "tool_version": "1.2.0",
    "invocation_id": "inv_01HZZZZ",
    "input_hash": "sha256-truncated",
    "outcome": "success | error | degraded",
    "duration_ms": 112
  }
}
```

### HumanApprovalRequested

```json
{
  "event_type": "HumanApprovalRequested",
  "source_service": "quote-api | campaign-engine",
  "lead_id": "lead_01HXYZ",
  "data": {
    "approval_type": "quote_approval | send_approval | escalation_review",
    "resource_id": "qpkg_01HSTU",
    "requested_from": "broker_01H000",
    "expires_at": "2026-05-24T16:00:00Z",
    "urgency": "normal | high"
  }
}
```

---

## Retention Policy

| Event class                                                     | Retention                | Storage location                      |
| --------------------------------------------------------------- | ------------------------ | ------------------------------------- |
| Audit events (all mutation events, AuditEventCreated)           | Permanent                | Supabase `audit_events` (append-only) |
| STOP and DNC events                                             | Permanent, never purged  | Supabase `audit_events`               |
| Campaign events (CampaignEnrolled, CommunicationSent, etc.)     | 2 years                  | Supabase `campaign_events`            |
| Memory events (MemoryWritten)                                   | Per TTL in event payload | mem0 / Supabase `memory_entries`      |
| Agent tool events (AgentToolCalled)                             | 90 days                  | Supabase `agent_events`               |
| Rate quote events                                               | 1 year                   | Supabase `rate_events`                |
| Quote package events (QuoteGenerated, QuoteApproved, QuoteSent) | Permanent                | Supabase `audit_events`               |

STOP and DNC events are never purged regardless of any retention class override.
Permanent audit events are append-only — no update or delete operations are permitted
on the `audit_events` table by any service or migration.
