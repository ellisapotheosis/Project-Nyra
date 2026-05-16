# Feature + Capability Matrix

Priority scale:

- Critical: required for sellable workflow and safety.
- High: required for strong operator value.
- Medium: important but can follow core launch.
- Low: useful later or internal-only.

| Capability | Status | Audience | Home | Priority | Dependency chain | Complexity / risk |
| --- | --- | --- | --- | --- | --- | --- |
| Public marketing site | Existing/partial | Public visitor, borrower | Separate public app | Critical | Landing app, brand assets, lead capture | Must stay isolated from internal routes and secrets |
| Borrower lead capture | Existing/partial | Borrower | Landing + lead ingestion service | Critical | `apps/landing`, `services/lead-ingestion`, CRM API, compliance | Consent capture and dedupe must be reliable |
| Borrower chat widget | Partial | Borrower | Landing module + assistant service | High | OpenClaw/Nexus, safe borrower tools, scheduling | Must restrict tools and PII exposure |
| Authenticated borrower portal | Planned/implied | Borrower | Main app role workspace | High | Auth, CRM API, docs, quote API | Needs role separation and secure record access |
| Broker cockpit dashboard | Partial | Broker | Main app | Critical | CRM API, campaign engine, quote API, communication events | Current dashboard is partly static |
| Lead list | Partial | Broker, admin | Main app | Critical | CRM API, lead ingestion, domain models | Needs filters, status, ownership, source, score |
| Lead detail workspace | Partial | Broker, admin, agent-only | Main app | Critical | CRM API, timeline events, compliance, communication service | Highest leverage page; needs strict action gates |
| Unified timeline | Partial | Broker, admin, borrower subset | Main app + communication service | Critical | CRM activity log, provider callbacks, campaign events | Needs normalized event schema and idempotency |
| Campaign template library | Partial | Broker, admin | Main app + campaign service | Critical | Campaign engine, compliance, templates, CRM enrollment | Needs versioning and testing |
| Campaign builder | Partial | Broker, admin | Main app | Critical | Campaign service, compliance simulation, channel previews | Current builder is useful but not production-bound |
| Campaign enrollment controls | Partial | Broker, admin, assistant | Main app via services | Critical | CRM API, campaign engine, compliance | STOP/reply-pause must override everything |
| Campaign analytics | Partial/static | Broker, admin | Main app | High | Campaign engine, communication logs, CRM outcomes | Need real metrics and attribution |
| Compliance checks | Partial package/tests | Broker, admin, agent-only | Backend service + visible panels | Critical | Domain contracts, communication service, campaign engine | Must be explicit, audited, and tested |
| STOP/unsubscribe processing | Planned/partial | Borrower, broker, admin | Communication/compliance service | Critical | Twilio/SendGrid webhooks, CRM, campaign engine | Must be immediate and terminal |
| Reply-based pause | Planned/partial | Borrower, broker | Communication/compliance service | Critical | Inbound events, campaign engine, notifications | High business risk if missed |
| Quiet hours | Partial UI concept | Borrower, broker | Compliance service + UI badges | Critical | Contact timezone, policy config, communication service | Must gate all sends |
| Quote request form | Partial | Broker, borrower | Main app | Critical | Quote API, CRM lead data | Must collect full deterministic input set |
| 3-option quote generation | Partial service | Broker, borrower | Quote API | Critical | Spreadsheet migration, rate sheets, tests | Must be deterministic and explainable |
| Quote comparison grid | Partial | Broker, borrower | Main app | High | Quote API, CRM quote records | UI must not calculate official terms |
| Quote approval/send | Partial | Broker, admin | Main app via CRM/communication service | Critical | Quote API, compliance, communication service | Requires audit and human approval |
| Documents | Implied/partial service | Borrower, broker | Main app + doc service | High | Storage, CRM, auth, audit | Needs secure upload and status model |
| Application tracking | Partial | Borrower, broker | Main app | High | CRM API, Twenty custom objects | Currently basic visibility |
| Pipeline board | Partial/static | Broker, admin | Main app | High | CRM API, stages, drag/drop, audit | Needs optimistic updates and permissions |
| Task management | Implied | Broker, admin, agent-only | Main app + CRM/service | High | CRM activities, assistant actions | Needed for real daily workflow |
| Communications inbox | Missing/partial timeline | Broker, admin | Main app + communication service | High | Twilio, SendGrid, callbacks, CRM logs | Important for speed and SLA |
| SMS controls | Implied/partial | Broker | Main app via communication service | Critical | Compliance, Twilio, audit | Must never bypass compliance |
| Email controls | Implied/partial | Broker | Main app via communication service | Critical | Compliance, SendGrid, audit | Unsubscribe enforcement required |
| Voice call controls | Implied/partial | Broker, admin | Main app polished controls + voice service | Medium/high | Twilio voice, PocketTTS/Kyutai, timeline | Keep raw tooling separate until stable |
| Voicemail drops | Planned/implied | Broker | Main app via communication service | Medium | Twilio voice, consent, campaign engine | Sensitive compliance/risk area |
| Live voice assistant | Implied infra | Broker, internal ops | Main app control + internal lab | Medium | Kyutai/PocketTTS, audio routing, Nexus | Productize only stable flows |
| AI assistant chat | Partial | Broker, admin | Main app | Critical | OpenClaw proxy, Nexus, assistant service | Needs action approval and lead context |
| Borrower assistant | Partial/implied | Borrower | Landing widget + borrower portal | High | Restricted tool set, CRM reads, scheduling | Smaller tool scope than broker assistant |
| Proposed agent actions | Partial component | Broker, agent-only | Main app | Critical | Assistant service, risk policy, audit | Must support approval/reject/execute |
| Agent run history | Missing/implied | Admin, agent-only | Main app control room | Medium | Assistant service, Nexus, traces | Useful for trust/debugging |
| Memory object visibility | Missing/implied | Admin, agent-only | Main app control room | Medium | Mem0/OpenMemory/Letta via Nexus | Read-first; mutation needs strict controls |
| Tool registry/health | Partial `/tools/openclaw` | Internal ops, agent-only | Main app tools | Medium | Nexus, OpenClaw, worker health | Keep under `/tools`, not broker primary nav |
| Model/provider routing visibility | Implied infra | Internal ops | Main app tools + infra dashboards | Low/medium | Nexus, LiteLLM, workers | Operational, not core borrower product |
| Settings/integrations | Partial | Admin/internal ops | Main app | High | Auth, env contracts, provider adapters | Needs real save/test flows |
| User/team/role management | Planned | Admin | Main app + auth service | Critical | Supabase/auth, RBAC, audit | Required before multi-user SaaS |
| Audit log | Planned/partial domain | Admin, compliance | Main app + services | Critical | All mutation services | Non-negotiable for compliance |
| Observability dashboards | Existing infra docs | Internal ops | External Grafana + app summaries | Medium | Prometheus/Loki/Grafana | Do not rebuild full Grafana in app |
| Workflow engine control | Existing n8n/AP docs | Internal ops | External dependency + app summaries | Medium | n8n/Activepieces, campaign service | App should show business state, not raw workflow spaghetti |
| CRM administration | Existing Twenty | Admin/internal ops | External Twenty + app CRM mirror | High | Twenty, CRM API | Do not clone all CRM admin features |
| Brand/design system | Partial | All | Packages + apps | Critical | TweakCN, shadCN, Magic UI, assets | Must eliminate visual fragmentation |
| SaaS packaging | Implied | Business/admin | Architecture concern | Medium | Auth, tenant model, data isolation | Design contracts now; implement after single-tenant works |

## Priority Launch Spine

The first sellable slice should be:

1. Public lead capture.
2. CRM write/read through `services/crm-api`.
3. Broker cockpit.
4. Lead workspace with timeline and compliance panel.
5. Campaign enrollment pause/resume/stop.
6. Quote request and deterministic quote display.
7. Assistant chat with read-only context and proposed actions.
8. Communication logging across SMS/email/voice.

Everything else should support that spine or wait.
