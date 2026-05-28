# Prompt 02 — Integrations, Automation, Mortgage Services

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Build non-UI integration contracts, adapters, mocks, and safety gates. Do not touch UI/theme/components.

STACK TO INTEGRATE:
- TwentyCRM as system-of-record.
- Supabase local backend/auth for Project Nyra webapp.
- Activepieces as primary embedded workflow/campaign builder.
- n8n as optional constrained fallback for mortgage lead drip campaigns only.
- Twilio, SendGrid, Calendly, Rebump, Google Workspace/Gmail.
- CRM API, Quote Engine, Rate Quoting API, Campaign Engine.
- Nexus Router/Grafbase/Hive as MCP/proxy aggregator.
- LiteLLM/OpenRouter/local workers.
- OpenClaw, NerveUI, Letta, Gastown, Clawteam, Composio.
- Memory stack: memorytensor/memOS, mem0+Qdrant, Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP, extra memory MCP TBD.
- Docker MCP Toolkit.

REQUIRED INTERFACES:
Create or update interface contracts + mock adapters + health checks + audit hooks for:
- SupabaseAuthClient
- SupabaseDataClient
- TwentyClient
- ActivepiecesClient
- N8nConstrainedCampaignClient
- TwilioClient
- SendGridClient
- CalendlyClient
- RebumpClient
- GoogleWorkspaceClient
- CrmApiClient
- QuoteEngineClient
- RateQuotingClient
- CampaignEngineClient
- NexusRouterClient
- HiveRouterClient
- LiteLlmClient
- OpenClawClient
- NerveClient
- LettaClient
- LettaMcpClient
- MemoryClient
- Mem0Client
- QdrantClient
- MempalaceClient
- ClaudeMemClient
- OpenMemoryMcpClient
- ComposioClient
- GastownClient
- ClawteamClient
- DockerMcpToolkitClient

MORTGAGE AUTOMATION CONTRACTS:
1. Lead ingestion: normalize, dedupe, validate, infer source/intent, write to Twenty, write to Supabase if required, create audit.
2. Consent gate: block outbound if consent missing/unknown unless internal-only.
3. Reply classifier: STOP/DNC/unsubscribe/remove me, wrong number, positive intent, quote request, docs request, angry/escalation, appointment intent.
4. STOP/DNC flow: stop campaign, update Twenty, update Supabase state, create audit, write memory, block all outbound.
5. Activepieces templates: New Internet Lead, Purchase Pre-Approval, Refinance Inquiry, Realtor Partner Lead, Credit Repair Follow-Up, Rate Watch, Dormant Lead Reactivation, Post-Close Referral, Missed Call Ping.
6. n8n fallback templates: same mortgage-only actions, no raw n8n option explosion.
7. Quote flow: rate quoting service -> quote engine -> three canonical options -> broker approval -> PDF/export/event/audit.
8. Voice flow: Kyutai Unmute local/mesh -> OpenClaw/Nerve session -> transcript -> action proposal -> human approval if borrower-facing.
9. Memory flow: communication/quote/campaign/agent events write memory with source_event_id, confidence, TTL/retention if supported.

TESTS:
- STOP blocks Twilio/SendGrid/Rebump/voice outbound.
- Missing consent blocks automated outbound.
- Activepieces enrollment creates audit.
- n8n fallback is unavailable to generic users and constrained to mortgage templates.
- Quote generation creates quote audit event and never claims real pricing accuracy from mocks.
- RateQuoting missing API returns degraded health.
- Memory writes include source event and confidence.
- Letta orchestration records OpenClaw agent session and tool call.

FINAL RESPONSE:
Files changed, tests run, mocks vs real integrations, missing secrets, next steps.
```
