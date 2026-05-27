# Project Nyra Documentation

Project Nyra docs are organized by the thing you are trying to build or operate.
The root stays small; app, component, workflow, infrastructure, security, and
operations material lives in the folders below.

## Start here

| Need                                       | Go to                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| Target architecture and product invariants | [`MASTER_ARCHITECTURE.md`](MASTER_ARCHITECTURE.md)     |
| App/service build plan                     | [`EXECUTION_PLAN_APPS.md`](EXECUTION_PLAN_APPS.md)     |
| Infrastructure bring-up plan               | [`EXECUTION_PLAN_INFRA.md`](EXECUTION_PLAN_INFRA.md)   |
| Manual owner-only actions                  | [`OWNER_MANUAL_ACTIONS.md`](OWNER_MANUAL_ACTIONS.md)   |
| Local dev runbook                          | [`ops/LOCAL_DEV_RUNBOOK.md`](ops/LOCAL_DEV_RUNBOOK.md) |

## Canonical categories

| Folder                                                     | Purpose                                                                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`apps/projectnyra/`](apps/projectnyra/)                   | Broker/customer webapp, admin/operator pages, OpenClaw-facing assistant surface, Nexus UI/API notes, and quote UI docs. |
| [`apps/ratehunter/`](apps/ratehunter/)                     | Landing page, lead capture, RateHunter marketing surface, and Cloudflare Pages notes.                                   |
| [`components/twenty-crm/`](components/twenty-crm/)         | Twenty CRM model, customization, CRM API boundary, and CRM integration docs.                                            |
| [`components/automation/`](components/automation/)         | Campaign engine, n8n/Activepieces orchestration notes, compliance automation, and workflow specs.                       |
| [`components/communications/`](components/communications/) | SendGrid, Twilio, call/text/email/voicemail communication docs.                                                         |
| [`components/quote-service/`](components/quote-service/)   | Quote API and quote-service integration references.                                                                     |
| [`components/memory/`](components/memory/)                 | Approved memory-plane references.                                                                                       |
| [`workflows/n8n/`](workflows/n8n/)                         | The single docs location for n8n workflow JSON exports.                                                                 |
| [`workflows/activepieces/`](workflows/activepieces/)       | Activepieces workflow notes.                                                                                            |
| [`architecture/`](architecture/)                           | System architecture, ADRs, topology, diagrams, and consolidation decisions.                                             |
| [`infra/`](infra/) and [`ops/`](ops/)                      | Host topology, canonical ports/env, service exposure, worker routing, and runbooks.                                     |
| [`security/`](security/)                                   | Secret rotation, Infisical references, exposure reviews, and security checklists.                                       |
| [`deployment/`](deployment/)                               | Deployment and Cloudflare/Infisical setup guides.                                                                       |
| [`development/`](development/)                             | Repository development patterns, tooling, and Turborepo guidance.                                                       |
| [`archive/`](archive/)                                     | Historical docs that are not current source-of-truth. Retired stack archives have been removed.                         |

## Routing rules for new docs

- Webapp/admin/customer UI docs go in `docs/apps/projectnyra/`.
- Landing/lead-capture docs go in `docs/apps/ratehunter/`.
- Twenty CRM docs go in `docs/components/twenty-crm/`.
- n8n/Activepieces/campaign automation docs go in `docs/components/automation/`.
- n8n workflow JSON exports go only in `docs/workflows/n8n/`.
- SendGrid/Twilio/call/text/email/voicemail docs go in `docs/components/communications/`.
- Owner-login, MFA, OAuth, domain verification, provider-dashboard tasks go in `docs/OWNER_MANUAL_ACTIONS.md`.

## Deprecated stack policy

Do not add docs for retired orchestration, swarm, vector-memory, or experimental
agent database stacks. Current architecture uses Nexus Router, LiteLLM,
OpenClaw, Mem0, FalkorDB, Qdrant where configured, n8n, and Activepieces.
