# Campaign Engine Contract

`services/campaign-engine` owns campaign templates, scheduling, enrollment state, and automation lifecycle.

## Responsibilities

- Store versioned `Campaign` and `CampaignStep` definitions.
- Validate campaign steps before publish.
- Enroll leads into campaigns through `CampaignEnrollment`.
- Own pause, resume, reply-pause, STOP cancellation, completion, and failure transitions.
- Call compliance preflight before every outbound step.
- Call communication service for provider dispatch.
- Mirror business state to CRM through `services/crm-api`.

## Forbidden

- n8n and Activepieces may execute steps but cannot own canonical campaign state.
- The webapp cannot directly mark outbound steps as sent.
- Assistant actions cannot execute campaign mutations without proposed-action approval when risk requires it.

## Frontend Calls

- `GET /api/campaigns`
- `POST /api/campaigns`
- `PATCH /api/campaigns/:id`
- `POST /api/campaigns/:id/publish`
- `POST /api/campaigns/:id/simulate-compliance`
- `POST /api/enrollments`
- `PATCH /api/enrollments/:id/pause`
- `PATCH /api/enrollments/:id/resume`
- `PATCH /api/enrollments/:id/stop`

## State Invariants

- `STOPPED` is terminal.
- `COMPLETED` is terminal.
- STOP/unsubscribe forces `STOPPED` immediately.
- Inbound borrower reply moves active automation to `REPLIED` or `PAUSED` according to policy.
- Quiet-hours failure blocks the send and keeps the step pending unless policy explicitly allows transactional sends.

## Domain Schemas

- `CampaignSchema`
- `CampaignStepSchema`
- `CampaignEnrollmentSchema`
- `ComplianceDecisionSchema`
- `CommunicationEventSchema`
