# 09 Prompt Dispatch Order

## Recommended sequential order

1. **PROMPT 01 — Foundation, Repo, Environment, and Architecture**
   - Send to: Codex CLI / Claude Code DevOps agent.
   - Why first: everything needs stable paths, hostnames, health checks, and deployment layout.

2. **PROMPT 02 — AI Agent Stack, Model Routing, MCP, and Memory Systems**
   - Send to: systems/AI infrastructure agent.
   - Depends on: initial infrastructure assumptions.

3. **PROMPT 03 — CRM, TwentyCRM, Lead Ingestion, and Contact Data Model**
   - Send to: backend/CRM agent.
   - Depends on: system-of-record placement decision.

4. **PROMPT 04 — Mortgage Quote Engine, Quote API, and Excel Parity**
   - Send to: backend/API agent.
   - Can run partly parallel with Prompt 03.

5. **PROMPT 05 — Twilio, SendGrid, Drip Campaigns, and Auto-Stop-on-Reply Logic**
   - Send to: automation/backend agent.
   - Depends on: CRM contracts; quote engine if quote text is included.

6. **PROMPT 06 — n8n, Activepieces, Composio, and Workflow Automation**
   - Send to: workflow automation agent.
   - Depends on: campaign contracts and infrastructure placement.

7. **PROMPT 07 — Backend APIs, Webhooks, Service Contracts, and Data Flows**
   - Send to: backend architect.
   - Can run parallel after CRM/quote initial outputs.

8. **PROMPT 08 — Auth, Secrets, Security, Compliance, and Audit Logging**
   - Send to: security/platform agent.
   - Should run early before exposing anything.

9. **PROMPT 09 — Admin Portal and Webapp Behavior — Non-Visual Only**
   - Send to: full-stack behavior agent.
   - Depends on: API contracts; does not depend on final UI design.

10. **PROMPT 10 — Gitea, WaveTerm, Zellij, Paperclip, and Operator Tooling**
    - Send to: DevEx/platform agent.
    - Can run in parallel once foundation is known.

11. **PROMPT 11 — Testing, Observability, Deployment, and Hardening**
    - Send to: QA/platform agent.
    - Run after core categories produce contracts.

12. **PROMPT 12 — Final Integration and System Synthesis**
    - Send to: integrator agent.
    - Must run after category outputs are complete.

## Parallel-safe prompts

- Prompt 03 and Prompt 04 can run in parallel after Prompt 01.
- Prompt 08 can run early in parallel with Prompt 02.
- Prompt 10 can run parallel as DevEx/operator tooling.
- UI quarantine prompt can run in Claude Desktop while nonvisual backend work proceeds.

## Sequential prompts

- Prompt 05 should wait for CRM contract from Prompt 03.
- Prompt 06 should use outputs from Prompts 03 and 05.
- Prompt 09 should use API contracts from Prompt 07.
- Prompt 12 should wait for all category outputs.

## Blocked by UI/design quarantine

- Final visual implementation of landing page.
- Final visual implementation of internal webapp dashboard.
- shadcn/TweakCN/Magic UI component decisions.
- R3F/3D/animation choices.
- Final command deck aesthetic.

Nonvisual route behavior, API contracts, auth, service integration, and data flow can proceed now.
