# n8n Workflows

Import the starter workflow:
- `data/n8n/nyra_dispatch_workflow.json`

In n8n:
1. Settings → Credentials: add Twilio + SMTP.
2. Import workflow JSON.
3. Activate workflow.
4. Set `N8N_WEBHOOK_URL` in Nyra Orchestrator to:
   - `http://n8n:5678/webhook/nyra/dispatch` (inside docker network)
   - or `https://<public-n8n>/webhook/nyra/dispatch` if external.

This gives you deterministic delivery + retries + easy approvals, while Orchestrator remains the policy gate.
