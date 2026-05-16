# Conductor Tasks

This backlog is the adjusted finish-line task list after comparing the master prompt with the active repo.

## Complete Locally

- Keep docs aligned with active source and host compose files.
- Keep `services/quote-api/SPEC.md` aligned with the Python/FastAPI implementation.
- Standardize webapp service calls through typed helpers and Next API routes.
- Keep mock fallbacks behind `NYRA_ENABLE_MOCKS=true`; production should fail closed when a required service URL is missing or unavailable.
- Preserve OpenClaw chat proxy token gating in production and pass selected lead context server-side.
- Expand `/admin/integrations` or equivalent ops route into a read-only service health dashboard.
- Keep `/admin/integrations` current as new service URLs are introduced.
- Replace remaining route/page display fixtures with service-backed data after the matching backend contracts are live.
- Add provider adapters to `services/quote-api` only after Rocket/Lender Price/LendingPad provide actual API contracts and credentials.
- Add tests when domain/service behavior changes.

## Blocked Until Live Credentials Or Owner Actions

- Verify live Twenty CRM writes and custom-object mappings.
- Verify live Twilio/SendGrid sends and callback signature handling.
- Verify Activepieces/n8n webhook execution against deployed instances.
- Verify OpenClaw/Nexus/worker model routing with real gateway tokens.
- Provision Rocket/Lender Price/LendingPad pricing access and API documentation.
- Configure Cloudflare Access, DNS, and provider dashboards.
- Validate DNC/provider compliance integrations beyond local deterministic rules.

## Do Not Do

- Do not expose worker vLLM/Ollama endpoints publicly.
- Do not let the webapp call Twenty directly for broker workflows.
- Do not move campaign business rules into n8n or Activepieces.
- Do not let assistants mutate CRM/database records directly.
- Do not reintroduce RuVector or Graphiti into active architecture.
