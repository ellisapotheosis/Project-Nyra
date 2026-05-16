# Campaign, Compliance, And Quote Spec

## Intent

Campaigns, compliance, and quotes are the highest-risk product areas. They must be powerful enough for brokers but constrained enough to prevent unlawful outreach, bad CRM data, or invented mortgage terms.

## Campaign Product Model

Campaigns are mortgage follow-up programs grouped by scenario:

- Purchase nurture.
- Refinance blitz.
- Cash-out refinance.
- HELOC/equity.
- Government loan education.
- Post-close/referral.
- Dormant lead reactivation.

Campaign states:

- `DRAFT`
- `ACTIVE`
- `PAUSED_BY_BROKER`
- `PAUSED_BY_REPLY`
- `OPTED_OUT_STOP`
- `COMPLETED`
- `FAILED_RETRYABLE`
- `FAILED_FINAL`

Enrollment states:

- Not enrolled.
- Pending eligibility.
- Enrolled.
- Waiting.
- Next touch scheduled.
- Paused.
- Blocked.
- Completed.

## Campaign Builder Step Types

Approved step types:

- `sms`
- `email`
- `voice_call`
- `voicemail_drop`
- `missed_call_ping`
- `broker_task`
- `broker_alert`
- `wait`
- `condition`
- `quote_reminder`
- `document_request`
- `ai_summary`
- `crm_update`
- `webhook`

Each step must define:

- Day/offset.
- Time window.
- Channel/provider.
- Template.
- Audience eligibility.
- Required consent channel.
- Quiet-hour policy.
- Retry policy.
- CRM log behavior.
- Compliance disclosure.

## Campaign Dashboard UX

Use the legacy HTML prototype as the conceptual source for:

- Campaign cards with status, lead count, completion, response rate.
- Recent leads needing assignment.
- Timeline of scheduled touches.
- Provider badges for Twilio, Gmail, Outlook, SendGrid.
- Pricing/rate comparison entry point.
- Campaign builder preview cards.

Enhance with:

- Compliance block queue.
- Reply pause queue.
- Failed send queue.
- Active enrollments.
- Broker task queue.

## Communication Drawer

The legacy HTML fixed communication panel is worth rebuilding as a broker-side concept:

- Open from lead cockpit and assistant page.
- Shows selected lead conversation.
- Offers draft SMS/email/voice notes.
- Requires consent/compliance status before send.
- Includes STOP instructions for SMS where required.
- Logs all sends and inbound replies to CRM.

Initial implementation can be a side panel with draft-only behavior until send services are ready.

## Compliance Gates

Before every outbound step:

- Confirm contact has consent for the channel.
- Check DNC and suppression lists.
- Check STOP/unsubscribe.
- Check reply-pause status.
- Check quiet hours by lead jurisdiction and configured policy.
- Confirm required template disclosure.
- Confirm provider credential and sender identity.
- Confirm idempotency key.
- Record allowed or blocked audit event.

Inbound events:

- STOP or unsubscribe immediately blocks future outreach.
- Human reply pauses campaign and creates broker task.
- Delivery failure records provider event and may retry according to policy.
- Spam/complaint events suppress channel and escalate.

## Quote Desk Product Model

Quote desk should combine:

- Current rate sheet.
- Recent quote packages.
- Lock expiration queue.
- Rate trend status.
- Pricing engine comparison.
- Quote generation entry point.
- Broker approval.
- CRM attachment status.

Source material:

- Admin quote desk.
- Current webapp quote route.
- Landing `market-data.ts`.
- Legacy HTML pricing engine comparison.
- Quote API/service specs.

## Quote Rules

Quote values must include:

- Borrower/lead/loan IDs.
- Loan purpose and product type.
- Assumptions.
- Rate source.
- APR/payment/cost breakdown.
- Points and fees where available.
- Expiration/TTL.
- Approval state.
- Artifact/PDF link if generated.
- CRM sync state.

Quote UI labels:

- “Market snapshot” for general rate cards.
- “Scenario” for pre-approval/non-binding quote previews.
- “Broker approved” only after explicit approval.
- “Locked” only if a lock exists in the authoritative system.

Forbidden labels without backend proof:

- Guaranteed.
- Approved.
- Locked.
- Lowest.
- Final.

## Pricing Engine Comparison

Legacy HTML references Rocket Mortgage, LenderPrice, and Advantage Credit. Preserve the concept as a configurable provider comparison:

- Provider card.
- Product/rate rows.
- Last updated.
- Source/auth state.
- Screenshot/export action.
- “Not connected” state for unavailable providers.

Default providers to document:

- Rocket Mortgage.
- LenderPrice.
- Advantage Credit.
- Internal/manual rate sheet.
- Future lender adapters.

## Landing Market Pulse Versus Webapp Quote Desk

Landing:

- Borrower-facing.
- Educational.
- Slim ticker plus market pulse section.
- No lead-specific quote.
- Strong disclaimer.

Webapp:

- Broker-facing.
- Operational.
- Shows provider/source state.
- Can connect to quotes and leads.
- Can trigger quote generation through quote services.

## Automation Runner Pattern

Services decide:

- Campaign engine decides next step.
- Compliance service decides whether outreach is allowed.
- Quote service decides quote values.
- CRM API decides normalized CRM writes.

Runners execute:

- n8n handles scheduled workflow execution, retries, provider glue.
- Activepieces handles connector-heavy flows and approval queues.
- Twilio/SendGrid handle provider sends/callbacks.

UI observes and controls:

- Webapp shows state.
- Broker approves/pauses/resumes.
- Operator reviews failures.

## Acceptance Criteria

- No send action exists without visible compliance state.
- No quote action presents values without source/assumption labels.
- Campaign builder validates missing templates and consent channels.
- Reply pause and STOP are first-class states.
- Quote desk distinguishes live, fallback, and stale rates.
- Pricing engine comparison can show “not connected” without breaking the page.
