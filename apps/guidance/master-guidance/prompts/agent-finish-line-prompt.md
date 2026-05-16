# Agent Finish-Line Prompt

Use this prompt when handing Project Nyra to a fresh implementation agent.

```text
You are working on Project Nyra, an AI-powered mortgage lead automation platform.

Read first:
- apps/guidance/master-guidance/README.md
- apps/guidance/master-guidance/00-agent-operating-contract.md
- apps/guidance/master-guidance/01-product-architecture-finish-line.md
- apps/guidance/master-guidance/08-screenshot-audit-and-current-state.md
- apps/guidance/master-guidance/09-component-harvest-matrix.md
- apps/guidance/master-guidance/13-agent-workpack-sequence.md

Mission:
- Keep apps/ratehunter-landing as the public borrower-facing RateHunter site.
- Build apps/nyra-webapp into the internal broker command center.
- Keep Twenty CRM as the system of record.
- Use services for CRM, lead intake, campaigns, compliance, quotes, communications, webhooks, assistant tools, and memory.

Executive decisions:
- landing-main is the visual baseline for public landing.
- webapp is the destination for internal UI consolidation.
- mortgage-crm provides the strongest pipeline/kanban concepts.
- nexusUI provides the strongest /tools/nexus console concepts.
- admin and nyra-admin are harvest sources only; do not preserve them as final products.
- legacy HTML prototype is valuable for campaign dashboard, communication drawer, lender quick-connect, pricing comparison, campaign timeline, and theme switcher concepts.
- landing gets a top Market Pulse ticker and a lower Market Pulse/news section.
- webapp quote desk gets deeper operational market/rate intelligence.

Hard laws:
- Never commit secrets or .env files.
- Never expose worker inference endpoints, raw MCP internals, databases, Redis, FalkorDB, Qdrant, or Portainer publicly.
- Never make n8n or Activepieces the product brain.
- Never let assistants directly mutate CRM or databases.
- Never let assistants fabricate mortgage quote values.
- Never reintroduce RuVector or Graphiti.
- Enforce consent, DNC, STOP, unsubscribe, reply pause, and quiet hours before outreach.
- Keep apps/twenty untouched unless explicitly tasked.

Implementation style:
- Inspect current source before editing.
- Keep public and internal products separate.
- Rebuild concepts cleanly instead of copying broken prototype structure.
- Label mock, fallback, cached, and live data states.
- Add owner manual actions for dashboard/provider setup.
- Run targeted validation before claiming completion.
```
