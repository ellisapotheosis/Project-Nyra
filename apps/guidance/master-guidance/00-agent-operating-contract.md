# Agent Operating Contract

## Mission

Build Project Nyra into a mortgage lead automation platform with two polished surfaces:

- A public RateHunter borrower site that converts visitors into compliant lead records.
- An internal Nyra broker command center that consolidates leads, campaigns, quotes, CRM visibility, assistant workflows, and tool integrations.

Agents should treat this repo as a product consolidation project, not as a collection of unrelated prototypes.

## Hard Product Laws

- Twenty CRM is the system of record for contacts, leads, loans, campaign enrollments, communications, quotes, tasks, and compliance events.
- `apps/nyra-webapp` is the final internal app. It absorbs useful concepts from other internal prototypes.
- `apps/ratehunter-landing` is the final public site. It stays borrower-facing only.
- n8n and Activepieces are automation runners and connector glue. They do not own business state.
- OpenClaw, Nexus, OpenMemory, and LLM workers are assistant/tool infrastructure. They do not own business records.
- Quote terms come from quote services, calculators, or approved rate sheets. Assistant and UI copy may explain values but must not invent values.
- Outreach must be gated by consent, do-not-contact, STOP, unsubscribe, reply pause, and quiet hours.
- Public ingress must not expose worker inference, raw MCP internals, raw databases, Redis, FalkorDB, Qdrant, Portainer, or private GPU services.
- RuVector and Graphiti are deprecated. If old docs mention them, treat those references as stale.
- GitHub workflow automation uses `INFISICAL_GH_TOKEN` for GitHub API, package, PR, and release operations.

## App Consolidation Rules

- Harvest ideas, components, data shapes, and copy from old apps; do not preserve broken app boundaries.
- Use screenshots to classify each source as destination, harvest source, broken source, or link-only surface.
- When source app code is broken but concepts are useful, rebuild the concept in the destination app instead of importing fragile code.
- Prefer source-compatible shadcn/TweakCN components over raw copied HTML.
- Preserve provenance in docs or implementation notes when migrating a meaningful component.
- Keep public landing and internal broker flows separate even when they reuse branding or shared components.

## CRM Boundary Rules

- Frontend pages should call service/API boundaries, not Twenty GraphQL directly, unless the page is explicitly a CRM integration diagnostic page.
- Business services should write to Twenty through `services/crm-api` or a documented Twenty integration boundary.
- UI should show CRM sync health, last sync time, object IDs, write failures, and retry status where CRM state matters.
- CRM pages must distinguish canonical Twenty data from cached webapp state and mock/stub data.
- Manual field mapping and credential checks belong in `/crm/settings` or `/admin/integrations`.

## Assistant Boundary Rules

- The assistant can summarize, draft, explain, triage, search, and recommend.
- The assistant cannot directly write CRM records, send outreach, lock rates, fabricate quotes, or bypass approvals.
- Assistant actions that create side effects must become explicit service calls with approval state, audit log, and idempotency key.
- Borrower-facing assistant copy must include educational/disclaimer framing where rates, approval, docs, or closing timelines are discussed.
- Broker-facing assistant UI should display selected lead context, unified timeline, campaign state, and safe action buttons.

## Compliance Rules

- Every send-capable UI must show whether the lead is eligible for email, SMS, voice, and automation.
- STOP and unsubscribe states must disable future outreach immediately.
- Reply pause must pause campaign execution and notify the broker.
- Quiet hours must be enforced before scheduled sends.
- Compliance events must be attached to CRM timeline or compliance log.
- Landing consent capture must retain source, timestamp, channel consent, disclosure version, and originating flow.

## Visual And UX Rules

- Landing should retain the dark Carrd-like personal brand and borrower-first advisory tone from `landing-main`.
- Internal webapp should feel like an operations cockpit, not a marketing page.
- Nexus/tool pages may use the neon console language from `nexus-ui`.
- Pipeline and CRM pages may use the lighter, spacious mortgage-crm kanban language, adapted into the webapp theme.
- Admin/nyra-admin rough layouts should not be copied wholesale. Harvest their metric concepts only.
- Rate tickers must look valuable and current while clearly remaining educational and non-binding.

## Source Precedence For Agents

Use this order when sources disagree:

1. Current app/service source for exact implementation details.
2. Screenshots for current visual state and build breakage.
3. Master guidance for product decisions.
4. Existing `apps/guidance` docs for reference paths and old decisions.
5. Shared docs/assets for imported business source material.
6. External prompt packs and legacy docs for background only.

## Required Page Contract

Every new or expanded route spec must include:

- Purpose.
- Audience.
- Source material.
- UI blocks.
- Backing services or mock state.
- Side effects.
- Compliance constraints.
- Empty state.
- Error/degraded state.
- Out of scope.

## Required Integration Contract

Every tool or service integration must include:

- Owning service or external system.
- Auth/access requirement.
- Required secrets.
- Read operations.
- Write operations.
- Health endpoint or status source.
- CRM side effects.
- Retry/dead-letter behavior where applicable.
- User-facing failure message.

## Owner Manual Actions

If a task requires Cloudflare dashboard, provider dashboard, Twilio verification, SendGrid sender auth, Calendly setup, OAuth/MFA, Infisical project setup, DNS, tunnel setup, or payment-provider login, document it in `docs/OWNER_MANUAL_ACTIONS.md` and continue with everything that can be done locally.
