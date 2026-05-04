# Campaign runner implementation prompt

Task: Implement campaign execution using n8n + Activepieces.

Inputs:
- YAML campaign definitions in `assets/campaigns/*.yaml`
- TwentyCRM is system of record (lead + consent flags + timeline)

Requirements:
1) Create an n8n workflow:
   - Webhook enroll endpoint
   - Loads campaign YAML
   - Expands placeholders with lead data
   - Schedules messages (Wait)
   - Calls Activepieces workflow per message
2) Create Activepieces workflows:
   - send_sms
   - send_email
   - drop_voicemail
   Each requires: consent check + opt-out injection + audit log emit.
3) Writeback:
   - Create an activity entry in Twenty for every message attempt (success/fail).
4) Observability:
   - send Prometheus metrics for sends, failures, opt-outs, escalations.

Deliver artifacts:
- n8n JSON export file in `infra/n8n/workflows/`
- Activepieces export files in `infra/activepieces/workflows/`
- docs explaining how to import them.
