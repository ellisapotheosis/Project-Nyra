# Project Nyra
## The Autonomous Mortgage Operating System
### Master Constitution, Founder Doctrine, Product Whitepaper, and End-State Context

## Executive abstract

Project Nyra is an AI-native mortgage lead automation and broker operations platform designed to collapse the operational distance between borrower intent and a correct, compliant, broker-controlled action.

The mortgage industry has accumulated a large collection of capable but disconnected systems: landing pages, lead vendors, inboxes, CRMs, dialers, SMS providers, email platforms, calendars, workflow automation, pricing engines, LOS platforms, document portals, task systems, and analytics. The organization remains slow because each tool owns only a fragment of context. Humans become the middleware responsible for copying, reconciling, remembering, scheduling, and manually triggering work.

Nyra's thesis is that the valuable product is not another interface. It is a governed execution loop:

```text
observe → understand → propose → validate → approve → execute → verify → remember
```

RateHunter captures borrower attention, consent, and structured intent. ProjectNyra.com explains the platform and hosts the authenticated broker command center. Project-Nyra implements the domain services, agent boundaries, memory plane, observability, infrastructure, workflow adapters, product surfaces, tests, and operational doctrine required to turn a lead into a conversation, a qualified opportunity, a broker-reviewed scenario, an application, and eventually a funded loan.

The intended mature form is an autonomous mortgage operating system: human-supervised, policy-constrained, evidence-driven, inspectable, and capable of coordinating acquisition, nurture, intake, quoting, pipeline operations, communications, knowledge, and infrastructure through a unified command surface.

The objective is not human removal. The objective is the removal of preventable friction, context loss, forgotten follow-up, invisible failure, and unauditable execution.

---

# Part I — The problem

## 1. Fragmentation

A mortgage operator may need to interact with:

- public landing pages;
- lead portals;
- web forms;
- shared and personal inboxes;
- CRM records;
- dialers;
- text messaging;
- email marketing;
- calendars;
- rate/pricing tools;
- LOS data;
- document systems;
- processing task systems;
- compliance checklists;
- analytics dashboards.

Each tool maintains partial context. Context becomes duplicated, stale, contradictory, or trapped in the memory of an individual employee.

A lead can be present in five systems while no system can answer the operationally important question: what happened, what is permitted, what happens next, and who is accountable?

## 2. Latency destroys conversion

Mortgage lead value decays quickly. A lead that waits for manual normalization, deduplication, assignment, consent review, CRM entry, and first contact is already becoming less valuable.

Nyra treats lead-response latency as a systems problem. The target is not blind immediate outreach. The target is immediate policy-aware orchestration.

The correct loop is:

```text
lead received
→ identity normalized
→ duplicate checked
→ consent evaluated
→ CRM record created or updated
→ campaign eligibility determined
→ next action scheduled
→ policy checked
→ approved action executed
→ outcome reconciled
→ operator notified
```

## 3. Institutional memory resets

Brokerages store critical operating knowledge in call notes, inboxes, browser tabs, employee memory, and undocumented habits. When a person leaves, becomes overloaded, or changes roles, the organization forgets.

Nyra makes memory explicit, layered, attributable, correctable, and governed.

## 4. Compliance is too often procedural

Policies written in a document do not guarantee that a campaign stops after a reply, STOP message, unsubscribe, or DNC change.

A real control must be part of the state transition that authorizes each communication.

Nyra's compliance capability is a gate, not a suggestion.

## 5. AI can amplify fragmentation

Adding multiple models, assistants, memory products, autonomous agents, browser tools, MCP servers, and local workers can make the system worse if every agent has direct access to everything.

Nyra therefore treats agent identity, routing, tool scopes, memory policy, spend control, observability, and human approval as foundational architecture.

---

# Part II — Identity and ecosystem

## 6. Project Nyra

Project Nyra is the intelligence and operating layer that coordinates mortgage work while preserving human accountability.

It is not merely:

- a CRM;
- a chatbot;
- a workflow collection;
- a local-model cluster;
- a marketing site;
- a collection of MCP tools.

It is the system that connects intent to governed execution.

## 7. RateHunter.net

RateHunter is the borrower acquisition surface associated with Ellis Andersen's mortgage practice.

Its mission is:

```text
attention → trust → consent → structured intent → qualified lead → booked conversation
```

RateHunter may:

- educate borrowers;
- establish trust;
- collect structured loan intent;
- collect channel consent;
- provide contact options;
- support a lead wizard or borrower chat;
- schedule calls;
- submit leads through an approved server boundary.

RateHunter must not become:

- an internal CRM;
- a broker admin dashboard;
- an infrastructure portal;
- a raw agent operations surface;
- a place that implies unsupported live rates, approvals, or underwriting outcomes.

## 8. ProjectNyra.com

ProjectNyra.com has two distinct surfaces.

### Public marketing surface

The public surface explains:

- the product thesis;
- the lead-to-funded-loan operating loop;
- mortgage-specific nurture;
- compliance posture;
- deterministic quoting;
- private/local AI options;
- integration strategy;
- demo or request-access path.

### Authenticated broker application

The authenticated application is the operator cockpit.

Primary route families include:

- dashboard;
- assistant;
- leads;
- lead detail;
- campaigns;
- campaign builder;
- applications;
- quotes;
- pipeline;
- CRM projection and sync;
- integration health;
- settings;
- safe tool launch points.

## 9. Project-Nyra repository

Project-Nyra is the implementation body of code, configuration, infrastructure, schemas, workflows, tests, documentation, and agent policy.

The repository must remain inspectable. Stale documents do not become true because they are detailed. Active source and runtime configuration outrank historical plans.

---

# Part III — Constitutional laws

## 10. Business truth has an owner

Twenty CRM is the mortgage CRM system of record.

Nyra-owned integration tables may support:

- idempotency;
- event ledgers;
- workflow state;
- provider reconciliation;
- projections;
- audit;
- application session data.

Every business object must have an explicit authority and mapping.

No prompt, memory database, workflow JSON, agent scratchpad, or dashboard cache may silently become authoritative.

## 11. Domain logic belongs in services

Campaign progression, consent eligibility, quiet hours, STOP behavior, suppression, deduplication, quote calculations, approval state, and CRM writes are domain logic.

Domain logic belongs in typed, testable Nyra services and shared packages—not in:

- a visual workflow node;
- an LLM prompt;
- a frontend component;
- an ad hoc script;
- a memory entry.

n8n and Activepieces may execute decisions. They do not own the decisions.

## 12. Agents propose; authorized services dispose

An agent may:

- interpret;
- retrieve;
- summarize;
- recommend;
- draft;
- plan;
- classify;
- request an action.

An agent may not bypass service boundaries to mutate:

- CRM;
- communications providers;
- databases;
- secrets;
- borrower records;
- production infrastructure.

Consequential actions pass through an authorized service that enforces:

- schema validation;
- caller scope;
- authorization;
- policy;
- idempotency;
- audit logging;
- approval requirements;
- verification.

## 13. Compliance is executable

TCPA-sensitive consent, DNC state, STOP/HELP handling, unsubscribe, reply-based campaign pause, quiet hours, sender identity, disclosure text, frequency limits, and suppression synchronization must be explicit code with tests.

A compliant-sounding prompt is not a compliance control.

The compliance service may return:

- allow;
- deny;
- require approval;
- defer.

Every decision includes reasons and evidence.

If the compliance service is unavailable, outbound communication fails closed.

## 14. Financial terms are deterministic

No agent may invent or imply:

- mortgage rates;
- APR;
- fees;
- cash-to-close;
- payment terms;
- eligibility;
- approval;
- underwriting outcomes.

Financial scenarios originate from deterministic calculation services, approved provider data, and broker-reviewed assumptions.

The assistant explains. It does not fabricate.

## 15. Every material action is observable

Every mutation and outbound communication must produce an attributable event with:

- request identifier;
- correlation identifier;
- actor and caller scope;
- target identifiers;
- policy decision;
- approval state;
- idempotency key;
- outcome;
- error class;
- redacted metadata;
- timestamps.

## 16. Least privilege is structural

No omnipotent agent soup.

Read access is separated from staged writes. Infrastructure administration is separated from product operations. Secrets access is read-only by default. Destructive operations require elevated, time-bounded authority.

## 17. Private infrastructure stays private

Raw Postgres, Redis, Qdrant, FalkorDB, Ollama, vLLM, Docker sockets, MCP servers, OTel collectors, Loki, Tempo, Prometheus, and worker endpoints are private.

Public ingress is minimal, authenticated where appropriate, and mediated by purpose-built gateways, Cloudflare, or Tailscale.

## 18. Paid model spend is explicit

Local, free, subscription-entitlement, and metered-paid routes are different classes.

Production defaults do not silently escalate into paid models. A paid route requires explicit owner enablement, a caller scope, budget, and observability.

## 19. Models and vendors are replaceable

Nexus, LiteLLM, typed provider adapters, domain events, and stable service contracts prevent vendor choice from becoming architectural lock-in.

The organization owns its:

- domain model;
- audit trail;
- workflows;
- knowledge;
- customer relationships;
- operating doctrine.

## 20. Completion requires proof

A task is not complete because code exists.

Completion requires:

- implementation;
- tests;
- validation commands;
- documentation;
- observability;
- rollback and failure modes;
- secret and exposure review;
- accurate status labels;
- smoke-test evidence.

---

# Part IV — The operating loop

## 21. Lead-to-action lifecycle

The core mortgage lead loop is:

```text
source
  → intake
  → normalize
  → deduplicate
  → consent ledger
  → CRM upsert
  → campaign eligibility
  → enrollment
  → step scheduling
  → compliance evaluation
  → approval evaluation
  → provider execution
  → callback/reply ingestion
  → event ledger
  → CRM timeline
  → next-state calculation
  → operator visibility
```

Every arrow is an explicit contract.

## 22. Lead ingestion

The lead-ingestion boundary:

- accepts raw source payloads;
- validates and normalizes names, phones, emails, addresses, source metadata, and loan intent;
- computes deterministic dedupe keys;
- preserves original source evidence under appropriate retention controls;
- writes audit events;
- requests a CRM upsert;
- requests campaign eligibility evaluation.

Supported source categories include:

- RateHunter form;
- Project Nyra marketing form;
- direct API;
- LeadMailbox;
- inbox/email parser;
- manual entry;
- approved lead vendors.

## 23. CRM API

The CRM API is the typed Twenty boundary.

Responsibilities:

- create/update/read mapped objects;
- idempotency;
- field validation;
- object mapping;
- timeline writes;
- task writes;
- sync status;
- retry/dead-letter behavior;
- actor attribution.

No frontend or general assistant writes directly to Twenty.

## 24. Compliance service

Responsibilities:

- channel consent;
- DNC and suppression;
- STOP/HELP;
- unsubscribe;
- quiet hours by borrower location and campaign policy;
- sender identity;
- frequency caps;
- reply pause;
- disclosure constraints;
- immutable decision evidence.

## 25. Campaign service

Responsibilities:

- versioned definitions;
- enrollment;
- state machine;
- next-due calculation;
- pause/resume;
- stop/suppress/complete;
- branch conditions;
- reply handling;
- idempotency;
- event emission;
- provider result reconciliation.

A campaign definition cannot publish until schema, unreachable-branch, timing, stop behavior, and compliance validation pass.

## 26. Communication service

Responsibilities:

- provider-neutral send requests;
- Twilio Voice and Messaging adapters;
- SendGrid or equivalent email adapters;
- callback signature validation;
- inbound reply normalization;
- timeline events;
- suppression synchronization;
- provider health;
- retry classification.

### Voice

The immediate production direction is Twilio Programmable Voice with Answering Machine Detection and `DetectMessageEnd` for voicemail branches.

Use pre-recorded human audio first. Human-answer behavior is explicit. Persist provider identifiers, detection result, duration, status, asset reference, and outcome.

Ringless voicemail is not the default. It requires separate written-consent gates, DNC review, provider review, and compliance approval.

### SMS

Requirements include:

- A2P 10DLC readiness;
- opt-in evidence;
- STOP/HELP parser;
- quiet hours;
- delivery callbacks;
- sender identity;
- suppression synchronization;
- frequency caps.

### Email

Requirements include:

- transactional/marketing classification;
- unsubscribe groups;
- suppression lists;
- bounce processing;
- truthful headers;
- physical address and disclosures;
- inbound reply handling;
- timeline synchronization.

## 27. Quote service

The quote service owns:

- deterministic calculations;
- approved provider data;
- assumptions ledger;
- scenario versioning;
- quote expiration;
- broker review;
- rendered documents;
- CRM association.

Until reliable pricing APIs exist, the product exposes broker-reviewed manual scenarios rather than fabricated automation.

## 28. Assistant service

The assistant service owns:

- safe agent-facing tools;
- context assembly;
- retrieval;
- proposal generation;
- action preview;
- approval requests;
- Nexus routing;
- output attribution.

It does not own direct business mutation.

---

# Part V — Human authority

## 29. Human authority is explicit

Humans remain responsible for legal, regulatory, credit, pricing, employment, strategic, and reputational decisions.

The system must make human authority visible rather than merely saying "human in the loop."

A consequential action progresses through:

```text
draft
→ validated
→ policy-cleared
→ awaiting-human
→ approved
→ executing
→ verified
```

Rejection, expiration, cancellation, and rollback are first-class states.

An approval binds to the exact action payload or its cryptographic digest. Material payload changes invalidate prior approval.

## 30. Action preview

Every consequential proposal includes:

- action;
- target;
- reason;
- payload or digest;
- policy decision;
- estimated cost;
- risk;
- expiration;
- rollback;
- approval requirement.

The operator sees what will happen before it happens.

---

# Part VI — Organizational cognition

## 31. Truth is not memory

Nyra distinguishes truth from memory.

- **Transactional truth:** Twenty CRM and governed Nyra stores.
- **Identity/session truth:** Supabase Auth and authorized profile stores.
- **Workflow truth:** Nyra campaign and event services.
- **Agent state:** Letta.
- **Semantic memory:** Mem0/OpenMemory.
- **Graph memory:** FalkorDB.
- **Vector retrieval:** Qdrant.
- **Experimental cognition:** feature-flagged systems with no authority.

Memory may help interpret truth. Memory may not silently overwrite truth.

## 32. Memory provenance

Every derived memory should carry:

- source;
- source timestamp;
- extraction method;
- confidence;
- subject scope;
- sensitivity;
- retention class;
- correction status;
- valid-from and valid-until;
- creator.

When memory conflicts with an authoritative record, the authoritative record wins and the stale memory is marked contradicted.

## 33. Strategic memory

Nyra's strategic value emerges when it can preserve:

- why decisions were made;
- what failed;
- what was tried;
- which assumptions changed;
- how borrowers and operators behave;
- which campaigns work for which segments;
- which bottlenecks recur.

Learning without auditability becomes invisible drift.

---

# Part VII — Agent constitution

## 34. Agent identity

Every production agent declares:

- name and version;
- domain;
- owner;
- objective;
- allowed callers;
- allowed data classes;
- allowed tools;
- allowed models;
- spend budget;
- memory namespace;
- write authority;
- approval requirements;
- escalation path;
- observable identity.

## 35. Agent domains

Representative domains:

- executive and planning;
- sales and lead conversion;
- CRM;
- campaign operations;
- compliance;
- quote and scenario;
- borrower concierge;
- processing support;
- memory;
- infrastructure and SRE;
- security and audit;
- developer and code.

## 36. Tool tiers

### Tier 0 — Public/read-only context

Public documentation and approved public research.

### Tier 1 — Internal read

CRM projections, campaign status, timelines, health, redacted logs, and memory search.

### Tier 2 — Staged write

Prepare an update, draft communication, create an approval request, propose enrollment, or propose a task.

### Tier 3 — Approved execution

Apply an approved mutation, send an approved communication, publish an approved campaign, or perform a controlled restart.

### Tier 4 — Administrative/destructive

Secrets write, database administration, Docker socket, broad filesystem, SSH, deployment, delete, export, and policy changes.

Tier 4 is never a general agent default.

## 37. Recursive orchestration prevention

The canonical Letta server orchestrates long-running agents and calls Nexus for tools.

Other systems call a narrow Letta bridge.

Do not attach a broad Letta MCP toolset back into the supervising Letta agent such that it can recursively command itself without:

- parent task identity;
- maximum delegation depth;
- cycle detection;
- budget;
- concurrency control;
- cancellation propagation;
- operation allowlist;
- heartbeat and timeout.

---

# Part VIII — Product integrity and experience

## 38. Honest state

Every page and API response distinguishes:

- live;
- cached;
- mock;
- degraded;
- unavailable;
- pending approval;
- unverified.

No dashboard implies capability that does not exist. No quote page implies live pricing without a live approved source. No assistant implies execution when it only drafted a recommendation.

## 39. Dashboard

The dashboard is an action queue, not vanity analytics.

It should prioritize:

- new leads;
- replies;
- pending approvals;
- next touches;
- failed communications;
- stale opportunities;
- CRM sync failures;
- provider health;
- campaign anomalies;
- daily funnel performance.

## 40. Lead cockpit

The lead cockpit is the operating nucleus.

It answers:

- who is this;
- where did they come from;
- what did they consent to;
- what happened;
- what did they say;
- what campaign state are they in;
- what is scheduled next;
- what is blocked;
- what needs approval;
- what is recommended;
- what evidence supports that recommendation.

## 41. Campaign builder

Mortgage-specific steps include:

- wait;
- business-hours wait;
- SMS;
- email;
- voice;
- voicemail;
- broker task;
- broker alert;
- condition;
- reply branch;
- quote reminder;
- document request;
- booking check;
- stop/suppress.

Guardrails include:

- consent;
- DNC;
- quiet hours;
- frequency;
- reply pause;
- sender identity;
- approval.

## 42. Design language

The current product preference is a dense professional dark interface using indigo/purple, seafoam/turquoise, and neon-pink alert accents with OKLCH tokens, shadcn/ui, TweakCN, Magic UI, and consistent Lucide icons.

Design constraints:

- no random color drift;
- high information density with clear hierarchy;
- keyboard-first workflows;
- mobile navigation;
- accessible contrast and focus;
- source/freshness on AI output;
- approval controls for operational impact.

---

# Part IX — Economics and strategic moat

## 43. Value creation

Nyra creates value through:

- faster first response;
- higher contact and appointment rates;
- fewer dropped leads;
- lower administrative workload;
- stronger campaign consistency;
- fewer compliance failures;
- faster quote turnaround;
- better manager visibility;
- stronger knowledge retention;
- lower marginal cost per additional lead.

## 44. Internal-first proof

Before external SaaS, Nyra should prove value in Ellis's own mortgage operations.

Track:

- lead-to-first-touch time;
- lead-to-conversation;
- booked-call rate;
- application rate;
- quote turnaround;
- funded conversion;
- touches per funded loan;
- operator hours per funded loan;
- provider cost per booked call;
- complaint/suppression rate;
- infrastructure and model cost per lead.

## 45. Commercial models

Potential models include:

- broker/LO seat;
- branch subscription;
- usage-based communications;
- managed private deployment;
- enterprise license;
- white label;
- implementation and migration;
- premium voice, quote, and intelligence modules;
- recruiting and branch enablement;
- support/SRE tier.

## 46. Strategic moat

Models commoditize. Interfaces copy easily.

Nyra's moat is the compound system:

```text
domain model
+ governed workflows
+ compliance evidence
+ integration adapters
+ historical event ledger
+ institutional memory
+ operational telemetry
+ private compute option
+ operator trust
```

The moat grows through reliable execution and accumulated context—not model novelty.

---

# Part X — Roadmap and end state

## 47. Phase 0 — Truth and safety

- reconcile docs, config, and source;
- formalize service ownership;
- close public exposure;
- enforce secrets discipline;
- define tool scopes;
- establish observability;
- eliminate silent paid fallbacks;
- prevent recursive orchestration.

## 48. Phase 1 — Lead nurture MVP

- intake;
- normalize/dedupe;
- consent ledger;
- Twenty upsert;
- campaign enrollment;
- first-touch voice/SMS/email;
- callback/reply;
- lead timeline;
- STOP/reply pause;
- broker controls.

## 49. Phase 2 — Operator cockpit

- live lead detail;
- manual actions;
- failed-run queues;
- integration health;
- campaign controls;
- approval inbox;
- mobile navigation;
- honest state labels.

## 50. Phase 3 — Quote foundation

- quote request;
- assumptions;
- deterministic calculations;
- broker approval;
- versioning;
- expiration;
- document generation.

## 51. Phase 4 — Application and fulfillment assistance

- document checklist;
- borrower status;
- task orchestration;
- LOS/LendingPad adapters;
- processing summaries;
- exception routing.

## 52. Phase 5 — Multi-user and multi-branch

- tenant isolation;
- role administration;
- branch policy;
- team routing;
- executive dashboards;
- portfolio intelligence.

## 53. Phase 6 — Autonomous mortgage enterprise

- closed-loop optimization;
- simulation and forecasting;
- controlled self-healing operations;
- human-supervised strategic agents;
- durable organizational cognition.

## 54. End state

The mature system behaves like an organizational nervous system.

It continuously:

- receives signals;
- reconciles truth;
- identifies required work;
- checks policy;
- requests human judgment;
- executes bounded actions;
- verifies outcomes;
- updates memory;
- improves operating models.

One capable operator should be able to supervise a business volume previously requiring a fragmented team, while maintaining faster response, stronger auditability, deterministic compliance, broker control, borrower transparency, resilient infrastructure, and durable institutional knowledge.

Nyra reaches maturity when the brokerage behaves as a coherent intelligence without becoming an unaccountable black box.
