# Project Nyra Canonical Architecture, Governance, and Roadmap

## 1. Architectural stance

Project Nyra uses a control-plane, durable-state-plane, and compute-plane model, with separate public product surfaces and strict service boundaries around mortgage mutations.

```text
Borrowers / brokers / operators
        │
        ├─ ratehunter.net
        ├─ projectnyra.com
        └─ app.projectnyra.com
        │
        ▼
Cloudflare Pages / controlled ingress
        │
        ├─ api.projectnyra.com
        └─ hooks.projectnyra.com
        │
        ▼
Nyra product services
├─ lead-ingestion
├─ crm-api
├─ compliance-service
├─ campaign-service
├─ communication-service
├─ quote-service
├─ assistant-service
└─ webhook-service
        │
        ├─► Twenty CRM
        ├─► Supabase/Auth
        ├─► governed Postgres/Redis
        └─► event and audit ledger
```

```text
Humans and governed agents
        │
        ▼
Grafbase Nexus
├─ scoped MCP
├─ LLM protocol ingress
├─ tool registry and namespaces
├─ auth/rate limits
└─ OpenTelemetry
        │
        ├─► LiteLLM
        │    ├─ RTX 5090
        │    ├─ RTX 3090 Ti
        │    ├─ RTX 3060
        │    ├─ free routes
        │    └─ owner-enabled paid routes
        │
        ├─► narrow Letta bridge
        ├─► read tools
        ├─► staged business tools
        └─► privileged admin tools isolated by scope
```

## 2. Responsibility matrix

| Component | Canonical role | Must not become |
|---|---|---|
| Twenty CRM | Mortgage CRM system of record | Agent scratchpad |
| Supabase Auth | Web identity/session boundary | CRM/compliance bypass |
| Nyra services | Domain logic and authorized mutations | Unaudited pass-throughs |
| n8n/Activepieces | Replaceable execution adapters | Campaign truth/business brain |
| Nexus | Governed tool/LLM ingress | Unauthenticated public proxy |
| LiteLLM | Model routing and spend policy | Silent paid-spend escalator |
| Letta | Stateful agent orchestration | Recursive universal authority |
| Mem0/OpenMemory | Semantic/runtime memory | Transactional truth |
| FalkorDB | Graph relationships | CRM authority |
| Qdrant | Vector retrieval | Durable business record |
| OTel/OpenLIT | Observability | PII warehouse |
| GPU workers | Replaceable compute | Sole durable storage |

## 3. Host topology

### Orchestrator

Intended responsibilities:

- Nexus;
- LiteLLM;
- central or tiered OTel collector;
- Grafana, Prometheus, Loki, Tempo as deployed;
- OpenLIT;
- Portainer server;
- operator cockpit integrations;
- private routing;
- selected public tunnel only after final ingress ADR.

### Oracle VPS

Intended responsibilities:

- canonical production Letta;
- Twenty CRM;
- Supabase/Auth and durable Postgres;
- Redis;
- Nyra business services;
- n8n/Activepieces;
- Qdrant/FalkorDB;
- audit/event persistence;
- selected public tunnel only after final ingress ADR.

### Worker RTX 5090

- primary local reasoning and coding model;
- repo-aware code tools where physically present;
- private vLLM;
- narrow Docker Desktop MCP gateway only where required.

### Worker RTX 3090 Ti

- secondary heavy reasoning and coding model;
- overflow capacity;
- private vLLM;
- narrow Docker Desktop MCP gateway.

### Worker RTX 3060

- embeddings;
- extraction;
- summarization;
- utilityLLM;
- narrow Docker Desktop MCP gateway.

### Worker RTX 3060

- embeddings;
- extraction;
- summarization;
- utility inference;
- memory compute and indexing;
- never the sole durable storage location without explicit backup and uptime guarantees.

## 4. Network zones

### Public

Only purpose-built browser and webhook endpoints:

- `ratehunter.net`
- `www.ratehunter.net`
- `projectnyra.com`
- `www.projectnyra.com`
- `app.projectnyra.com`
- `api.projectnyra.com`
- `hooks.projectnyra.com`
- optional browser-facing auth/API endpoint

### Cloudflare Access or Tailscale only

- Grafana;
- OpenLIT;
- Portainer;
- Twenty;
- n8n;
- Activepieces;
- Letta admin;
- Nexus diagnostics/admin;
- LiteLLM admin;
- Supabase Studio;
- Open WebUI.

### Private Split DNS / MagicDNS

- worker model endpoints;
- raw MCP servers;
- databases and caches;
- OTel collector;
- Prometheus/Loki/Tempo internals;
- Docker gateways;
- node exporters;
- cAdvisor and GPU exporters.

## 5. Product-service interaction rules

1. Browsers call same-origin routes or approved API boundaries.
2. Frontends never embed privileged provider credentials.
3. Assistants call `assistant-service` or Nexus tools.
4. Nexus tools call Nyra services rather than raw databases.
5. Nyra services validate, authorize, audit, and apply idempotency.
6. Provider callbacks enter through signature-validating webhook handlers.
7. Workflow engines receive a task and return an outcome.
8. Campaign service calculates the authoritative next state.
9. Material events synchronize to the CRM timeline.
10. Observability receives redacted signals.

## 6. Canonical domain services

### Lead ingestion

Responsibilities:

- source adapters;
- schema validation;
- normalization;
- deterministic dedupe;
- source attribution;
- consent evidence references;
- CRM upsert request;
- campaign eligibility request;
- audit events.

### CRM API

Responsibilities:

- typed Twenty boundaries;
- idempotent create and update;
- object mapping;
- timeline and task writes;
- sync errors;
- retry and dead letter;
- actor attribution.

### Compliance service

Responsibilities:

- consent;
- DNC;
- STOP/HELP;
- unsubscribe;
- reply pause;
- quiet hours;
- sender identity;
- frequency caps;
- disclosure policy;
- immutable decision evidence.

### Campaign service

Responsibilities:

- versioned campaign definitions;
- enrollment;
- state machine;
- scheduling;
- pause/resume/stop/suppress/complete;
- branch conditions;
- reply handling;
- step idempotency;
- provider reconciliation.

### Communication service

Responsibilities:

- provider-neutral requests;
- Twilio Voice and Messaging;
- SendGrid or equivalent email;
- callback signature validation;
- inbound reply normalization;
- timeline events;
- suppression synchronization;
- provider health and retry classification.

### Quote service

Responsibilities:

- deterministic calculations;
- approved provider data;
- assumptions ledger;
- scenario versioning;
- broker review;
- expiration;
- PDF/rendering;
- CRM association.

### Assistant service

Responsibilities:

- safe agent tools;
- context assembly;
- retrieval;
- recommendations;
- drafts;
- action previews;
- approval requests;
- no direct mutation.

## 7. Data authority

| Data class | Authority | Projection/cache | Memory use |
|---|---|---|---|
| Lead/contact | Twenty CRM | Nyra read models | summaries only |
| Consent/suppression | Compliance service plus CRM mapping | UI projection | never inferred as truth |
| Campaign state | Campaign service | CRM timeline/dashboard | summaries |
| Communication event | Event ledger/communication service | CRM timeline | conversational context |
| Quote/scenario | Quote service | CRM association | explanation context |
| Identity/session | Supabase Auth | app session | no credential storage |
| Agent state | Letta | operations dashboard | agent state only |
| Semantic memory | Mem0/OpenMemory | retrieval | derived and correctable |
| Graph relations | FalkorDB | retrieval | provenance required |
| Embeddings | governed source plus Qdrant | retrieval | retention controlled |

## 8. Campaign state machine

```text
draft
  → validated
  → published
  → enrolled
  → scheduled
  → step_due
  → compliance_check
      ├─ denied → suppressed/stopped
      ├─ deferred → rescheduled
      ├─ approval_required → awaiting_approval
      └─ allowed → executing
  → provider_accepted
  → delivered/completed
  → next_step_scheduled
```

Interrupts:

```text
reply_received → paused + broker_alert
STOP → immediate suppression
unsubscribe → channel or global suppression
DNC → global stop
manual_pause → paused
manual_stop → stopped
booking_created → campaign-defined branch
provider_failure → retry/dead-letter/manual review
```

## 9. Event architecture

Core events:

- `lead.received`
- `lead.normalized`
- `lead.duplicate_detected`
- `lead.crm_upserted`
- `consent.recorded`
- `campaign.enrollment_created`
- `campaign.step_due`
- `compliance.decision_recorded`
- `approval.requested`
- `approval.granted`
- `communication.requested`
- `communication.provider_accepted`
- `communication.delivered`
- `communication.failed`
- `reply.received`
- `suppression.created`
- `booking.created`
- `quote.requested`
- `quote.reviewed`
- `audit.event_recorded`

Events are versioned, idempotent, attributable, correlated, and PII-minimized.

## 10. Idempotency

Idempotency is required at:

- lead intake;
- CRM upsert;
- enrollment creation;
- step scheduling;
- provider send;
- callback processing;
- timeline write;
- quote generation;
- approval execution.

Provider callback uniqueness prefers provider event IDs and stable composite keys.

## 11. Nexus target

Grafbase Nexus is the canonical agent ingress.

Target capabilities:

- `/mcp` using Streamable HTTP where supported;
- OpenAI-compatible LLM endpoint;
- optional Anthropic-compatible endpoint;
- downstream MCP namespaces;
- caller-scoped tokens;
- safe token forwarding;
- connection health;
- JSON logs;
- OpenTelemetry export;
- explicit production CORS;
- rate limits and budgets.

Recommended namespaces:

- `code_*`
- `dev_*`
- `ops_*`
- `memory_*`
- `crm_read_*`
- `crm_staged_*`
- `campaign_read_*`
- `campaign_staged_*`
- `workflow_*`
- `browser_*`
- `secrets_read_*`
- `admin_*`

A namespace maps to authentication scope, audit class, and agent policy. It is not merely a naming convention.

## 12. Model routing

Canonical aliases:

- `local/fast-small`
- `local/coder`
- `local/reasoner`
- `local/embed`
- `agent/jefe`
- `agent/llxprt-code`
- `agent/openclaw`
- `agent/picoclaw`
- `free/openrouter-auto`
- explicitly named free routes
- `paid/*` only when owner-enabled

Production default behavior:

- prefer healthy local workers;
- use approved free or subscription-entitlement bridges where real;
- do not silently spend metered API money;
- record provider, alias, caller, fallback, token/cost estimate, and reason;
- fail honestly when no approved route is available.

## 13. Letta orchestration

Use one canonical production Letta instance.

Letta:

- owns long-running agent state;
- delegates worker tasks;
- calls Nexus for tools;
- exposes only narrow approved operations through a bridge.

Required recursion controls:

- parent task ID;
- maximum delegation depth;
- cycle detection;
- task budget;
- per-agent concurrency;
- operation allowlist;
- cancellation propagation;
- heartbeat and timeout.

## 14. Memory architecture

### Transactional truth

Twenty CRM and governed Nyra Postgres.

### Agent state

Letta.

### Semantic/runtime memory

Mem0 and OpenMemory.

### Graph memory

FalkorDB.

### Vector retrieval

Qdrant.

### Experimental cognition

MemOS, MemoryTensor, Mempalace, and similar systems behind feature flags.

Every derived memory carries provenance, confidence, namespace, sensitivity, retention, valid time, contradiction links, and correction status.

## 15. Agent governance

Every production agent declares:

- name and version;
- domain and owner;
- objective;
- callers;
- allowed data classes;
- tools;
- models and spend class;
- memory namespace;
- write authority;
- approval requirements;
- escalation;
- observable identity.

### Recommended tokens/scopes

- `NEXUS_READONLY_TOKEN`
- ` | Health-aware reroute or explicit degradation |
| Letta unavailable | Business services remain available; stateful jobs pause |
| Twenty unavailable | Queue idempotent writes and show degraded sync |
| Workflow engine unavailable | Campaign remains authoritative and retries execution |
| Compliance unavailable | Outbound communications fail closed |
| Provider callback missing | Reconciliation job and timeout state |
| OTel unavailable | Bounded buffering; safe product operation continues |
| Approval unavailable | Consequential action remains pending |

## 16. Execution roadmap

### P0 — Truth and safety

- merge this doctrine;
- select final ingress topology;
- lock Nexus CORS;
- split MCP tools into scoped namespaces;
- remove automatic paid fallback;
- create narrow Letta bridge;
- centralize telemetry;
- validate secrets and public exposure;
- reconcile staleayload digest;
- policy decision;
- approver;
- expiration.

Payload changes invalidate prior approval.

## 17. Security and privacy

Threats include:

- stolen credentials;
- prompt injection;
- overprivileged tools;
- webhook replay;
- public service exposure;
- accidental paid spend;
- stale memory;
- cross-tenant leakage;
- PII logging;
- unapproved communication;
- silent CRM corruption;
- operator error.

Controls include:

- SSO/MFA;
- service identities;
- short-lived credentials;
- least privilege;
- private networks;
- webhook signatures;
- schema validation;
- idempotency;
- immutable audit;
- approval binding;
- secret managers;
- redaction;
- backup/restore;
- kill switches.

Do not place raw SSNs, credit reports, complete loan documents, bank data, or unrestricted message bodies in general logs, traces, prompts, vector stores, or graph memory.

## 18. Observability

Nyra observes four planes:

1. infrastructure;
2. application;
3. agent;
4. business.

Target topology:

```text
Nexus / services / workers / agents
        │ OTLP
        ▼
OpenTelemetry Collector
├─ metrics → Prometheus
├─ logs → Loki
├─ traces → Tempo
└─ LLM/agent traces → OpenLIT
        │
        ▼
Grafana + Alertmanager
```

Required dashboards:

- executive conversion;
- lead nurture operations;
- communications providers;
- compliance and suppression;
- CRM sync;
- campaign scheduler;
- Nexus/tool calls;
- model routing and spend;
- Letta orchestration;
- memory systems;
- host/container/GPU;
- release health.

P0 alerts:

- outreach after suppression;
- public exposure of a protected service;
- audit pipeline failure;
- committed/exposed secret;
- CRM mutation without audit;
- approval bypass.

## 19. Operator cockpit

Primary operator environment:

- WaveTerm/WaveAI;
- WSL2-native repositories;
- Zellij persistent sessions.

Recommended layouts:

- `nyra-dev`;
- `nyra-observability`;
- `nyra-agents`;
- `nyra-release`.

## 20. Failure behavior

| Failure | Required behavior |
|---|---|
| Nexus unavailable | Agents degrade read-only; no direct bypass |
| LiteLLM unavailable | Approved fallback or explicit unavailable state |
| Worker unavailable | Health-aware reroute or fail honestly |
| Letta unavailable | Business services continue; agent jobs pause |
| Twenty unavailable | Queue idempotent writes; show degraded sync |
| Workflow engine unavailable | Campaign remains authoritative; retry execution |
| Compliance unavailable | Outbound fails closed |
| Approval unavailable | Consequential action remains pending |
| OTel unavailable | Bounded buffering; safe business operations continue |
| Provider callback missing | Reconciliation job and timeout state |

---

# Finish-line roadmap

## P0 — Repository truth and safety

- publish this doctrine;
- reconcile stale root documentation;
- choose final Cloudflare tunnel topology;
- lock Nexus CORS;
- split raw MCP access into scoped namespaces;
- remove automatic paid fallback;
- implement narrow Letta bridge;
- document public exposure;
- establish central OTel path;
- validate secrets and service identity.

Exit criteria:

- docs match active config;
- no wildcard production CORS;
- no automatic metered spend;
- no broad general-agent Docker, secrets, CRM, or infrastructure write;
- public/private matrix approved;
- smoke checks documented.

## P0 — Lead nurture vertical slice

Build one complete production-quality path from RateHunter intake to broker-visible timeline.

Acceptance:

- input validated and source recorded;
- deterministic dedupe;
- consent evidence;
- Twenty upsert;
- enrollment;
- one voice/SMS/email sequence;
- provider callback;
- STOP and reply pause;
- quiet hours;
- audit event;
- lead timeline;
- tests and smoke checks.

## P1 — Operator application

- lead cockpit;
- campaign state;
- manual call/SMS/email/pause/enroll/book actions;
- failed-run queue;
- integration health;
- approval inbox;
- mobile navigation;
- honest live/cached/mock/degraded labels.

## P1 — Public surfaces

### RateHunter

- final CTA and mobile QA;
- consent copy;
- server-side intake;
- booking;
- compliance footer;
- Cloudflare Pages verification.

### Project Nyra marketing

- product thesis;
- workflow diagram;
- capabilities;
- security/compliance posture;
- private AI architecture;
- demo/request access;
- strict separation from the authenticated app.

## P1 — Workflow adapters

Versioned importable workflows:

- `lead.created`;
- `campaign.step_due`;
- `twilio.voice.status`;
- `twilio.sms.status`;
- `sendgrid.event`;
- `reply.received`;
- `booking.created`.

Each workflow has auth, retry, dead-letter behavior, a Nyra callback, and an owner runbook.

## P2 — Quote desk

- quote request;
- assumptions;
- deterministic calculator;
- scenario versioning;
- broker approval;
- expiration and disclosures;
- PDF;
- future provider adapter.

## P2/P3 — Fulfillment intelligence

- LendingPad/LOS milestones;
- document intake;
- OCR and extraction;
- DTI support;
- asset verification;
- borrower status;
- processing task orchestration;
- exception summaries.

## Testing pyramid

### Unit

Normalization, dedupe, state transitions, quiet hours, consent, STOP, mapping, quote math.

### Contract

Twenty, Twilio, SendGrid, workflows, Nexus, Letta bridge, Supabase/Auth.

### Integration

Lead-to-timeline, reply-to-pause, STOP-to-suppression, approval-to-send, provider-failure-to-retry.

### End-to-end

Borrower intake, broker review, communication, reply, booking, timeline.

### Security

Authorization, tenant isolation, webhook replay, secret scan, public-port audit, prompt injection, tool abuse.

## Definition of done

A capability is done only when:

- source is implemented;
- contracts are typed;
- domain invariants are tested;
- auth and scopes are enforced;
- idempotency exists;
- audit exists;
- telemetry is redacted;
- failure mode is documented;
- retry/dead-letter exists;
- owner steps are recorded;
- smoke checks pass;
- UI state is honest;
- rollback is defined;
- documentation matches live configuration.
