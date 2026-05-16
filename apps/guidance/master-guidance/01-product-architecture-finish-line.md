# Product Architecture Finish Line

## Product Definition

Project Nyra is a mortgage lead automation platform with one public acquisition surface and one internal command center.

The public surface helps borrowers understand options, start a quote/intake flow, chat with Nyra for educational guidance, schedule time, and contact Ellis.

The internal surface helps brokers operate the business: leads, campaigns, quotes, applications, pipeline, CRM sync, assistant workflows, and integrations.

## Final App Ownership

| Area | Final owner | Role | Source policy |
| --- | --- | --- | --- |
| Public RateHunter site | `apps/ratehunter-landing` | Borrower-facing conversion and education | Keep landing-main identity; harvest market data and source assets |
| Internal Nyra webapp | `apps/nyra-webapp` | Broker-facing command center | Absorb admin, mortgage-crm, nexusUI, and legacy HTML concepts |
| Twenty CRM | `apps/twenty` and deployed Twenty | System of record | Link/access-gate; do not visually merge |
| Twenty integration | `apps/twenty-crm` and services | Config, scripts, MCP, sync references | Use as backend/integration reference |
| Nexus console | `apps/nexusUI` into `/tools/nexus` | Tool-console reference | Harvest neon console UI and status/settings APIs |
| Admin prototypes | `apps/admin`, `screenshots/admin*`, `screenshots/nyra-admin` | Metrics, quote, alerts, quick actions | Harvest concepts; do not preserve as final app |
| Mortgage CRM prototype | `apps/mortgage-crm` | Pipeline, kanban, domain model, Twenty references | Harvest into webapp CRM/pipeline/leads/applications |
| Legacy HTML prototype | `apps/shared/assets/webapp-v1-source-material/index.html` | Campaign dashboard, timeline, communication drawer, lender links, pricing comparison | Rebuild concepts in webapp |

## Deployment And Domain Model

Public:

- `ratehunter.net`: landing, quote intake, borrower chat, service content, contact/social links.
- Cloudflare Pages is the intended public deployment target.
- Public site must not expose internal admin, CRM, tool, or worker endpoints.

Internal:

- `app.projectnyra.com`: broker command center.
- Hosted on the internal/orchestrator/VPS path selected by infra docs.
- Protected by authentication and preferably Cloudflare Access for admin/tool deep links.

APIs and callbacks:

- `api.projectnyra.com`: public API facade where configured.
- `hooks.projectnyra.com`: provider callbacks and webhook ingress.
- Tool subdomains such as `n8n.projectnyra.com`, `activepieces.projectnyra.com`, `twenty.projectnyra.com`, `grafana.projectnyra.com`, `gitea.projectnyra.com`, and `openclaw.ratehunter.net` must be access-gated.

## What Gets Embedded Versus Linked

Embed or rebuild inside `apps/nyra-webapp`:

- Lead queue, lead cockpit, lead scoring, lead timeline.
- Campaign management and campaign builder.
- Quote desk, rate watch, quote history, lock expiration view.
- Pipeline kanban and application snapshots.
- CRM sync overview and CRM settings.
- Integration status cards and broker-safe setup wizards.
- Assistant panel tied to selected lead context.

Link/access-gate instead of rebuilding:

- Twenty CRM full UI.
- n8n editor.
- Activepieces editor.
- OpenMemory UI.
- Grafana/Loki/Prometheus.
- Gitea.
- Portainer.
- OpenClaw Studio if it is an operator surface rather than broker workflow.

Wrap with a broker-safe UI:

- Nexus status and tool visibility.
- Twilio/SendGrid status and setup.
- Cloudflared tunnel status.
- Workflow failure/retry queues.
- Provider credential health checks.

## Final Internal Route Ownership

| Route | Purpose | Primary source |
| --- | --- | --- |
| `/` | Broker command center dashboard | current webapp shell plus legacy HTML dashboard and admin metrics |
| `/assistant` | lead-aware Nyra assistant | current webapp assistant plus OpenClaw/Nexus boundaries |
| `/campaigns` | campaign dashboard and enrollments | legacy HTML campaign dashboard plus current webapp campaigns |
| `/campaigns/builder` | sequence builder | current builder route plus legacy HTML campaign builder |
| `/leads` | lead management list | current webapp leads plus admin scoring and mortgage-crm cards |
| `/leads/[leadId]` | lead cockpit | mortgage-crm lead detail, assistant timeline, CRM sync |
| `/quotes` | quote desk and rate intelligence | admin quote desk plus current webapp quote route |
| `/quotes/[quoteId]` | quote detail | quote-service contract, recent quotes, PDF/export |
| `/pipeline` | pipeline/kanban | mortgage-crm pipeline visual language |
| `/applications` | application/document status | mortgage-crm domain and current webapp route |
| `/crm` | CRM mirror and sync health | current webapp CRM plus twenty-crm references |
| `/crm/settings` | mappings, credentials, webhooks | twenty-crm config references |
| `/admin` | operator dashboard | admin metrics and alerts, not a separate product |
| `/admin/integrations` | integration hub | tool/service map |
| `/tools/openclaw` | OpenClaw chat/proxy status | current route plus OpenClaw docs |
| `/tools/nexus` | Nexus console | `apps/nexusUI` |
| `/tools/n8n` | workflow health and deep link | n8n shared docs |
| `/tools/activepieces` | connector status and deep link | Activepieces/Nexus docs |
| `/tools/openmemory` | memory UI link/status | OpenMemory docs |
| `/tools/paperclip` | document/tool link if deployed | docs/assets as available |

## Final Public Landing Sections

1. Top navigation with RateHunter logo, CTA, services, contact, phone.
2. Hero split: Ellis profile card and quote-intake wizard.
3. Slim Market Pulse ticker near top of page.
4. Trust cards and service cards.
5. Advisory approach section.
6. Borrower-first guidance section.
7. Action stack: schedule, quote/application portal, HELOC quote, encrypted uploads, company profile, save contact.
8. Lower Market Pulse section with rate cards and news.
9. Contact/social section.
10. Compliance and licensing footer.
11. Borrower chat widget.

## Infrastructure Boundaries

- Cloudflared is the public ingress path.
- Tailscale/MagicDNS should remain the private addressing layer for internal nodes and workers.
- Nexus is the preferred front door for LLM/MCP access.
- LiteLLM/model workers should not be directly called from browser UIs.
- Service health should be visible in internal webapp pages, especially for CRM, Nexus, OpenClaw, n8n, Activepieces, Twilio, SendGrid, Cloudflared, and quote services.

## Finish-Line Acceptance

The UI/app consolidation is complete when:

- Landing builds and presents a coherent public borrower experience.
- Landing contains ticker/market pulse sections with educational disclaimers.
- Webapp contains real route depth for all declared internal workflows.
- Source apps are no longer required as independent broker products.
- Twenty remains the system of record and is linked/access-gated.
- Tool pages show health, deep links, and safe degraded states.
- Docs identify which routes are real, mocked, stubbed, and blocked by owner manual actions.
