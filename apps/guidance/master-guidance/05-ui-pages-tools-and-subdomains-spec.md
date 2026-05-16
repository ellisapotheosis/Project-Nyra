# UI Pages, Tools, And Subdomains Spec

## Intent

The webapp should become the broker-safe command layer for many tools without pretending every tool should be rebuilt inside React. The default rule is:

- Broker workflow: build native webapp pages.
- Operator/dev tool: link/access-gate and show health/status.
- Risky mutation tool: wrap with read-only status first, then add explicit approval flows.

## Subdomain Policy

Public:

- `ratehunter.net`: public landing and lead capture.
- `api.projectnyra.com`: public API facade where configured.
- `hooks.projectnyra.com`: webhook ingress for providers and partners.

Internal/access-gated:

- `app.projectnyra.com`: internal webapp.
- `twenty.projectnyra.com`: Twenty CRM.
- `n8n.projectnyra.com`: workflow editor.
- `activepieces.projectnyra.com`: connector/workflow editor.
- `openclaw.ratehunter.net`: assistant gateway/studio if deployed.
- `grafana.projectnyra.com`: observability.
- `gitea.projectnyra.com`: source control mirror if available.
- `portainer.ratehunter.net`: infrastructure admin, if exposed at all.

Private only:

- Worker vLLM/Ollama endpoints.
- Raw MCP internals.
- Redis/Postgres/FalkorDB/Qdrant.
- LiteLLM internals unless access-gated through intended control plane.

## Native Webapp Pages

Build these as real webapp pages:

- `/assistant`: broker assistant.
- `/campaigns` and `/campaigns/builder`: campaign workflows.
- `/leads` and `/leads/[leadId]`: lead operations.
- `/quotes` and `/quotes/[quoteId]`: quote operations.
- `/pipeline`: broker pipeline.
- `/applications`: application/document status.
- `/crm` and `/crm/settings`: CRM mirror and setup.
- `/admin/integrations`: integration hub.

## Tool Wrapper Pages

Build these as wrapper/status pages with deep links:

- `/tools/openclaw`
- `/tools/nexus`
- `/tools/n8n`
- `/tools/activepieces`
- `/tools/openmemory`
- `/tools/paperclip`
- `/tools/grafana`
- `/tools/gitea`
- `/tools/portainer`

Each wrapper page should show:

- Tool purpose.
- Access URL or “not configured.”
- Health state.
- Required secrets/config.
- Last successful check.
- Last failure.
- Safe actions.
- Owner manual actions.

## OpenClaw Page

Source:

- Current `/tools/openclaw`.
- `services/openclaw/SPEC.md`.

Keep:

- Thin proxy test panel.
- Chat request/response view.

Add:

- Gateway health.
- Studio link.
- Allowed tool list.
- Current model route.
- CRM-safe action policy.
- Recent upstream errors.

Do not add:

- Direct assistant database writes.
- Public unauthenticated access.

## Nexus Page

Source:

- `apps/nexusUI` and screenshot `nexus-ui/index.png`.

Build:

- `/tools/nexus` using the neon console visual language.
- Cards: groups active, tools available, LLM providers, environment state.
- Sections: Groups, Tools, Routing, LiteLLM, Environment, Config.
- Toggles: fuzzy tool find, smart routing, privacy mode, apply adapter.
- Buttons: Refresh, Save, Open Webapp.

Backing endpoints:

- Use `apps/nexusUI/app/api/status/route.ts` and `api/settings/route.ts` as reference.
- Do not expose raw internals if backend is not access-gated.

## n8n Page

Build:

- Workflow health cards for lead ingest, campaign execute, response handler, STOP handler, quote/doc reminders.
- Recent failed runs.
- Retry queue.
- Open n8n deep link.
- Owner action checklist for credentials/webhooks.

Do not:

- Make n8n the source of truth.
- Let users edit business state only in n8n.

## Activepieces Page

Build:

- Connector catalog status.
- Approval queue.
- Failed pieces.
- Open Activepieces deep link.
- Common connectors: Gmail, Outlook, Twilio, SendGrid, Twenty, webhooks, Cloudflare, Google Drive.

Use:

- Activepieces for connector-heavy automations and approval glue.
- Services for business decisions.

## OpenMemory Page

Build:

- Link/status page.
- Memory provider health.
- Nexus route to memory tools.
- Recent memory errors if available.

Do not:

- Build memory editing as a broker workflow unless explicitly scoped.

## Paperclip/Documents Page

Build if deployed:

- Document upload/extraction status.
- Link to source tool.
- Recent document queue.
- Security posture and storage destination.

## Provider Pages

Twilio:

- SMS/voice credential health.
- Sender numbers.
- Webhook status.
- Opt-out/STOP handler status.
- Delivery failure summary.

SendGrid:

- Sender auth.
- Template status.
- Event webhook status.
- Unsubscribe handling.

Gmail/Outlook:

- OAuth status.
- Send/receive availability.
- Domain/identity constraints.

Cloudflare:

- Tunnel status.
- Route map.
- Access policy checklist.

## Integration Hub Contract

`/admin/integrations` should be the central place for:

- Tool cards.
- Service health.
- Required secrets.
- Owner manual actions.
- Deep links.
- Retry/failure queues.
- Environment mismatch warnings.

Each card should have states:

- Connected.
- Degraded.
- Missing config.
- Unauthorized.
- Offline.
- Link only.
- Not deployed.
