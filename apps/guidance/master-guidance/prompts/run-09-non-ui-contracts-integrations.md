# Prompt Run 09: Non-UI Contracts, Safety Gates, And Integration Mocks

```text
You are Codex working in Project Nyra.

Run label: 09-non-ui-contracts-integrations
Timebox: 120-180 minutes
Context budget: backend/domain contracts only
Primary scope: packages, services, docs, tests; no UI

Read first:
- AGENTS.md
- apps/guidance/master-guidance/04-crm-twenty-integration-spec.md
- apps/guidance/master-guidance/06-service-integration-map.md
- apps/guidance/master-guidance/07-campaign-compliance-quote-spec.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Create or update non-UI domain contracts, integration interfaces, mocks, safety gates, tests, and docs.

Tasks:
- Define canonical entities and enums for leads, borrowers, opportunities, scenarios, quotes, campaigns, enrollments, communication events, consent/DNC, agent sessions/tool calls, memory, audit, integration health, workers, and model routes.
- Add validation schemas if Zod or an existing schema system is available.
- Add safety gates: STOP/DNC detection, consent gate, approval gate, CRM mutation audit, outbound audit, quote audit.
- Add interfaces and mock clients for Twenty, Activepieces, Twilio, SendGrid, Google Workspace, Nexus, OpenClaw, Nerve, Memory, QuoteEngine.
- Add deterministic mock quote engine with exactly three options.
- Add tests for STOP blocks outbound, missing consent blocks outbound, approved campaign can send via mock, CRM mutation creates audit, quote generation creates audit, memory write includes source/confidence, env-missing health degrades, mock lead ingestion normalizes record.
- Add integration docs under docs/integrations.

Do not:
- Touch UI, themes, pages, components, icons, animations, or styling.
- Add real secrets.
- Reintroduce deprecated stack.

Validation:
- package-specific typecheck/lint/test for changed packages/services
- pnpm test or targeted tests where configured
- git diff --check

Final response:
- Files changed.
- Tests added.
- Validation evidence.
- Remaining real-provider wiring.
```
