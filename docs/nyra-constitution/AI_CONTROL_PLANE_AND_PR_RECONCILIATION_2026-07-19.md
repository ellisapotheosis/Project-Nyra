# Project Nyra AI Control Plane and Pull-Request Reconciliation

**Status:** Proposed canonical addendum  
**Date:** 2026-07-19  
**Repository:** `ellisapotheosis/Project-Nyra`  
**Documentation branch:** `docs/nyra-constitution-v1-20260719`  
**Primary implementation PR reviewed:** `#771`  

This addendum reconciles the Project Nyra constitution with the current AI gateway, agent, worker, MCP, A2A, and operator-tool direction. It also records the architectural impact of recent and current pull requests.

Where this document conflicts with earlier statements in the constitution package about Nexus, LiteLLM, Letta, or global orchestration, this document is the newer proposed decision and must be resolved through the ADR process before the constitution PR is marked ready.

## 1. Executive decision

Project Nyra should not operate a chain of competing universal routers or a single unrestricted global orchestrator.

The canonical target is:

```text
Human and channel surfaces
├─ Omnigent / Polly for interactive development orchestration
├─ ORCA for worktree-native engineering control
├─ Herdr for terminal multiplexing and operator visibility
├─ OpenClaw for governed chat and channel ingress
└─ Direct developer clients: LLxprt Code, Jefe, Codex, Claude Code, OpenHarness
                 │
                 ▼
       LiteLLM canonical AI gateway
       ├─ OpenAI-compatible model API
       ├─ MCP Gateway
       ├─ A2A Gateway
       ├─ virtual keys, teams, budgets, policy
       └─ routing, retries, observability
                 │
       ┌─────────┼──────────────────────────────┐
       │         │                              │
       ▼         ▼                              ▼
 OmniRoute     OpenRouter                  Direct private routes
 provider      approved routes             ├─ worker RTX 5090 models
 broker                                      ├─ worker RTX 3090 Ti models
                                             ├─ worker RTX 3060 models
                                             ├─ llxprt-jefe endpoint
                                             ├─ llxprt-code endpoint or adapter
                                             └─ explicit agent adapters
                 │
                 ▼
       Nexus private MCP aggregator
       during measured migration
                 │
                 ▼
       Scoped domain and infrastructure tools
```

The ordering is intentional:

1. LiteLLM is the canonical machine-facing gateway and policy plane.
2. OmniRoute is an optional private upstream provider and official-OAuth broker behind LiteLLM.
3. OpenRouter remains an independent upstream route behind LiteLLM.
4. Local worker models and explicit agent endpoints register directly with LiteLLM.
5. Nexus remains a private downstream MCP aggregator during migration.
6. LiteLLM MCP Gateway may gradually absorb registry, authentication, toolset, and policy functions after measured parity is proven.
7. Omnigent, ORCA, and Herdr are operator and development surfaces, not production mortgage-runtime dependencies.
8. OpenClaw is the governed channel and remote-interaction boundary, not an unrestricted infrastructure superuser.
9. Hermes is the always-on product and mortgage assistant on the RTX 3090 Ti, exposed through a narrow A2A adapter.
10. Letta is a stateful-agent and memory component, not the universal global scheduler.

## 2. Status vocabulary

- **verified:** observed in repository source or GitHub metadata and checked where possible;
- **configured:** configuration exists but runtime operation is not verified;
- **implemented:** source exists but deployment or integration is not verified;
- **merged:** pull request is merged into `main`;
- **open:** pull request is open and not merged;
- **draft:** pull request is open but explicitly not ready for merge;
- **planned:** accepted target without complete implementation;
- **proposed:** architectural direction awaiting accepted ADR or implementation evidence;
- **experimental:** allowed only behind a feature flag, isolated profile, or explicit operator action;
- **unknown:** repository or runtime inspection is still required.

## 3. Pull-request standing and architectural impact

Snapshot reviewed on 2026-07-19.

| PR | State | Scope | Architectural impact | Required doctrine action |
|---|---|---|---|---|
| `#774` | open, draft, mergeable | constitution and canonical architecture docs | establishes the documentation center but contains older Nexus/LiteLLM/Letta role statements | incorporate this addendum, update read order, and keep draft until contradictions are removed |
| `#773` | open, ready, mergeable | evidence-based release governance in `AGENTS.md` | strengthens exact-head checks, review-budget discipline, and provider deployment gates | adopt its fail-closed release rules in constitution governance |
| `#771` | open, draft, mergeable | LiteLLM MCP/A2A fast-start control plane | provides the concrete transitional AI gateway topology, worker roles, adapter, Compose, secrets, bootstrap, and verification | rebase onto current `main`, reconcile docs, validate Compose on the target host, then split or merge deliberately |
| `#769` | open, ready, mergeable | CI, tests, Dockerfiles, cache, CRDT, monitoring, and other repairs | fixes real build and test issues but mixes CI repair with substantial unrelated runtime features | split high-risk feature work from CI repair or require stronger targeted validation before merge |
| `#772` | merged | local infrastructure sync, Supabase schema, Cloudflare delivery | establishes current `main` base used by the constitution; adds durable mortgage schema and deployment evidence | treat merged source as current evidence; retain post-merge provider-failure lessons |
| `#770` | merged | broad local infra, config, and session-state synchronization | moved Cloudflared token handling toward file-based secrets but also synchronized large amounts of state | verify no ephemeral `.omc`, `.letta`, `.codex`, tokens, caches, or machine-local state remain tracked |
| `#768` | merged | evidence-based agent progression | records recovery, merge-gate, and provider-failure lessons | preserve as governance evidence |
| `#767` | merged | Phase 2 application and infrastructure wiring | introduced lead capture, subscriptions, Activepieces, and rate logic in a very large recovery merge | perform bounded post-merge provenance and production-path verification |
| `#766` | merged | Project Nyra portal, Twenty integration, hosting recovery | restored app and hosting material in a very large recovery merge | verify canonical app roots, deployment roots, and generated or duplicate assets |

### 3.1 Current PR merge order

Recommended order:

1. Keep `#774` in draft while this addendum and validation updates land.
2. Rebase `#771` on current `main` and resolve host-placement and documentation conflicts.
3. Validate the `#771` fast-start stack on the actual orchestrator and all three workers.
4. Split `#769` so CI and Docker repairs can merge without implicitly accepting unrelated cache, CRDT, or monitoring features.
5. Merge or supersede `#773` after its exact-head checks and review threads pass.
6. Mark `#774` ready only after the status matrix and superseding ADRs match the accepted implementation sequence.

## 4. Canonical responsibility matrix

| Component | Canonical role | Must not become |
|---|---|---|
| LiteLLM | client-facing model, MCP, and A2A gateway; routing, policy, budgets, virtual keys, telemetry | a duplicate per-worker gateway or silent paid-spend escalator |
| OmniRoute | private upstream provider/OAuth broker using approved official mechanisms | a parallel Nyra policy plane, public bypass proxy, or source of unverified account automation |
| OpenRouter | optional external provider route with explicit model and spend policy | an automatic paid fallback without owner authorization |
| Nexus | private MCP aggregator and namespace boundary during transition | a second public LLM gateway or unrestricted tool dump |
| Omnigent | interactive meta-harness and development orchestrator | a production mortgage transaction authority |
| Polly | worktree-based multi-agent development supervisor inside Omnigent | automatic merger or production deployment authority |
| ORCA | worktree-native engineering IDE and review surface | durable runtime scheduler |
| Herdr | terminal multiplexer, session persistence, and operator cockpit | machine-to-machine protocol or business-state owner |
| OpenClaw | channel gateway, governed remote assistant surface, and delegated workflow initiator | unrestricted shell, secrets, CRM, or production-admin superuser |
| Hermes | always-on RTX 3090 Ti product and mortgage assistant | global development scheduler or direct CRM mutation authority |
| LLxprt Code | provider-agnostic coding client and explicit A2A-capable development agent | production business-service authority |
| llxprt-jefe | specialized development or supervisory endpoint with explicit contract | undocumented privileged control plane |
| Letta | stateful agent context and selected long-term agent state through a narrow bridge | universal orchestrator or recursively exposed broad MCP authority |
| NATS/JetStream | optional event transport for asynchronous agent tasks after gateway stability | required critical-path dependency before basic routing works |
| Nyra services | typed mortgage-domain logic, authorization, idempotency, audit, and mutations | raw agent pass-throughs |
| Twenty CRM | mortgage CRM system of record | agent scratchpad or workflow-engine database |
| Mem0/OpenMemory | semantic and runtime memory | transactional truth |
| FalkorDB | graph relationships and provenance-linked retrieval | CRM authority |
| Qdrant | vector retrieval | durable business record |

## 5. Host topology

### 5.1 Orchestrator

Canonical responsibilities:

- one central database-backed LiteLLM gateway;
- LiteLLM MCP and A2A gateway features as enabled and validated;
- private Nexus downstream during migration;
- optional private OmniRoute profile;
- optional NATS/JetStream profile after base gateway validation;
- central OpenTelemetry collection and routing;
- LiteLLM virtual key, team, budget, and model-policy administration;
- private routing over Tailscale or controlled Cloudflare machine authentication;
- no worker-local duplication of the organization-wide LiteLLM policy plane.

### 5.2 Worker RTX 3090 Ti

Canonical responsibilities:

- stable always-on product inference;
- Hermes as `nyra/product-assistant`;
- private local model server;
- narrow Hermes A2A adapter;
- no direct exposure to public internet clients;
- no direct unrestricted CRM, secret, Docker, or infrastructure mutations.

### 5.3 Worker RTX 5090

Canonical responsibilities:

- strongest available local development and reasoning model that fits actual hardware limits;
- LLxprt Code, llxprt-jefe, Codex, Claude Code, OpenHarness, Omnigent, ORCA, and Herdr operator workflows as installed;
- explicit A2A adapters for agents that do not natively expose the accepted A2A contract;
- burst inference and development work;
- no production mortgage channel dependency on laptop uptime.

The repository must use the actual RTX 5090 VRAM value observed on the machine. Existing contradictory 32 GB or 48 GB claims must not remain authoritative when the device is 24 GB.

### 5.4 Worker RTX 3060

Canonical responsibilities:

- embeddings;
- extraction;
- summarization;
- document preprocessing;
- memory computation and indexing;
- small utility inference;
- no sole durable copy of critical mortgage records, memory, or audit data.

### 5.5 Oracle VPS

Canonical responsibilities remain focused on durable business services:

- Twenty CRM;
- governed Postgres and Supabase services;
- Redis where required;
- Nyra domain services;
- workflows and callbacks;
- durable event and audit data;
- selected memory services where durability and availability justify placement;
- public ingress only according to the final tunnel and domain ADR.

LiteLLM and Nexus host placement must be reconciled from current runtime evidence. The target is the orchestrator, while the existing Oracle deployment remains supported only as a measured transition path.

## 6. Model and agent request paths

### 6.1 Model request

```text
client or agent
  → LiteLLM virtual key
  → caller/team/model policy
  → alias resolution
  → health and budget evaluation
  → one approved route:
       direct local worker
       OmniRoute official provider route
       OpenRouter approved route
       explicit external API route
  → response
  → redacted telemetry and cost attribution
```

### 6.2 MCP request during transition

```text
client or agent
  → LiteLLM MCP Gateway
  → caller-scoped toolset
  → Nexus private downstream namespace
  → domain-specific MCP adapter or Nyra service
  → authorization, validation, audit, and result
```

Raw Docker, Infisical, CRM, database, browser, and infrastructure toolsets must not be presented as one unrestricted list.

### 6.3 A2A request

```text
orchestrator or client
  → LiteLLM A2A Gateway
  → agent identity and scoped key
  → A2A Agent Card discovery
  → task submission
  → task status / artifacts / cancellation
  → adapter or native agent
  → model and tool calls through governed boundaries
```

### 6.4 OpenClaw request

```text
approved channel
  → OpenClaw gateway and channel identity
  → Nyra policy wrapper
  → LiteLLM model or A2A route
  → LiteLLM MCP toolset / Nexus namespace
  → staged Nyra service action
  → human approval where consequential
  → verified execution and audit
```

## 7. LiteLLM policy

LiteLLM is the canonical programmatic entry point for model, MCP, and A2A traffic.

Required capabilities:

- one database-backed gateway;
- scoped virtual keys and teams;
- per-key and per-team budgets;
- model alias allowlists;
- explicit paid-spend classes;
- health-aware routing;
- bounded retries and fallbacks;
- caller, provider, model, latency, token, cost, and fallback attribution;
- MCP server and toolset registration;
- A2A agent registration and task lifecycle;
- OpenTelemetry-compatible traces and metrics;
- audit events for key, policy, registry, and budget changes;
- no secrets committed to Git.

Recommended aliases:

- `nyra/product-assistant`
- `nyra/dev-local`
- `nyra/dev-premium`
- `nyra/memory-chat`
- `nyra/embeddings`
- `agent/hermes`
- `agent/llxprt-code`
- `agent/llxprt-jefe`
- `agent/openclaw`
- `provider/omniroute-auto`
- `provider/openrouter-approved`

Aliases must resolve through policy, not by embedding physical hostnames in clients.

## 8. OmniRoute policy

OmniRoute is an optional private upstream provider broker.

Approved use:

- official OAuth flows;
- provider API keys;
- provider-format translation;
- account health and quota-aware selection;
- bounded provider fallback;
- usage attribution;
- private OpenAI-compatible upstream to LiteLLM.

Prohibited use:

- cookie relay;
- browser fingerprint spoofing;
- geo-restriction bypass;
- anti-detection behavior;
- unverified unlimited-free claims;
- public unauthenticated exposure;
- direct access to Nyra MCP tools, A2A registry, CRM, secrets, or infrastructure;
- independent model aliases that bypass LiteLLM policy.

OmniRoute credentials remain isolated from ordinary agents. LiteLLM sees only the minimum upstream credential or service identity needed to call the private OmniRoute endpoint.

## 9. OpenRouter policy

OpenRouter remains a separate upstream behind LiteLLM.

- use explicit model allowlists;
- separate free, subscription-entitlement, and metered routes;
- do not treat a nominally free route as guaranteed capacity;
- disable automatic transition into paid routes unless the owner explicitly enables a spend class;
- record provider and fallback reason;
- add health, timeout, and circuit-breaker behavior;
- ensure mortgage production workloads have a stable approved route and do not depend solely on consumer subscription behavior.

## 10. LLxprt Code and llxprt-jefe

LLxprt Code is a provider-agnostic development client with custom OpenAI-compatible base URLs, local model support, MCP integration, profiles, and subagents.

Nyra policy:

- point LLxprt Code at LiteLLM rather than directly at every provider and worker;
- use named profiles for local, premium-development, read-only-review, and isolated-experiment roles;
- expose LLxprt Code as an A2A agent only through a native interface or narrow adapter;
- prevent general development profiles from receiving production CRM, secret, or infrastructure-write scopes;
- use worktrees for parallel code agents;
- require cross-agent review for high-risk changes;
- preserve an operator-controlled merge gate.

`llxprt-jefe` is treated as a custom or private specialized endpoint until its active repository, protocol, authentication, host, and runtime behavior are verified. It must publish an explicit model API or A2A contract, health endpoint, owner, scopes, timeout, concurrency limit, and audit identity before becoming canonical.

## 11. Omnigent, Polly, ORCA, and Herdr

### Omnigent

Omnigent is the interactive meta-harness and policy-aware development orchestration layer.

- run as an operator-selected development surface;
- use LiteLLM aliases and scoped keys;
- use isolated sandboxes and worktrees;
- keep experimental alpha features off the production mortgage critical path;
- do not let its policy layer conflict with LiteLLM model/spend policy or Nyra service authorization;
- export session and subtask telemetry with correlation IDs where supported.

### Polly

Polly may decompose engineering work, delegate to multiple coding harnesses, require cross-vendor review, and open pull requests.

Polly must not:

- merge automatically;
- bypass branch protection;
- alter production infrastructure without an approved change path;
- share one writable worktree across concurrent agents;
- treat a successful agent response as proof that tests or deployments passed.

### ORCA

ORCA is a worktree-native IDE and review surface for parallel agents.

- use one feature or bounded work slice per worktree;
- keep base and head SHA visible;
- link each worktree to issue, PR, checks, and rollback path;
- use it to inspect diffs and agent state, not as a durable automation scheduler;
- do not make production services depend on the ORCA desktop application.

### Herdr

Herdr is a terminal multiplexer and operator cockpit.

- maintain named workspaces for gateway, workers, agents, observability, and deployments;
- persist terminal sessions without treating terminal state as durable business state;
- use read-only dashboards by default;
- require an explicit elevated session for production changes;
- do not commit Herdr local state, sockets, logs, or credentials.

## 12. Hermes role

Hermes runs on the RTX 3090 Ti as the stable always-on product and mortgage assistant.

Required boundaries:

- model calls use `nyra/product-assistant` through LiteLLM;
- external invocation uses an A2A Agent Card and scoped A2A identity;
- tools come from a narrow LiteLLM MCP toolset or Nexus namespace;
- CRM writes are staged through Nyra services;
- communications require compliance checks and human approval where defined;
- memory writes are namespaced, provenance-linked, correctable, and non-transactional;
- cron or scheduled tasks must be idempotent, observable, bounded, and cancelable;
- Hermes may delegate narrow tasks but is not the universal global orchestrator;
- Hermes does not inherit owner-level shell, Docker, secret, or infrastructure permissions.

## 13. OpenClaw role

OpenClaw is the governed multi-channel gateway and remote assistant surface.

Canonical use:

- Telegram, Discord, Slack, web chat, or other approved channels;
- channel identity mapping;
- user and tenant policy;
- remote interaction with Hermes or other registered A2A agents;
- alerts, approvals, summaries, and bounded delegated workflows;
- model calls through LiteLLM;
- tool calls through scoped LiteLLM MCP toolsets and Nexus namespaces during transition.

Required hardening:

- bind the gateway to loopback or a trusted private network unless a purpose-built authenticated ingress is configured;
- use separate channel, gateway, model, MCP, and A2A credentials;
- install only reviewed skills and plugins;
- pin or verify third-party skill sources;
- isolate agent workspaces;
- prevent concurrent commands from mutating the same configuration file without locking;
- separate read-only, staged-write, approved-execution, and admin agents;
- redact channel content and borrower PII from general telemetry;
- maintain kill switches for channels, agents, tools, and outbound communications.

OpenClaw may coordinate remote interactions, but long-running production jobs must use explicit task state, idempotency, progress events, cancellation, and durable audit rather than relying only on conversational session state.

## 14. Letta role revision

Earlier constitution drafts describe Letta as the canonical stateful orchestrator. The current direction narrows that role.

Proposed decision:

- Letta remains one canonical stateful-agent service where its memory and agent-state capabilities add value;
- Letta is not the global scheduler for all Nyra agents;
- Letta calls tools through a narrow governed bridge;
- no broad Letta MCP server is registered into a supervisor that can recursively call itself;
- A2A task identity, delegation depth, cycle detection, concurrency, budget, cancellation, heartbeat, and timeout apply to all delegated work;
- durable mortgage process state remains in Nyra services, Twenty CRM, and governed databases.

## 15. A2A protocol policy

The target protocol is the latest released A2A `1.0.x` specification and official SDKs where practical.

PR `#771` intentionally uses a custom A2A `0.3` adapter as a fast-start bridge. That adapter is transitional.

Migration requirements:

1. retain the current adapter only behind an explicit compatibility label;
2. publish valid Agent Cards;
3. map old task fields to A2A 1.0 task, message, artifact, status, and cancellation semantics;
4. preserve stable Nyra agent IDs and aliases;
5. add conformance tests for discovery, send, stream or poll, status, artifact retrieval, cancellation, timeout, and error mapping;
6. authenticate every agent and caller;
7. propagate correlation and trace context;
8. enforce per-agent concurrency, budget, model, tool, and data policy;
9. support graceful version negotiation during migration;
10. remove the 0.3 compatibility path after all registered agents pass 1.0 conformance and rollback testing.

Agent Card minimum fields for Nyra:

- stable agent ID;
- display name and version;
- owner and business domain;
- endpoint and protocol version;
- capabilities and accepted modalities;
- authentication scheme;
- model aliases and spend class;
- tool scopes;
- data classifications;
- memory namespace;
- maximum task duration;
- concurrency limit;
- approval requirements;
- health endpoint;
- observability identity;
- deprecation and rollback metadata.

## 16. MCP migration policy

### Stage 0 — Current

- Nexus remains the active private MCP aggregator where already deployed.
- Direct raw MCP registrations are reviewed for scope and recursion risk.
- LiteLLM is the model gateway.

### Stage 1 — Fast start

- LiteLLM MCP Gateway becomes the client-facing MCP entry point.
- Nexus is registered as a private downstream server.
- LiteLLM virtual keys map callers to MCP toolsets.
- raw tools remain hidden behind namespaces.

### Stage 2 — Dual registry with evidence

- register a small set of low-risk MCP servers directly in LiteLLM;
- compare auth, discovery, OAuth, toolsets, latency, telemetry, and failure behavior with Nexus;
- keep one canonical tool name and schema per capability;
- prevent duplicate tool exposure to the same caller.

### Stage 3 — Decision gate

Retain Nexus when it provides measurable value in:

- namespace policy;
- schema normalization;
- token forwarding;
- multi-server health;
- protocol translation;
- observability;
- operational reliability.

Retire or narrow Nexus only when LiteLLM provides equivalent behavior with lower complexity and the rollback path is proven.

No migration stage may expose databases, Docker sockets, secrets, raw model servers, or privileged admin tools publicly.

## 17. Security architecture

### Identity separation

Use separate credentials for:

- human administrators;
- developer clients;
- Omnigent and Polly;
- ORCA and Herdr operator sessions;
- OpenClaw gateway and each channel;
- Hermes;
- LLxprt Code;
- llxprt-jefe;
- memory worker;
- LiteLLM upstream providers;
- LiteLLM MCP toolsets;
- Nexus downstream access;
- A2A agents;
- CI and deployment automation.

### Secret storage

- Infisical remains the managed source where deployed;
- `/etc/projectnyra/secrets` may contain rendered runtime files with `0700` directories and `0600` files;
- rendered files are generated per host and never committed;
- fix worker Infisical paths so each worker uses its own machine path rather than `/machines/oracle-vps`;
- do not synchronize local session directories into Git;
- rotate any credential whose handling is ambiguous after broad sync PRs;
- use LiteLLM virtual keys rather than sharing provider credentials with clients;
- use keyrings for interactive developer OAuth or API credentials where supported.

### Network

- worker models, agent adapters, Nexus, raw MCP servers, databases, caches, and observability internals remain private;
- prefer Tailscale for machine-to-machine paths;
- Cloudflare ingress uses machine-compatible authentication for MCP and A2A, not a browser-only challenge;
- separate public product hostnames from private admin, model, MCP, and A2A hostnames;
- bind services to loopback unless a private interface and firewall rule are intentionally configured;
- maintain an exposure matrix generated from active tunnel, DNS, Compose, and firewall configuration.

## 18. Observability

Every model, MCP, A2A, and orchestration action should carry:

- trace ID;
- correlation ID;
- parent task ID;
- caller identity;
- agent identity;
- model alias and resolved provider/model;
- toolset and tool identity;
- host and service identity;
- queue and task status;
- latency;
- retry and fallback reason;
- token and cost estimate;
- approval state;
- redaction state;
- terminal outcome.

Required dashboards:

- LiteLLM request, provider, model, budget, and fallback health;
- OmniRoute upstream health and quota without exposing credentials;
- OpenRouter route and spend health;
- local worker model health, queue, VRAM, temperature, and error rates;
- A2A agent discovery, task duration, queue, cancellation, and failure;
- MCP server, toolset, tool latency, errors, and authorization denials;
- Nexus versus direct LiteLLM MCP comparison during migration;
- Hermes task, memory, tool, approval, and channel outcomes;
- OpenClaw channel, session, agent, and tool health;
- development orchestration PR, worktree, review, and check status;
- release exact-head checks and provider deployment status.

PII and secrets are not observability payloads. Store identifiers, classifications, hashes, and redacted summaries rather than unrestricted borrower content.

## 19. Governance rules

### Gateway governance

- one canonical LiteLLM base URL per environment;
- one authoritative alias catalog;
- one key and team policy source;
- one approved MCP toolset catalog;
- one A2A agent registry or synchronized authoritative registry;
- no client-specific hidden provider bypasses;
- no paid fallback without explicit spend-class enablement.

### Agent governance

Every agent declares:

- owner;
- role;
- version;
- runtime host;
- protocol;
- callers;
- data classes;
- model aliases;
- spend class;
- tools;
- memory namespace;
- write authority;
- approval requirements;
- task timeout;
- concurrency;
- escalation;
- observability identity;
- kill switch.

### Pull-request governance

- use bounded changes and worktrees;
- reserve review capacity for final-head validation;
- fail closed when required checks are missing, skipped, neutral, stale, or run against a different SHA;
- require deployment-target preflight before merge when apps or infrastructure are touched;
- do not treat post-merge provider failure as success;
- separate CI repair from unrelated feature expansion;
- add exact commands, evidence, owner actions, and rollback to every infrastructure PR;
- do not auto-merge high-risk gateway, secrets, network, CRM, compliance, or communication changes.

## 20. Conflict register additions

| ID | Conflict | Canonical decision | Required action |
|---|---|---|---|
| C-016 | Nexus singular LLM ingress versus LiteLLM client-facing gateway in `#771` | LiteLLM is the canonical machine-facing model/MCP/A2A gateway; Nexus is private downstream MCP during transition | update older constitution sections and implementation configs |
| C-017 | Letta universal orchestrator versus federated role-based orchestration | Letta owns selected stateful-agent context; it is not the global scheduler | supersede older ADR language and narrow the Letta bridge |
| C-018 | OmniRoute as a parallel gateway versus upstream provider broker | OmniRoute is private and behind LiteLLM | configure one-way upstream routing and remove client bypasses |
| C-019 | A2A 0.3 custom adapter versus released A2A 1.0 | 0.3 is transitional; 1.0 is target | add compatibility label, conformance suite, and migration plan |
| C-020 | Omnigent, ORCA, and Herdr described as orchestration runtime | these are development/operator surfaces | exclude from production business-service critical path |
| C-021 | Hermes product assistant versus global scheduler | Hermes is the always-on 3090 Ti product agent | publish scoped Agent Card and tool policy |
| C-022 | OpenClaw channel gateway versus unrestricted orchestrator | OpenClaw owns governed channels and delegated workflows | add policy wrapper, isolated agents, approvals, and kill switches |
| C-023 | worker-local LiteLLM instances versus central governance | one central LiteLLM; workers expose models and adapters | disable duplicate worker gateways after migration validation |
| C-024 | broad session-state sync in `#770` versus repository hygiene | ephemeral state does not belong in Git | audit tracked files, add ignore rules, purge sensitive history if required |
| C-025 | `#769` CI repair versus large unrelated feature expansion | CI repair must be independently reviewable | split PR or require component-specific acceptance evidence |
| C-026 | 5090 VRAM values vary across repository sources | hardware-observed value is authoritative | run inventory check and update all docs/configs |
| C-027 | workers using Oracle VPS Infisical paths | each host has a distinct secret path and identity | update sidecars/config and rotate ambiguous credentials |
| C-028 | duplicate routing and fallback policies across LiteLLM, OmniRoute, clients, and OpenRouter | LiteLLM owns final Nyra policy; upstream routers expose capabilities only | centralize aliases, spend, fallback, and audit policy |

## 21. Superseding architecture decisions

### ADR-006 — LiteLLM is the canonical AI gateway

**Status:** Proposed; implementation present in draft PR `#771`

#### Decision

LiteLLM is the canonical client-facing gateway for model, MCP, and A2A traffic. It owns Nyra aliases, virtual keys, team and budget policy, fallback policy, and gateway telemetry.

Nexus remains private and downstream for MCP during migration. OmniRoute and OpenRouter are upstream model providers, not peer policy planes.

#### Consequences

- one client base URL and policy surface;
- direct local worker routes remain possible without exposing physical topology to clients;
- existing Nexus-first documentation and configs require reconciliation;
- worker-local LiteLLM duplication is removed after migration;
- LiteLLM availability becomes critical and needs HA, backup, and rollback planning.

### ADR-007 — Federated role-based orchestration

**Status:** Proposed

#### Decision

Nyra uses role-specific orchestration rather than one universal orchestrator:

- Omnigent/Polly: interactive development task decomposition and cross-agent review;
- ORCA: worktree-native engineering control;
- Herdr: terminal session and operator visibility;
- OpenClaw: governed channels and remote delegated workflows;
- Hermes: always-on product assistant;
- Letta: selected stateful-agent context;
- Nyra services: durable mortgage process state;
- LiteLLM A2A Gateway: agent discovery and task transport.

#### Consequences

- fewer recursive authority loops;
- each surface receives narrow permissions;
- correlation, task state, cancellation, and audit must cross system boundaries;
- no single UI or agent becomes a mandatory dependency for business services.

### ADR-008 — A2A 1.0 is the target interoperability contract

**Status:** Proposed; 0.3 compatibility implemented in draft PR `#771`

#### Decision

Use the latest released A2A 1.0 specification and official SDKs where practical. Keep the existing 0.3 adapter only as a time-bounded compatibility bridge.

#### Consequences

- agent cards and task semantics become vendor-neutral;
- adapters require conformance testing;
- version negotiation and rollback are required during migration;
- agent-specific CLI behavior remains behind adapters rather than leaking into the gateway contract.

### ADR-009 — Operator tools are not production runtime dependencies

**Status:** Proposed

#### Decision

Omnigent, ORCA, and Herdr improve developer throughput and control but are not required for production mortgage services, campaign execution, compliance, CRM synchronization, or public APIs.

#### Consequences

- workstation outages do not stop business services;
- local state is not committed as durable truth;
- operator tools can be replaced without changing domain contracts.

### ADR-010 — OpenClaw is the governed channel boundary

**Status:** Proposed

#### Decision

OpenClaw owns approved conversational channels and remote agent interaction. It calls LiteLLM for models and A2A, and uses scoped MCP toolsets for tools. Consequential actions remain staged through Nyra services and approval.

#### Consequences

- channel integrations are consolidated;
- prompt injection and skill supply-chain risk require isolation and review;
- OpenClaw cannot receive general owner-level infrastructure authority;
- durable long-running work requires explicit task state outside chat sessions.

### ADR-011 — OmniRoute is a private upstream provider broker

**Status:** Proposed; optional Compose profile exists in draft PR `#771`

#### Decision

OmniRoute may broker approved official OAuth and API provider routes behind LiteLLM. It does not expose Nyra MCP, A2A, CRM, memory, secrets, or infrastructure surfaces and does not own canonical aliases or spend policy.

#### Consequences

- provider flexibility and account health routing improve;
- double routing must be observable and bounded;
- unsupported or evasive provider mechanisms are disabled;
- upstream failures remain distinguishable from LiteLLM policy failures.

### ADR-012 — Nexus migration is evidence-gated

**Status:** Proposed

#### Decision

Nexus remains a private MCP aggregator during LiteLLM MCP Gateway adoption. Nyra will retain, narrow, or retire Nexus only after direct comparison of security, namespaces, OAuth, token forwarding, schema normalization, observability, latency, and operational reliability.

#### Consequences

- no big-bang gateway replacement;
- temporary dual registry requires strict duplicate-tool prevention;
- migration tests and rollback are mandatory;
- the final decision is based on measured value, not component enthusiasm.

## 22. Roadmap

### Gate 0 — Documentation and PR reconciliation

- add this document to the constitution package;
- update the constitution read order and core identity;
- make the newer LiteLLM, Nexus, OmniRoute, OpenClaw, Hermes, Letta, and A2A decisions explicit;
- rebase `#771` on current `main`;
- split or tightly scope `#769`;
- verify exact-head checks for open PRs;
- audit tracked ephemeral state from `#770`;
- validate canonical app and deployment paths after `#766` and `#767`.

Exit criteria:

- no contradictory canonical gateway or orchestrator statements;
- open PR status is accurately recorded;
- documentation validation includes this file;
- no unresolved review threads or stale checks on the constitution head.

### P0 — Central LiteLLM fast start

- deploy Postgres and LiteLLM on the orchestrator;
- create scoped teams and virtual keys;
- register direct private worker endpoints;
- register approved OpenRouter routes;
- verify model aliases;
- test from all three workers over Tailscale;
- add health, persistence, budget, and fallback tests;
- keep paid routes disabled by default.

Exit criteria:

- one stable LiteLLM URL works from all approved clients;
- local aliases resolve correctly;
- unauthorized keys fail;
- provider, model, fallback, token, and cost attribution is visible;
- restart preserves configuration and audit state.

### P0 — MCP transition

- enable LiteLLM MCP Gateway;
- register Nexus as a private downstream server;
- define read-only, staged-write, approved-execution, and admin toolsets;
- block raw broad tool exposure;
- verify OAuth or machine authentication discovery paths;
- test tool discovery, invocation, denial, timeout, and audit.

Exit criteria:

- clients use LiteLLM MCP entry point;
- Nexus is not publicly exposed;
- each caller sees only its allowed toolset;
- CRM, secrets, Docker, browser, and infrastructure writes require isolated scopes and approval.

### P0 — Hermes and A2A

- run Hermes on RTX 3090 Ti;
- publish narrow Agent Card;
- connect `nyra/product-assistant` through LiteLLM;
- register Hermes in LiteLLM A2A Gateway;
- validate message, task, status, artifact, cancellation, timeout, and restart behavior;
- keep the 0.3 adapter labeled as compatibility mode;
- begin A2A 1.0 adapter implementation and conformance tests.

Exit criteria:

- Hermes survives restarts;
- no direct provider credential is exposed to callers;
- tools are scoped;
- memory is namespaced and correctable;
- task state and audit are visible.

### P1 — Development operator plane

- point LLxprt Code and llxprt-jefe at LiteLLM;
- define profiles for local, premium, review, and experimental work;
- configure Omnigent/Polly worktree isolation;
- configure ORCA worktree and PR linkage;
- configure Herdr workspaces for gateway, workers, agents, observability, and deployment;
- add cross-agent review and exact-head validation templates.

Exit criteria:

- concurrent agents never share a writable worktree;
- agents cannot merge or deploy without policy;
- every PR has an owner, bounded scope, tests, checks, and rollback;
- operator-tool outage does not affect production services.

### P1 — OpenClaw governed channels

- deploy OpenClaw behind private or purpose-built authenticated ingress;
- create isolated agents for read, staged write, approved execution, and admin;
- connect models and A2A through LiteLLM;
- connect tools through scoped MCP toolsets;
- add channel identity, approval, audit, PII redaction, skill review, and kill switches;
- test concurrent sessions and configuration locking.

Exit criteria:

- channel users receive only their allowed agents and tools;
- prompt injection cannot directly reach privileged tools;
- consequential actions require policy and approval;
- long-running tasks are durable, cancelable, and observable.

### P2 — Nexus evidence gate

- directly register a small low-risk MCP subset in LiteLLM;
- run parallel tests against Nexus-backed and direct paths;
- compare security, latency, reliability, observability, and operations;
- choose retain, narrow, or retire;
- execute migration with rollback.

Exit criteria:

- no duplicate tools;
- no policy regression;
- all clients retain stable contracts;
- rollback is tested;
- final ADR is accepted and older docs are updated.

## 23. Definition of done for the AI control plane

The control plane is not done until:

- one canonical LiteLLM endpoint exists per environment;
- all physical endpoints are private;
- aliases hide host and provider topology;
- local workers, OmniRoute, OpenRouter, and explicit external APIs are policy-controlled;
- paid spend is owner-enabled rather than silently selected;
- MCP callers receive scoped toolsets;
- A2A agents publish governed Agent Cards;
- A2A 1.0 conformance is achieved or a dated compatibility exception exists;
- OpenClaw, Hermes, LLxprt, Omnigent, ORCA, Herdr, and Letta have distinct documented roles;
- no agent directly mutates mortgage truth or privileged infrastructure;
- retries, timeouts, cancellation, concurrency, budgets, and circuit breakers exist;
- telemetry is correlated and PII-minimized;
- secrets are per-host, least-privilege, rotated, and absent from Git;
- exact-head CI, security, Compose, smoke, and deployment checks pass;
- owner-only actions are documented;
- backup, restore, failover, and rollback are tested;
- documentation matches active configuration and runtime evidence.

## 24. Explicit exclusions

The following are not added to the critical path by this architecture:

- Claude Flow;
- Ruflo;
- agentic-flow;
- flow-nexus;
- ruv-swarm;
- AgentDB;
- RuVector;
- Dify or reintroduced Dify architecture;
- Kubernetes;
- speculative swarm frameworks without a bounded Nyra use case and validation plan.

Additional frameworks may be evaluated only in isolated experiments and must not duplicate LiteLLM, MCP, A2A, CRM, compliance, audit, or durable process-state authority.

## 25. Primary upstream references

- LiteLLM documentation: `https://docs.litellm.ai/`
- A2A specification: `https://github.com/a2aproject/A2A`
- OmniRoute: `https://github.com/diegosouzapw/OmniRoute`
- Omnigent: `https://omnigent.ai/`
- LLxprt Code: `https://github.com/vybestack/llxprt-code`
- Herdr: `https://github.com/ogulcancelik/herdr`
- ORCA: `https://github.com/stablyai/orca`
- OpenClaw: `https://github.com/openclaw/openclaw`
- Hermes Agent: `https://github.com/NousResearch/hermes-agent`

Upstream capability claims must be rechecked against pinned versions before production deployment.