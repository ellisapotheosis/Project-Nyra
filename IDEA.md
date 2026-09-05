---
title: "Project Nyra — Product Vision, Architecture, and Agent Operating Context"
document: "idea.md"
status: "Canonical product-intent and architecture context"
audience:
  - "Hermes"
  - "Claude Code"
  - "Codex CLI"
  - "Gemini CLI"
  - "LLxprt Jefe / LLxprt Code"
  - "OpenClaw"
  - "Project Nyra engineers and operators"
owner: "Ellis Andersen / EllisApotheosis"
updated: "2026-07-20"
---

# Project Nyra

> **The Stack That Never Sleeps.**

Project Nyra is an AI-native, broker-owned mortgage operating system designed to turn fragmented mortgage work into one coherent, auditable, automation-first platform.

It combines:

- borrower lead capture;
- lead normalization, enrichment, scoring, and deduplication;
- Twenty CRM as the operational system of record;
- compliant SMS, email, voice, and voicemail campaign automation;
- deterministic mortgage quote generation;
- broker approvals and human judgment;
- an AI mortgage assistant named **Nyra**;
- distributed local GPU inference;
- cloud-model fallback;
- MCP and A2A tool/agent routing;
- memory and knowledge systems;
- infrastructure observability;
- private networking;
- secure public ingress;
- a cinematic Project Nyra product website;
- a separate borrower-facing RateHunter website;
- and an authenticated broker command center.

Project Nyra is **not** a generic chatbot, a generic CRM skin, a collection of unrelated self-hosted dashboards, or a borrower-facing “AI decides your loan” product.

It is a mortgage operations platform whose purpose is to improve speed-to-lead, follow-up consistency, quote accuracy, pipeline visibility, compliance, broker productivity, and funded-loan conversion while preserving human authority over regulated or financially consequential actions.

---

# 1. How Hermes Must Use This File

This file explains the intended product, architecture, boundaries, and design philosophy of Project Nyra.

Hermes must treat it as the canonical description of **what the system is supposed to become**, while treating the actual repository, deployed configuration, tests, and current infrastructure as the source of truth for **what exists today**.

When implementing work:

1. Inspect the repository before changing architecture.
2. Prefer the newest explicit architecture decisions over stale prompts or archived scaffolding.
3. Preserve working code and migrate incrementally.
4. Do not revive old systems merely because they still appear in archived documentation.
5. Clearly distinguish:
   - current implementation;
   - transitional architecture;
   - target architecture;
   - optional future systems.
6. Never claim a service is operational without a health check, test, build, or direct evidence.
7. Never allow visual polish to hide broken data, mock state, compliance failures, or unavailable services.
8. Never let an LLM mutate regulated business records through unrestricted direct database access.
9. Keep business logic in Nyra services and domain packages—not only in prompts, n8n workflows, or frontend components.
10. Optimize for a production vertical slice before expanding the tool zoo.

This document is intentionally detailed so Hermes can reason about product intent without repeatedly asking what Project Nyra is.

## 1.1 Current Baseline at Document Date

As of 2026-07-20, the repository has already absorbed substantial application, infrastructure, UI-recovery, Supabase, Cloudflare, LiteLLM, MCP, A2A, and architecture-governance work.

Important current direction:

- a Project Nyra constitution and canonical architecture package has been merged;
- a central LiteLLM MCP/A2A fast-start control plane has been merged;
- Hermes is assigned to the RTX 3090 Ti product-assistant role;
- the RTX 5090 is assigned primarily to interactive development and heavy reasoning;
- the RTX 3060 is assigned to embeddings, extraction, memory processing, and utility inference;
- Nexus remains available as a private downstream MCP aggregator;
- Oracle and orchestrator deployments may still overlap during migration;
- application, infrastructure, and generated-agent work have been synchronized through broad integration snapshots.

This does **not** mean the entire platform is production-complete.

Hermes must verify the exact checked-out commit, current branch, workflow status, Cloudflare deployment status, Compose rendering, environment inventory, and live service health before describing current runtime state.

---

# 2. The Project Family

Project Nyra is a family of tightly related but deliberately separated products.

## 2.1 RateHunter

**Domain:** `ratehunter.net`

RateHunter is Ellis Andersen’s public mortgage-broker brand and borrower-facing conversion front door.

Its job is to:

- establish credibility;
- explain the advantage of using an independent mortgage broker;
- present Ellis as the human expert;
- capture borrower and referral-partner inquiries;
- collect valid communication consent;
- offer a fast path to a call, application, or quote discussion;
- and securely hand new leads to Project Nyra’s ingestion boundary.

RateHunter is not the internal CRM, not the Project Nyra product-marketing site, and not an infrastructure dashboard.

## 2.2 Project Nyra Marketing Site

**Primary domain:** `projectnyra.com`

ProjectNyra.com is the public product-marketing site for Project Nyra.

Its audience is:

- independent mortgage brokers;
- branch managers;
- producing managers;
- small independent mortgage banks;
- mortgage operations teams;
- technical operators;
- and potential collaborators or early adopters.

It explains the platform, its workflow, its AI control plane, its compliance posture, its owned infrastructure, and its business value.

ProjectNyra.com is not a borrower loan application and must not be confused with RateHunter.

## 2.3 Project Nyra Authenticated Web Application

**Primary domain:** `app.projectnyra.com`

The authenticated Project Nyra web application is the broker command center.

It is where operators manage:

- leads;
- borrower communications;
- campaigns;
- quotes;
- pipeline stages;
- approvals;
- tasks;
- documents;
- assistant actions;
- integration health;
- worker/model routing;
- audit events;
- and compliance state.

This surface must prioritize speed, truth, usability, and operational clarity over cinematic effects.

## 2.4 Twenty CRM

Twenty CRM is the authoritative CRM and business-record system.

It stores and manages the durable operational state of:

- people;
- companies;
- leads;
- loan opportunities;
- campaign enrollments;
- communication history;
- quote records;
- assignments;
- pipeline stages;
- consent;
- suppression;
- and audit-relevant CRM activity.

Twenty remains an independently deployable application integrated through APIs, webhooks, MCP adapters, and Nyra service boundaries.

## 2.5 Nyra AI Mortgage Assistant

Nyra is the AI assistant and operator layer that helps Ellis and authorized users understand, prioritize, draft, calculate, retrieve, coordinate, and act.

Nyra is not the CRM and is not allowed to bypass deterministic services, compliance checks, approvals, or audit boundaries.

## 2.6 Project Apotheosis Relationship

Project Apotheosis may influence Project Nyra’s visual identity, symbolic geometry, recursion motifs, observer-system language, and AI ethics.

Project Nyra must remain commercially understandable as mortgage technology. Metaphysical or sacred-geometry elements may enrich the brand but must never obscure the product or reduce borrower trust.

---

# 3. Product Thesis

Mortgage brokers often operate through a disjointed stack of:

- lead-vendor portals;
- email inboxes;
- spreadsheets;
- CRM records;
- phone systems;
- text platforms;
- voicemail tools;
- lender portals;
- quoting worksheets;
- calendars;
- note systems;
- workflow automations;
- and personal memory.

This fragmentation creates predictable losses:

- leads wait too long for a response;
- follow-up stops after a few attempts;
- duplicate leads are worked inconsistently;
- borrower replies are missed;
- opt-outs are not synchronized everywhere;
- quote assumptions become inconsistent;
- campaign state is invisible;
- important context remains trapped in messages;
- AI tools lack business context;
- and brokers spend time copying data instead of closing loans.

Project Nyra solves this by creating one broker-owned operating layer spanning lead arrival through funded-loan follow-up.

The core loop is:

```text
INGEST
  -> NORMALIZE
  -> DEDUPLICATE
  -> VERIFY CONSENT
  -> WRITE TO TWENTY CRM
  -> SCORE AND ASSIGN
  -> ENROLL IN COMPLIANT CAMPAIGN
  -> CONTACT
  -> DETECT RESPONSE
  -> PAUSE OR TERMINATE AUTOMATION
  -> GATHER QUALIFYING DATA
  -> GENERATE DETERMINISTIC QUOTE SCENARIOS
  -> REQUIRE BROKER REVIEW
  -> PRESENT OR SEND
  -> TRACK APPLICATION AND PIPELINE
  -> LEARN FROM OUTCOMES
  -> RETAIN THE CLIENT RELATIONSHIP
```

---

# 4. North-Star Outcomes

Project Nyra should produce measurable improvements in:

## Revenue

- more contacted leads;
- more conversations;
- more completed applications;
- more quoted borrowers;
- higher lead-to-funded conversion;
- improved retention and repeat/referral business;
- and the ability to support more originators without proportional overhead.

## Speed

- near-immediate lead ingestion;
- sub-minute internal visibility;
- rapid first-touch initiation when consent and quiet-hour rules permit;
- faster quote preparation;
- and faster broker awareness of replies and high-intent leads.

## Reliability

- no silent lead loss;
- no duplicated campaign state;
- no untracked quote mutation;
- no unrestricted AI writes;
- no public worker inference endpoint;
- no single undocumented workflow acting as the entire business brain.

## Compliance

- consent evidence stored with source and timestamp;
- STOP, unsubscribe, DNC, and reply handling enforced in code;
- quiet-hour controls;
- channel-specific suppression;
- broker approval where required;
- immutable or append-oriented audit events;
- and defensible communication history.

## Ownership

- self-hosted or broker-controlled infrastructure where economically rational;
- local/private model inference for sensitive workflows;
- portable data;
- replaceable providers;
- centralized routing policy;
- and avoidance of a single opaque SaaS dependency controlling the entire business.

---

# 5. Primary Users

## 5.1 Ellis / Producing Branch Manager

Needs:

- an immediate view of hot leads;
- clear next actions;
- fast borrower context;
- reliable quote comparisons;
- minimal administrative friction;
- visibility into automations;
- and the ability to supervise AI without micromanaging it.

## 5.2 Loan Officers and Team Members

Need:

- assigned lead queues;
- communication history;
- compliant messaging;
- campaign state;
- quote requests;
- document needs;
- task queues;
- and simple escalation to a manager.

## 5.3 Operations and Administrative Users

Need:

- data quality tools;
- pipeline tracking;
- integration health;
- audit logs;
- document status;
- exception queues;
- and controlled bulk operations.

## 5.4 Borrowers and Referral Partners

Need:

- a credible public experience;
- clear human contact;
- fast response;
- simple intake;
- transparent consent;
- understandable quote explanations;
- and a reliable handoff to a licensed professional.

## 5.5 AI and Coding Agents

Need:

- clear product boundaries;
- explicit service contracts;
- authoritative data ownership;
- safe tool scopes;
- testable acceptance criteria;
- and current architecture context.

---

# 6. RateHunter.net — Borrower-Facing Landing Experience

## 6.1 Mission

RateHunter converts public attention into qualified mortgage conversations.

The borrower should understand within ten seconds:

1. Ellis is an independent mortgage broker.
2. Ellis can compare multiple lender options rather than offer one bank’s product set.
3. Technology improves speed and comparison but does not replace licensed judgment.
4. Any displayed rate or payment example is illustrative unless a live, compliant quoting integration says otherwise.
5. Starting is simple.

## 6.2 Brand Position

RateHunter should feel:

- personal;
- sharp;
- premium;
- trustworthy;
- technically capable;
- direct;
- and human.

It should not feel like:

- a generic bank;
- a crypto website;
- a debt-settlement funnel;
- an experimental AI lab;
- Project Nyra’s internal dashboard;
- or an enterprise software product page.

## 6.3 Current Supplied Broker Identity

The repository may contain current brand values such as:

- **Broker:** Ellis Andersen
- **Role:** Branch Manager, West Capital Lending
- **NMLS:** `1912260`
- **DRE:** `02196940`
- **Phone:** `(949) 378-3133`
- **Email:** `eandersen@westcaplending.com`
- **Office:** `202 Fashion Ln Suite #223, Tustin, CA 92780`

These values must be verified before production deployment. Agents must not invent, silently alter, or remove regulated disclosures.

## 6.4 Core Message

Primary positioning:

> **Your Rate. Hunted Down. Not Settled For.**

Supporting concepts:

- one broker with access to many lender options;
- AI-assisted comparison with human broker judgment;
- purchase, refinance, cash-out, HELOC/HELOAN, commercial, and hard-money inquiry paths;
- direct access to Ellis;
- no implication that an illustrative preview is a locked rate or commitment.

## 6.5 Page Structure

A strong RateHunter landing page contains:

1. **Hero**
   - Ellis identity;
   - broker value proposition;
   - primary call-to-action;
   - call or schedule option;
   - concise credibility language.

2. **Broker Advantage**
   - independent broker versus single-bank channel;
   - lender-access explanation;
   - process transparency.

3. **Illustrative Comparison**
   - sample comparison cards;
   - “sample,” “illustrative,” or “not a commitment” labels;
   - clear assumptions.

4. **Lead Capture Wizard**
   - loan purpose;
   - estimated loan amount;
   - property state;
   - purchase price or property value;
   - credit range;
   - occupancy;
   - contact details;
   - consent checkboxes;
   - source and UTM metadata.

5. **Services**
   - purchase;
   - rate-and-term refinance;
   - cash-out;
   - HELOC/HELOAN;
   - commercial;
   - hard money or non-QM where appropriate.

6. **About Ellis**
   - experience;
   - independent-broker advantage;
   - personal service.

7. **Trust and Compliance**
   - licensing;
   - Equal Housing or required marks;
   - privacy;
   - consent language;
   - disclosures;
   - no invented testimonials or lender claims.

8. **Final CTA**
   - start inquiry;
   - schedule;
   - call;
   - or request a review.

## 6.6 RateHunter 3D and Motion Direction

RateHunter may be cinematic, but its motion must support trust and conversion.

Recommended direction:

- a dark premium environment;
- soft indigo, violet, cyan, and mint light;
- restrained 3D rate-comparison objects;
- lender-option cards orbiting or resolving into a broker-selected path;
- subtle “search/hunt” visual metaphors;
- light rays, aurora haze, and a minimal star or grid field;
- scroll-linked process indicators;
- a polished 3D broker-desk or mortgage-comparison visualization;
- no aggressive glitch overload;
- no intimidating infrastructure diagrams;
- no mascot domination;
- no mandatory intro animation.

Performance rules:

- normal scrolling always works;
- reduced-motion is respected;
- 3D is lazy-loaded;
- static fallbacks exist;
- forms remain readable;
- mobile simplifies to static or lightweight motion;
- the page must still convert when WebGL fails.

## 6.7 Lead Handoff Contract

RateHunter browser code must submit only to a safe public ingestion endpoint.

The public page must never contain:

- CRM API keys;
- Twenty credentials;
- Infisical tokens;
- internal hostnames;
- Tailscale addresses;
- private LiteLLM keys;
- Twilio auth tokens;
- SendGrid keys;
- direct database credentials.

A lead submission should create an immutable intake event containing:

- source;
- campaign/UTM values;
- submitted data;
- channel consent;
- consent text version;
- timestamp;
- IP or request metadata when legally and operationally appropriate;
- user-agent metadata;
- idempotency key;
- correlation/audit ID.

The backend then normalizes, deduplicates, validates, and writes through controlled service boundaries.

---

# 7. ProjectNyra.com — Cinematic Product Landing Page

## 7.1 Mission

ProjectNyra.com explains and sells the platform to brokers and operators.

It should communicate:

> Project Nyra turns fragmented mortgage operations into one auditable, broker-owned system for leads, CRM, campaigns, quotes, AI assistance, memory, and private inference.

Primary tagline:

> **The Stack That Never Sleeps.**

Technical shorthand:

> **INGEST → SYNC → DRIP → QUOTE → CLOSE**

## 7.2 Visual Identity

The Project Nyra product site may be more dramatic than RateHunter.

Core visual direction:

- cyberpunk mortgage command deck;
- deep black and violet void;
- cyan, turquoise, seafoam, purple, and Nyra-pink accents;
- premium glass surfaces;
- controlled sacred geometry;
- low-opacity routing patterns;
- pixel starfield;
- aurora haze;
- dimensional lighting;
- animated beams representing data movement;
- premium 3D product objects;
- high-end motion without reducing readability.

The site must not become:

- a generic blue SaaS template;
- an anime fan page;
- a passive short film;
- a fake live-rates page;
- or a 100 MB WebGL demo with no clear product story.

## 7.3 The Nyra Core Story

The main 3D visual guide is **Nyra Core**: a glowing pink-purple amorphous orb with cyan and seafoam rim light.

Nyra Core acts as a product-story device.

Suggested sequence:

1. The visitor enters a dark void.
2. Cursor light reveals `PROJECT NYRA`.
3. The hero immediately presents product value and calls to action.
4. Scrolling triggers “System Awake.”
5. Nyra Core forms from particles.
6. The orb activates lead intake.
7. An eye appears as Twenty CRM synchronization activates.
8. Additional features appear as campaigns, compliance, and quote systems activate.
9. STOP/DNC visibly halts an animated data beam.
10. Quote cards fan out as deterministic decision objects.
11. A dimensional rift opens into an integration orbit.
12. The final scene reveals an operational command room and final CTA.

The mascot version of Nyra may appear as a guide or signature moment, but the product remains the hero.

## 7.4 Recommended Sections

1. Hero / System Awake
2. Mirrored Project Nyra brand moment
3. Nyra Core activation
4. Lead-to-loan machine
5. Feature bento grid
6. Twenty CRM synchronization
7. Campaign and compliance engine
8. Deterministic quote engine
9. Nyra/OpenClaw/Hermes assistant terminal
10. AI routing and private inference
11. Integration orbit
12. Owned infrastructure
13. Dimensional ops room
14. Early-access / demo CTA
15. Legal and disclosure footer

## 7.5 Product Claims

The site may claim capabilities only when they are supported by current implementation or clearly labeled as:

- target architecture;
- active development;
- prototype;
- planned;
- sample;
- or demo.

Do not present:

- sample rates as live;
- mock metrics as production metrics;
- an untested integration as operational;
- or an autonomous action as approved when a human gate is required.

## 7.6 Calls to Action

Recommended CTAs:

- Request Early Access
- Explore the Stack
- View Technical Architecture
- Watch Product Walkthrough
- Open Demo
- View GitHub

---

# 8. The Authenticated Project Nyra Web Application

## 8.1 Mission

The authenticated web application is the operational cockpit.

It should answer:

1. Which leads need action?
2. Which borrowers replied?
3. Which campaigns are active, paused, blocked, completed, or failed?
4. Which records are blocked by compliance?
5. Which quotes are ready for review?
6. Which documents are missing?
7. Which integrations are degraded?
8. What did Nyra or another agent do?
9. What requires human approval?
10. What is the next highest-value action?

## 8.2 Design Direction

The webapp should be a **mint-midnight broker command deck**:

- dark;
- dense;
- fast;
- readable;
- state-driven;
- professional;
- and operational.

Think:

- Bloomberg terminal;
- mortgage CRM;
- mission-control dashboard;
- modern command palette;
- compact data views;
- restrained premium effects.

Do not place heavy cinematic backgrounds behind:

- borrower PII;
- quote calculations;
- forms;
- compliance controls;
- tables;
- or document views.

Motion should communicate:

- routing;
- state change;
- activity;
- sequencing;
- health;
- or urgency.

## 8.3 Application Shell

Recommended shell:

```text
Health Rail
  -> Global service/model/integration status

Nested Sidebar
  -> Command
  -> Communications
  -> AI / Operations
  -> Settings

Top Bar
  -> Breadcrumbs
  -> Search / Command palette
  -> Alerts
  -> Active user
  -> Environment indicator

Route Action Bar
  -> Context-specific filters, create actions, approvals

Main Workspace
  -> Tables
  -> Cards
  -> Timelines
  -> Drawers
  -> Editors
  -> Detail rooms
```

## 8.4 Core Routes

### `/overview`

Shows:

- new leads;
- hot leads;
- needs-reply queue;
- quote-ready queue;
- campaign exceptions;
- compliance blocks;
- upcoming tasks;
- pipeline summary;
- integration health;
- worker/model status.

### `/leads`

Provides:

- sortable/filterable lead table;
- source;
- loan purpose;
- contact state;
- score;
- assigned owner;
- campaign status;
- reply status;
- quote readiness;
- compliance badge;
- last touch;
- next action.

### `/leads/[id]`

The lead “deal room” contains:

- borrower profile;
- property and loan context;
- timeline;
- communication history;
- consent evidence;
- suppression state;
- campaign state;
- quotes;
- documents;
- tasks;
- AI summary;
- recommended actions;
- approval controls;
- audit trail.

### `/communications`

Inbox-style triage:

- all messages;
- needs reply;
- positive intent;
- quote requests;
- documents needed;
- STOP/DNC;
- voicemail/call events;
- archived.

The interface should unify message context without pretending all providers use the same transport semantics.

### `/campaigns`

Shows:

- campaign definitions;
- active enrollments;
- completion rates;
- response rates;
- channel performance;
- failed steps;
- blocked sends;
- version history.

### `/campaigns/builder`

A native campaign builder with:

- steps;
- offsets;
- channels;
- templates;
- conditions;
- branching;
- quiet hours;
- consent requirements;
- reply-pause logic;
- STOP/DNC gates;
- test mode;
- preview;
- versioning;
- publish approval.

Business state must exist outside the visual workflow engine.

### `/quotes`

The quote desk contains:

- borrower assumptions;
- loan amount;
- property value;
- credit range;
- occupancy;
- purpose;
- term;
- fees;
- taxes/insurance assumptions;
- product eligibility;
- lender/rate source timestamp;
- scenario comparisons;
- payment;
- cash to close;
- APR where available;
- break-even;
- warnings;
- broker notes;
- approval state;
- delivery state.

### `/pipeline`

Provides:

- Kanban and table modes;
- stages;
- owner assignment;
- aging;
- stuck-loan indicators;
- exception queues;
- funded/lost reasons;
- task overlays.

### `/assistant`

Nyra assistant workspace:

- chat;
- selected lead context;
- source citations;
- proposed actions;
- required approvals;
- tool-call history;
- memory scope;
- agent identity;
- model route;
- cost/latency telemetry where appropriate.

### `/agents`

Shows:

- Hermes;
- LLxprt;
- OpenHarness;
- coding agents;
- A2A status;
- active tasks;
- queues;
- concurrency;
- tool scopes;
- worker placement;
- recent failures.

### `/integrations`

Shows:

- Twenty CRM;
- Twilio;
- SendGrid;
- Google Workspace;
- LeadMailbox;
- lead vendors;
- Supabase;
- Activepieces;
- n8n;
- LiteLLM;
- Nexus;
- OpenClaw;
- Infisical;
- Cloudflare;
- Tailscale;
- model workers.

The app may link to external admin tools but must not expose secrets or raw privileged endpoints.

### `/memory`

Shows:

- assistant memory records;
- namespaces;
- retention;
- entity memory;
- pending consolidation;
- rejected memory;
- provenance;
- deletion controls;
- policy locks.

### `/settings`

Contains:

- users;
- roles;
- sender identities;
- compliance;
- quiet hours;
- branding;
- consent language versions;
- model policy;
- budget limits;
- integration configuration;
- audit export;
- data retention.

## 8.5 Truth-State Language

Every data surface should distinguish:

- `live`
- `cached`
- `mock`
- `manual`
- `degraded`
- `blocked`
- `offline`

Mock data must never look live.

---

# 9. Twenty CRM — System of Record

## 9.1 Role

Twenty CRM is the durable operational authority for customer and mortgage workflow records.

Project Nyra may mirror data for read optimization, search, analytics, or AI context, but it must not create conflicting authorities.

## 9.2 Mutation Boundary

The preferred write path is:

```text
Webapp / Assistant / Workflow / Integration
  -> authenticated Nyra service
  -> authorization
  -> validation
  -> compliance check
  -> idempotency check
  -> CRM API
  -> Twenty CRM
  -> audit event
  -> downstream event
```

Agents should not directly mutate Twenty through an unrestricted generic tool.

Use purpose-built operations such as:

- create normalized lead;
- update contact details;
- assign owner;
- transition stage;
- enroll campaign;
- pause campaign;
- store quote;
- log communication;
- set suppression;
- append consent evidence.

## 9.3 Core CRM Entities

### Person / Contact

Contains:

- name;
- email;
- phone;
- address;
- preferred channel;
- communication consent;
- consent timestamp;
- consent source;
- consent text version;
- DNC state;
- lead score;
- source;
- assigned broker;
- relationship history.

### Company

Used for:

- referral partners;
- real-estate companies;
- employers where appropriate;
- vendors;
- business-purpose borrowers;
- commercial counterparties.

### Mortgage Lead

Recommended fields:

- source;
- source lead ID;
- intake event ID;
- person relation;
- loan purpose;
- requested amount;
- property value;
- purchase price;
- property state;
- occupancy;
- credit range;
- income range or verified income state;
- stage;
- assigned owner;
- score;
- campaign relation;
- campaign state;
- response state;
- quote readiness;
- compliance status;
- last contact;
- next action;
- created and updated timestamps.

Loan-purpose values may include:

- purchase;
- refinance rate/term;
- refinance cash-out;
- HELOC;
- HELOAN;
- reverse mortgage;
- commercial;
- hard money;
- non-QM;
- other.

### Loan Opportunity / Application

Tracks:

- borrower;
- co-borrower;
- loan purpose;
- loan program;
- property;
- requested amount;
- proposed amount;
- stage;
- assigned team;
- lender;
- milestones;
- conditions;
- application status;
- funded state;
- lost reason.

Suggested operational stages:

```text
Inquiry
-> Contacted
-> Pre-Qualification
-> Pre-Approval
-> Application
-> Processing
-> Underwriting
-> Conditional Approval
-> Clear to Close
-> Funded
-> Closed / Retained
```

### Campaign

Contains:

- name;
- purpose;
- version;
- audience;
- steps;
- channels;
- timing;
- compliance rules;
- active state;
- author;
- approval state.

### Campaign Enrollment

Contains:

- lead;
- campaign version;
- start time;
- current step;
- next step;
- state;
- pause reason;
- reply state;
- suppression reason;
- completion reason;
- channel eligibility.

### Communication Log

Contains:

- lead/person;
- direction;
- channel;
- provider;
- provider message ID;
- campaign step;
- template version;
- timestamp;
- status;
- reply classification;
- content hash or redacted body;
- audit ID;
- failure reason.

### Quote

Contains:

- lead/application;
- assumptions;
- rate source;
- source timestamp;
- scenario type;
- loan program;
- interest rate;
- APR where valid;
- payment;
- fees;
- cash to close;
- break-even;
- warnings;
- generation version;
- status;
- broker approval;
- sent/viewed/accepted timestamps.

### Consent Evidence

Contains:

- person;
- channel;
- granted/withdrawn state;
- timestamp;
- source;
- form or script version;
- request metadata;
- proof location;
- audit ID.

### Suppression / DNC

Contains:

- person/contact method;
- channel;
- reason;
- keyword or event;
- source;
- effective timestamp;
- scope;
- expiration if legally permitted;
- audit trail.

## 9.4 Twenty UI Boundary

Twenty’s native UI remains useful for:

- CRM administration;
- schema administration;
- raw record inspection;
- bulk operations;
- and fallback workflows.

The Project Nyra app provides a mortgage-specific operational experience and may deep-link into Twenty.

Do not fork Twenty’s entire frontend into Project Nyra unless there is a justified long-term maintenance strategy.

---

# 10. Lead Ingestion and Normalization

## 10.1 Sources

Potential sources include:

- RateHunter forms;
- LeadMailbox API;
- LendingTree;
- FreeRateUpdate;
- LowerMyBills;
- email lead notifications;
- manual entry;
- referrals;
- webhooks;
- imported CSV;
- Google Workspace or Outlook inbox parsing;
- future lender or partner APIs.

## 10.2 Canonical Intake Pipeline

```text
Receive
-> Authenticate or validate source
-> Assign correlation ID
-> Preserve raw payload
-> Normalize fields
-> Normalize phone and email
-> Map loan purpose
-> Validate required data
-> Resolve consent
-> Deduplicate
-> Enrich
-> Score
-> Write to Twenty
-> Emit event
-> Determine campaign eligibility
-> Determine quote readiness
-> Notify assigned broker
```

## 10.3 Deduplication

Deduplication should use deterministic rules first:

- source lead ID;
- normalized email;
- normalized phone;
- person identity;
- property address;
- recent inquiry window.

Fuzzy or semantic matching may assist, but it must not silently merge records.

Ambiguous merges go to a review queue.

## 10.4 Raw Payload Preservation

Keep the original intake payload in a secure, access-controlled store for:

- debugging;
- vendor disputes;
- consent evidence;
- field-mapping changes;
- and replay.

Do not place sensitive raw payloads in normal application logs.

## 10.5 Idempotency

Every ingestion boundary should support idempotency.

Repeated vendor delivery must not create duplicate people, leads, campaign enrollments, or messages.

---

# 11. Campaign Automation

## 11.1 Purpose

The campaign system maintains consistent follow-up across the period in which a borrower may convert.

Campaigns may span:

- immediate outreach;
- 5-day high-intensity follow-up;
- 30-day purchase sequences;
- 45–60-day refinance or HELOC nurturing;
- long-term database retention;
- post-close follow-up;
- annual mortgage review;
- referral-partner nurture.

## 11.2 Channels

- SMS;
- email;
- voice call;
- prerecorded or generated voicemail where legally permitted;
- internal task;
- push/in-app notification;
- future social or messaging channels only after explicit approval.

## 11.3 Architectural Rule

n8n and Activepieces may execute workflows, schedules, connectors, and retries.

They must not be the only location where business truth exists.

Nyra domain services own:

- campaign definitions;
- enrollment state;
- compliance eligibility;
- step state;
- pause/terminate decisions;
- and audit history.

## 11.4 Reply Handling

A borrower response should normally pause automated outreach until classified.

STOP, UNSUBSCRIBE, CANCEL, END, QUIT, or equivalent opt-out language must trigger immediate suppression according to channel and legal requirements.

Other replies should:

1. create a communication event;
2. pause future automated touches;
3. classify intent;
4. notify the assigned broker;
5. create a response task;
6. require deliberate re-enrollment if automation resumes.

## 11.5 Quiet Hours

Quiet hours must be configurable by:

- recipient timezone;
- state or jurisdiction;
- channel;
- campaign;
- business policy.

Eligibility must be checked at execution time, not only enrollment time.

## 11.6 Campaign Versioning

Published campaigns are immutable versions.

Editing a campaign creates a new version.

Existing enrollments remain on their assigned version unless an explicit migration occurs.

## 11.7 Templates

Templates require:

- channel;
- purpose;
- version;
- consent assumptions;
- merge variables;
- fallback behavior;
- compliance footer;
- approval status;
- test rendering.

AI may draft or personalize within policy, but cannot remove required language or invent borrower facts.

---

# 12. Communications Layer

## 12.1 Providers

Likely providers include:

- Twilio for voice and SMS;
- SendGrid or approved email provider;
- Google Workspace for monitored inboxes;
- calendar/scheduling provider;
- future telephony providers through adapters.

## 12.2 Communication Service

A central communication service should provide:

- send preview;
- authorization;
- consent check;
- suppression check;
- quiet-hour check;
- template rendering;
- provider routing;
- idempotency;
- status tracking;
- webhook verification;
- retry policy;
- audit logging.

## 12.3 Human Approval

High-risk or borrower-facing AI-generated communications may require:

- preview;
- broker approval;
- or a pre-approved constrained template class.

The system should support policy tiers:

- deterministic transactional;
- pre-approved campaign template;
- AI-personalized within strict bounds;
- broker-review required;
- prohibited.

---

# 13. Deterministic Quote Engine

## 13.1 Purpose

The quote engine creates consistent, explainable mortgage scenarios from validated assumptions.

It is not an LLM calculator.

LLMs may:

- collect missing assumptions;
- explain results;
- compare scenarios;
- draft borrower-friendly language;
- identify missing data;
- or call the quote service.

The actual calculations must be deterministic and testable.

## 13.2 Core Inputs

- loan purpose;
- loan amount;
- purchase price;
- property value;
- occupancy;
- property type;
- state;
- credit range or score;
- term;
- down payment;
- income/debt information where relevant;
- taxes;
- insurance;
- HOA;
- mortgage insurance;
- points;
- lender fees;
- third-party fees;
- rate source and timestamp;
- program constraints.

## 13.3 Core Outputs

- principal and interest;
- estimated total payment;
- cash to close;
- loan-to-value;
- combined loan-to-value;
- APR when valid;
- points/credits;
- fee summary;
- break-even;
- savings comparison;
- amortization data;
- warnings;
- assumptions;
- scenario provenance;
- expiration or freshness state.

## 13.4 Three-Scenario Pattern

A useful default presentation is:

1. **Lowest Payment**
2. **Balanced Recommendation**
3. **Lowest Cost / Faster Break-Even**

The “balanced recommendation” must not imply fiduciary or suitability conclusions beyond the available facts.

## 13.5 Broker Approval

No borrower-facing quote should be sent merely because an LLM requested it.

Quote lifecycle:

```text
Draft
-> Calculated
-> Validated
-> Broker Review
-> Approved
-> Sent
-> Viewed
-> Accepted / Rejected / Expired
```

## 13.6 Testing

Quote calculations require:

- unit tests;
- golden-file fixtures;
- spreadsheet or known-calculator parity where applicable;
- rounding tests;
- edge cases;
- date/freshness tests;
- program-eligibility tests;
- regression snapshots.

---

# 14. Nyra AI Mortgage Assistant

## 14.1 Identity

Nyra is a highly capable AI mortgage operations assistant.

She should feel:

- fast;
- precise;
- proactive;
- technically sophisticated;
- loyal to the operator’s goals;
- and aware of business context.

Nyra must remain:

- honest;
- auditable;
- approval-aware;
- compliance-aware;
- and bounded by tool permissions.

## 14.2 Main Roles

### Broker Copilot

- summarize lead context;
- identify high-value next actions;
- prepare call briefs;
- draft follow-up;
- retrieve relevant records;
- surface exceptions;
- help manage pipeline.

### Lead Intelligence

- classify intent;
- score urgency;
- detect likely loan purpose;
- identify missing information;
- detect duplicates;
- identify stale or neglected leads;
- summarize vendor payloads.

### Communication Assistant

- draft SMS and email;
- produce call scripts;
- summarize threads;
- classify replies;
- generate broker-reviewable follow-up;
- select an approved template.

### Quote Assistant

- collect assumptions;
- call deterministic quote services;
- compare scenarios;
- explain tradeoffs;
- identify stale rate data;
- prepare a broker review packet.

### Document and Knowledge Assistant

- find policy and process documentation;
- summarize uploaded documents;
- extract structured information;
- identify missing documents;
- connect borrower context to operational procedures.

### Operations Assistant

- inspect service health;
- identify failed workflows;
- summarize alerts;
- propose remediation;
- run approved diagnostics;
- create engineering tasks.

### Development Assistant

Hermes and other coding agents may:

- inspect the repository;
- implement features;
- run tests;
- update documentation;
- open pull requests;
- and maintain infrastructure under scoped credentials.

## 14.3 Prohibited Direct Behavior

Nyra must not:

- approve a loan;
- promise approval;
- invent rates or lender terms;
- conceal required disclosures;
- bypass STOP/DNC;
- send unrestricted bulk communications;
- directly mutate production databases;
- expose borrower PII to public models without policy;
- expose secrets;
- execute destructive infrastructure changes without authorization;
- represent a sample quote as a commitment.

## 14.4 Tool Policy

Tools should be purpose-built and least-privileged.

Examples:

- `get_lead_summary`
- `list_needs_reply`
- `draft_follow_up`
- `propose_campaign_pause`
- `request_quote`
- `get_quote_scenarios`
- `create_broker_approval`
- `log_approved_communication`
- `set_channel_suppression`
- `get_pipeline_exceptions`
- `get_service_health`

Avoid generic tools such as unrestricted SQL, shell, filesystem, Docker, and CRM mutation for normal mortgage-assistant operation.

## 14.5 Approval Model

Every proposed action has a risk class.

### Read-Only

May execute automatically:

- retrieve;
- search;
- summarize;
- calculate through deterministic service;
- classify;
- diagnose.

### Low-Risk Controlled Write

May execute under policy:

- create internal task;
- append non-sensitive note;
- tag record;
- save draft.

### Human Approval Required

- send personalized borrower communication;
- change campaign state after a reply;
- publish campaign;
- send quote;
- update material loan assumptions;
- re-enable suppressed communication;
- change model-routing policy;
- change production infrastructure.

### Owner-Only

- secrets;
- billing;
- provider credentials;
- destructive deletes;
- broad exports;
- Cloudflare/Infisical administration;
- unrestricted agent permissions.

## 14.6 Hermes Runtime Role

The target role for Hermes is:

- always-on product-local assistant;
- hosted primarily on `worker-rtx3090ti`;
- exposed through a narrow authenticated A2A identity;
- connected to approved Nyra service tools;
- reachable through OpenClaw or the Project Nyra assistant UI;
- able to use central LiteLLM routing when local inference is insufficient;
- isolated from unrestricted infrastructure credentials;
- persistent enough for long-running operator context without becoming the universal authority for all system state.

Hermes is the product assistant, not the sole orchestrator of the whole platform.

## 14.7 OpenClaw Boundary

OpenClaw is the governed channel and remote-interaction boundary.

It may provide:

- chat UI;
- mobile/remote interaction;
- channel adapters;
- notifications;
- assistant session surface;
- approved tool invocation.

OpenClaw must not become an unrestricted superuser gateway.

---

# 15. AI Control Plane

## 15.1 Canonical Direction

The target machine-facing AI gateway is centralized **LiteLLM**.

LiteLLM should provide:

- one OpenAI-compatible model interface;
- provider abstraction;
- local model routes;
- cloud model routes;
- aliases;
- budgets;
- scoped virtual keys;
- fallbacks;
- rate limits;
- usage tracking;
- model access policy;
- MCP gateway functionality;
- A2A registration and routing where supported.

## 15.2 Nexus Router

Nexus Router remains a private downstream MCP aggregator during measured migration.

Target relationship:

```text
Agent / App / OpenClaw / Hermes
  -> LiteLLM Gateway
      -> model providers
      -> A2A agents
      -> LiteLLM MCP Gateway
          -> Nexus Router
              -> registered MCP servers
```

Nexus may continue to provide:

- tool discovery;
- fuzzy tool search;
- MCP aggregation;
- connection management;
- telemetry;
- caching;
- route policy;
- and a reduced tool surface.

Over time, compare direct LiteLLM MCP registration with Nexus.

Retain, narrow, or retire Nexus based on evidence—not fashion.

## 15.3 Provider Boundaries

### OpenRouter

OpenRouter is an explicit upstream provider route.

It must have:

- approved models;
- spend policy;
- fallback policy;
- data-handling policy;
- and no accidental unlimited paid fallback.

### OmniRoute

OmniRoute may serve as an optional private official-OAuth/provider broker behind LiteLLM.

Do not use questionable cookie theft, anti-detection, or unauthorized session-proxy behavior.

### Subscription CLI Agents

LLxprt Jefe, LLxprt Code, Codex CLI, Claude Code, Gemini CLI, Kimi CLI, Qwen CLI, and Cerebras-backed tools may be exposed through controlled adapters when allowed by their terms and authentication model.

They are primarily development/operator resources, not unrestricted production mortgage-runtime dependencies.

## 15.4 A2A

Agent-to-Agent interfaces should be:

- authenticated;
- scoped;
- observable;
- versioned;
- persisted where necessary;
- and narrow.

A2A 1.0 is the target standard.

Transitional adapters may exist, but agents should avoid hard-coding a deprecated protocol shape into product logic.

## 15.5 Optional NATS / JetStream

NATS JetStream may be used for:

- durable agent task queues;
- event distribution;
- worker coordination;
- and replay.

It is optional until a concrete need justifies the additional operational burden.

## 15.6 No Per-Worker Gateway Duplication

Workers should expose model or agent endpoints.

They should not each run independent, conflicting LiteLLM policy layers unless explicitly required.

Central governance belongs on the orchestrator.

---

# 16. Distributed Infrastructure

## 16.1 Operating Model

Project Nyra uses a split control-plane / compute-plane architecture.

```text
Public Internet
  -> Cloudflare DNS
  -> Cloudflare Pages or Cloudflare Tunnel
  -> Cloudflare Access for protected surfaces
  -> Orchestrator and/or Oracle durable services

Private East-West Network
  -> Tailscale mesh
  -> MagicDNS hostnames
  -> orchestrator
  -> GPU workers
  -> Oracle VPS
  -> approved auxiliary devices
```

No raw GPU model endpoint should be public.

## 16.2 Orchestrator

The orchestrator is the local control plane.

Target responsibilities:

- central LiteLLM;
- LiteLLM database;
- Nexus Router;
- MCP gateway;
- A2A registry/adapters;
- optional NATS;
- OpenClaw gateway/studio;
- local operator cockpit;
- observability;
- Portainer;
- workflow engines where appropriate;
- local service routing;
- Cloudflared where local public ingress is needed;
- Postgres/Redis services selected for local control-plane functions;
- backup coordination;
- worker health supervision.

Environment:

- Windows 11 host;
- WSL2;
- Docker Desktop;
- Tailscale;
- developer files primarily in Ubuntu/WSL2;
- WaveTerm/Zellij/tmux-style operator cockpit.

## 16.3 `worker-rtx3090ti`

Primary production-local assistant worker.

Target responsibilities:

- always-on Hermes runtime;
- product-local inference;
- secondary or steady vLLM/Ollama workloads;
- A2A adapter;
- approved background reasoning;
- private inference for operational tasks.

This worker should be optimized for:

- uptime;
- predictable model loading;
- conservative concurrency;
- monitored VRAM;
- controlled tool access.

## 16.4 `worker-rtx5090`

Primary interactive development and heavy-reasoning worker.

Target responsibilities:

- large local models;
- vLLM;
- Codex/Claude/LLxprt/OpenHarness workflows;
- Omnigent or similar development surfaces;
- complex code and architecture work;
- burst workloads;
- high-performance experimentation.

Do not assume 32 GB or 48 GB VRAM. The known target is a 24 GB RTX 5090 unless actual hardware inspection proves otherwise.

Utility GPU and memory-processing worker.

Target responsibilities:

- embeddings;
- reranking;
- extraction;
- OCR only where necessary;
- speech utilities;
- small models;
- memory consolidation;
- background ingestion;
- lightweight inference.

It should not be overloaded with primary interactive reasoning.

## 16.6 Oracle VPS

The Oracle VPS is the durable cloud plane.

Depending on the verified deployment, it may host:

- public webhook receiver;
- Supabase;
- Postgres;
- Redis;
- Twenty CRM;
- CRM API;
- campaign services;
- quote services;
- n8n;
- Activepieces;
- Gitea;
- durable memory components;
- Cloudflared;
- reverse proxy;
- backup and monitoring helpers.

Target architecture should avoid unclear duplication between Oracle and the orchestrator.

Each service must have an explicit declared home:

- authoritative host;
- standby host;
- development host;
- or deprecated host.

Transitional deployments may remain until migration is tested.

## 16.7 Home Assistant Green

Home Assistant Green is an auxiliary automation and IoT hub.

It is not the primary cluster manager.

It may:

- trigger approved household or office events;
- report device state;
- receive selected Nyra notifications;
- interact through MQTT/webhooks;
- and participate in future Project Apotheosis voice/vision work.

## 16.8 Portainer and Docker Contexts

Portainer may provide visual container operations.

Docker Contexts may provide command-line control across hosts.

Neither is a product UI.

Changes must respect host-scoped compose boundaries.

---

## 16.9 Target Service Placement Matrix

The following matrix describes the preferred target ownership. The repository and live hosts must be inspected because transitional duplicates may still exist.

| Capability                     | Authoritative target                                           | Secondary/transition                        | Exposure                           |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| LiteLLM gateway and policy     | Orchestrator                                                   | Existing Oracle deployment during migration | Private or Access-gated API        |
| LiteLLM database               | Orchestrator Postgres                                          | Managed/durable backup                      | Private                            |
| Nexus Router                   | Orchestrator behind LiteLLM                                    | Oracle legacy deployment                    | Private                            |
| Hermes                         | `worker-rtx3090ti`                                             | Central LiteLLM cloud/local fallback        | A2A private                        |
| Heavy coding/reasoning         | `worker-rtx5090`                                               | Cloud coding agents                         | Private                            |
| Embeddings/extraction          | ``                                                             | 3090 Ti when idle                           | Private                            |
| Twenty CRM                     | Oracle durable plane or explicitly selected authoritative host | Orchestrator development instance           | Access-gated                       |
| Supabase                       | Oracle durable plane                                           | Managed Supabase only by explicit decision  | Public API with RLS; admin private |
| CRM API                        | Oracle durable plane                                           | Orchestrator development                    | Authenticated                      |
| Lead ingestion/webhooks        | Oracle durable plane                                           | Cloudflare Worker/Pages Function adapter    | Public hardened boundary           |
| Campaign/compliance services   | Oracle durable plane                                           | Orchestrator development                    | Private/authenticated              |
| Quote engine/API               | Oracle durable plane or selected deterministic service host    | Orchestrator development                    | Authenticated                      |
| n8n/Activepieces               | Oracle durable plane                                           | Orchestrator development                    | Access-gated                       |
| OpenClaw gateway               | Orchestrator                                                   | Oracle relay only if required               | Authenticated/Access-gated         |
| Prometheus/Loki/Grafana        | Orchestrator                                                   | Oracle offsite checks                       | Private/Access-gated               |
| Cloudflare Pages               | Cloudflare                                                     | —                                           | Public                             |
| Cloudflare Tunnel              | Orchestrator and Oracle only where each has origin services    | —                                           | Public ingress agent               |
| Redis/Postgres/FalkorDB/Qdrant | Declared service owner                                         | Replicas/backups only                       | Private                            |

A service may run elsewhere for development, but one location must be declared authoritative for production writes.

## 16.10 Deployment Modes

Project Nyra supports explicit deployment modes.

### Local Development

- applications run through pnpm/Turborepo;
- service dependencies may run in Docker;
- mock data is visibly labeled;
- production writes are disabled unless an explicit development environment is selected;
- private endpoints use Tailscale or localhost;
- secrets come from a development Infisical environment.

### Staging

- separate database/schema or project;
- separate Twilio/SendGrid test configuration;
- separate LiteLLM keys and budgets;
- Cloudflare Access required;
- synthetic leads only;
- no production borrower communication;
- deployment and rollback tested.

### Production

- production Infisical environment;
- least-privileged service identities;
- approved domains;
- real backup policy;
- required health checks;
- alert routing;
- audit retention;
- approved communication policy;
- no mock providers;
- no debug endpoints;
- no default passwords.

## 16.11 Backup and Disaster Recovery

Project Nyra must be recoverable from more than Git.

### Required Backups

- Twenty CRM/Postgres;
- Supabase/Postgres;
- campaign definitions and versions;
- quote records;
- consent and suppression records;
- audit events;
- workflow definitions;
- Infisical configuration metadata, without insecure plaintext exports;
- Grafana dashboards and alert rules;
- Gitea repositories and configuration;
- object/document storage;
- critical Docker volumes;
- domain/tunnel configuration documentation.

### Backup Rules

- encrypt backups;
- keep at least one off-host copy;
- test restore, not only backup creation;
- record retention and deletion policy;
- avoid backing up transient caches as if they are authoritative;
- document recovery point objective and recovery time objective;
- include schema migrations with application releases;
- do not use Syncthing alone as a database backup mechanism.

### Failure Scenarios

Runbooks should cover:

- orchestrator failure;
- Oracle VPS failure;
- worker failure;
- database corruption;
- accidental deletion;
- Infisical outage;
- Cloudflare outage;
- Tailscale outage;
- Twilio/SendGrid outage;
- model-provider outage;
- compromised agent key;
- broken campaign deployment.

The platform should degrade safely. A routing outage must not cause uncontrolled paid fallback or unauthorized communication.

## 16.12 CI/CD and Release Governance

GitHub Actions is the primary CI/CD and review surface.

Expected validation includes:

```text
format
lint
typecheck
unit tests
contract tests
quote golden tests
compliance tests
build
Docker build
Compose render
secret scan
dependency audit
migration validation
Pages build
smoke tests
```

Release rules:

1. Validate the exact commit being deployed.
2. Do not merge merely because earlier checks passed on an older head.
3. Keep RateHunter, Project Nyra landing, and Project Nyra app deployment contracts separate.
4. Verify Cloudflare Pages project names, roots, output directories, environment variables, and custom domains.
5. Verify Docker build contexts against monorepo paths.
6. Require secret scanning.
7. Keep generated runtime/session state out of source control unless deliberately reviewed.
8. Prefer small PRs by product or infrastructure boundary.
9. Broad synchronization PRs require follow-up decomposition and validation.
10. Record deployment evidence and rollback instructions.

Preferred deployment flow:

```text
feature branch
-> scoped tests
-> pull request
-> review
-> exact-head required checks
-> merge
-> staging deployment
-> smoke tests
-> production promotion
-> post-deploy health and business checks
```

---

# 17. Repository and Deployment Structure

The exact repository must be inspected before edits, but the intended logical structure is:

```text
Project-Nyra/
├── apps/
│   ├── ratehunter/                  # ratehunter.net borrower landing
│   ├── projectnyra-landing/         # projectnyra.com product landing
│   ├── projectnyra/                 # app.projectnyra.com authenticated app
│   ├── twenty/                      # isolated Twenty boundary/config
│   └── shared/                      # genuinely shared UI/utilities only
│
├── services/
│   ├── api-gateway/
│   ├── lead-ingestion/
│   ├── crm-api/
│   ├── twentycrm-integration/
│   ├── campaign-engine/
│   ├── compliance-service/
│   ├── communication-service/
│   ├── quote-engine/
│   ├── quote-api/
│   ├── mortgage-assistant-api/
│   ├── auth-service/
│   ├── document-management/
│   ├── webhook-service/
│   ├── websocket-hub/
│   ├── nexus-router/
│   ├── litellm-proxy/
│   ├── openclaw/
│   └── memory-adapters/
│
├── packages/
│   ├── crm-client/
│   ├── crm-types/
│   ├── lead-domain/
│   ├── campaign-domain/
│   ├── compliance-domain/
│   ├── quote-domain/
│   ├── assistant-contracts/
│   ├── a2a-adapter/
│   ├── observability/
│   ├── config/
│   └── ui/
│
├── workflows/
│   ├── n8n/
│   └── activepieces/
│
├── infra/
│   ├── hosts/
│   │   ├── orchestrator/
│   │   ├── oracle-vps/
│   │   ├── worker-rtx5090/
│   │   ├── worker-rtx3090ti/
│ │ ├── /
│   │   └── _templates/
│   ├── configs/
│   ├── images/
│   └── terraform/
│
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── compliance/
│   ├── runbooks/
│   ├── agent-context/
│   ├── decisions/
│   └── archive/
│
├── scripts/
├── tests/
├── AGENTS.md
├── idea.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Host Compose Rule

Canonical host compose files belong under:

```text
infra/hosts/<host-name>/
```

Do not scatter active production compose files across arbitrary root, service, or archive folders.

## Legacy Paths

The repository may contain older names such as:

- `apps/landing`;
- `apps/webapp`;
- `apps/admin`;
- `apps/mortgage-crm`;
- `apps/twenty-crm`;
- archived infrastructure;
- duplicated compose;
- old memory stacks;
- old orchestrators.

Agents must identify whether each is:

- canonical;
- migration source;
- reference;
- archived;
- or dead.

Do not delete valuable source material until migration is verified.

---

# 18. Networking and Domains

## 18.1 Private Network

Tailscale is the default private east-west network.

Use:

- MagicDNS hostnames;
- Tailscale ACLs;
- device identity;
- service-specific access;
- and private worker endpoints.

Avoid hard-coding changing LAN IPs unless a service specifically requires them.

## 18.2 Public Ingress

Cloudflare provides:

- DNS;
- Pages;
- Tunnel;
- Access;
- WAF/rate limiting where configured;
- and public/private surface separation.

No inbound router port forwarding should be required for normal Project Nyra operation.

## 18.3 Domain Map

Target public domains:

```text
ratehunter.net
www.ratehunter.net

projectnyra.com
www.projectnyra.com
app.projectnyra.com
api.projectnyra.com
```

Potential protected subdomains:

```text
crm.projectnyra.com
nexus.projectnyra.com
llm.projectnyra.com
agents.projectnyra.com
workflows.projectnyra.com
grafana.projectnyra.com
portainer.projectnyra.com
gitea.projectnyra.com
openclaw.projectnyra.com
docs.projectnyra.com
```

Not every internal service requires a public hostname.

Prefer private Tailscale DNS for administrative services unless remote browser access through Cloudflare Access is necessary.

## 18.4 Exposure Classes

### Public

- RateHunter landing;
- Project Nyra marketing landing;
- safe lead-ingestion endpoint;
- public documentation explicitly approved.

### Authenticated Product

- Project Nyra app;
- selected borrower portal;
- approved APIs.

### Access-Gated Admin

- Twenty CRM;
- workflow tools;
- Grafana;
- Gitea;
- Portainer;
- OpenClaw admin;
- Nexus admin;
- Supabase admin.

### Private Only

- raw model endpoints;
- Redis;
- Postgres;
- FalkorDB;
- internal MCP transports;
- Docker sockets;
- Infisical machine credentials;
- worker control APIs.

---

# 19. Authentication and Authorization

## 19.1 Application Authentication

The target internal webapp uses Supabase auth/backend unless verified architecture says otherwise.

Support:

- email/password or SSO as approved;
- MFA for privileged users;
- session expiration;
- role claims;
- secure password reset;
- audit logging.

## 19.2 Roles

Suggested roles:

- owner;
- admin;
- branch manager;
- loan officer;
- processor;
- assistant;
- auditor;
- read-only;
- service identity;
- agent identity.

## 19.3 Agent Identity

Every agent should have:

- its own identity;
- scoped key;
- allowed tools;
- allowed models;
- budget;
- environment;
- audit label;
- concurrency limit;
- revocation path.

Do not share one universal super-key across agents.

---

# 20. Secrets and Configuration

## 20.1 Infisical

Infisical is the preferred secrets authority.

Use:

- machine identities;
- Universal Auth or approved machine auth;
- host-specific paths;
- environment-specific secrets;
- short-lived credentials when supported;
- sidecars or secure file materialization;
- audit logs.

Example logical paths:

```text
/shared
/environments/dev
/environments/staging
/environments/prod
/hosts/orchestrator
/hosts/oracle-vps
/hosts/worker-rtx5090
/hosts/worker-rtx3090ti
/hosts/
/apps/ratehunter
/apps/projectnyra-landing
/apps/projectnyra
/services/litellm
/services/nexus
/services/twenty
/services/twilio
/services/sendgrid
```

Do not point worker identities to another host’s secret path.

## 20.2 Secret Materialization

Where container integrations require files, use protected paths such as:

```text
/etc/projectnyra/secrets/
```

Set strict permissions.

Do not commit materialized files.

## 20.3 Environment Templates

Every app, service, and host stack should have:

- `.env.example`;
- descriptions;
- required/optional markers;
- safe placeholder values;
- validation.

No real secret should appear in examples.

---

# 21. Memory and Knowledge

## 21.1 Memory Is Not One Database

Project Nyra has multiple memory classes:

### CRM Memory

Authoritative business records in Twenty CRM.

### Transactional Application State

Postgres/Supabase records for app-specific operations.

### Workflow State

Campaign and automation execution state.

### Assistant Memory

Selected durable preferences, relationships, summaries, and task context.

### Semantic Knowledge

Documents, policies, product docs, code, and indexed reference material.

### Operational Telemetry

Logs, traces, metrics, events, and audit records.

These must not be collapsed into one indiscriminate “memory” store.

## 21.2 Letta

Letta may own selected stateful-agent context.

It is not the universal orchestrator or global business authority.

Use it where durable agent state provides clear value.

## 21.3 Mem0 / OpenMemory / Mempalace / memOS

The repository may contain multiple memory experiments or adapters.

Agents must verify the current selected stack before expanding any of them.

General policy:

- preserve provenance;
- use namespaces;
- avoid storing every tool call;
- retain only useful durable information;
- allow deletion;
- keep borrower PII controlled;
- avoid conflicting memories;
- prefer explicit consolidation.

## 21.4 Qdrant / FalkorDB / Redis

Potential roles:

- Qdrant: vector retrieval;
- FalkorDB: graph/entity relationships;
- Redis: cache, queues, ephemeral state;
- Postgres: durable relational truth.

No store should silently become a second CRM.

---

# 22. Observability

## 22.1 Required Layers

### LLM and Agent Observability

- LiteLLM usage;
- model selected;
- fallback;
- latency;
- token usage;
- cost;
- errors;
- tool calls;
- agent identity;
- A2A task state.

### Application Observability

- request rate;
- error rate;
- latency;
- queue depth;
- campaign execution;
- lead ingestion;
- quote generation;
- webhook failures;
- CRM sync.

### Infrastructure Observability

- host availability;
- Docker health;
- CPU;
- RAM;
- GPU utilization;
- VRAM;
- temperature;
- disk;
- network;
- container restarts.

### Business Observability

- speed to lead;
- contact rate;
- response rate;
- campaign conversion;
- quote rate;
- application rate;
- funded rate;
- source performance;
- aging;
- opt-out rate;
- error/exception rate.

## 22.2 Stack

Target or current components may include:

- OpenTelemetry;
- OpenLIT;
- Prometheus;
- Loki;
- Grafana;
- Alertmanager;
- LiteLLM telemetry;
- structured JSON logs;
- correlation IDs.

## 22.3 Correlation

A single lead journey should be traceable across:

- intake;
- CRM write;
- campaign enrollment;
- communication;
- reply;
- quote;
- approval;
- assistant action.

Use correlation and audit IDs.

## 22.4 PII Redaction

Logs must redact:

- SSNs;
- full financial account numbers;
- passwords;
- access tokens;
- full borrower documents;
- sensitive message bodies unless protected;
- unnecessary raw payloads.

---

# 23. Security and Compliance

## 23.1 Security Principles

- zero trust;
- least privilege;
- deny by default;
- scoped identities;
- private worker inference;
- secret isolation;
- explicit approvals;
- auditable mutations;
- reversible changes;
- tested backups;
- no security-through-obscurity.

## 23.2 Mortgage Communication Compliance

The platform must explicitly support:

- TCPA-related consent handling;
- CAN-SPAM requirements;
- STOP/unsubscribe processing;
- DNC;
- quiet hours;
- sender identity;
- disclosure versions;
- communication audit;
- channel eligibility.

Specific legal requirements can change and must be reviewed with qualified counsel. Code must make compliance rules configurable and testable.

## 23.3 AI Safety for Mortgage Work

AI output must distinguish:

- factual CRM data;
- inferred data;
- calculated data;
- sample data;
- stale data;
- missing data;
- and recommendations.

No agent should state uncertain information as confirmed.

## 23.4 Audit Events

Audit events should record:

- actor;
- agent;
- user;
- action;
- target;
- before/after or write plan;
- reason;
- approval;
- timestamp;
- correlation ID;
- tool/model where relevant.

---

# 24. Workflow and Integration Tools

## 24.1 Activepieces

Activepieces is preferred for productized connectors and accessible workflow authoring where it fits the current stack.

Use it for:

- integrations;
- actions;
- schedules;
- connector execution;
- notifications;
- approved workflow building.

## 24.2 n8n

n8n remains useful for:

- durable waits;
- webhook processing;
- complex branching;
- retries;
- internal orchestration;
- migration workflows.

It must remain an implementation detail behind service-owned state.

## 24.3 Composio

Composio may provide authenticated integrations and tool access.

Scopes must be constrained per agent and environment.

## 24.4 Gitea and GitHub

GitHub is the primary collaborative repository and CI/CD surface.

Gitea may provide:

- local mirror;
- private experiments;
- offline resilience;
- internal agent access.

Repository mirrors must avoid conflicting source-of-truth behavior.

---

# 25. Frontend Technology and Design System

## 25.1 Core Stack

Preferred stack:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- tweakcn themes;
- selective Magic UI;
- selective Aceternity UI;
- Framer Motion;
- Spline or React Three Fiber for carefully scoped 3D;
- Cloudflare Pages/OpenNext where deployed.

## 25.2 Typography

Current direction:

- Geist for body/UI;
- Monaspace Krypton or similar for technical/data surfaces;
- Sora, Space Grotesk, or restrained display face for cinematic marketing.

## 25.3 Brand Palette

Project Nyra:

- XulbuX-like purple;
- neon violet;
- cyan/turquoise;
- seafoam/mint;
- Nyra pink;
- near-black backgrounds.

Avoid default yellow/orange/standard-green as dominant brand colors.

Use warning and destructive colors semantically.

## 25.4 Accessibility

All surfaces require:

- keyboard navigation;
- visible focus;
- contrast;
- semantic headings;
- labels;
- error messages;
- reduced motion;
- mobile behavior;
- screen-reader consideration.

---

# 26. The Initial Production Vertical Slice

The highest-priority working path is:

```text
1. Receive a real lead.
2. Preserve the raw intake event.
3. Normalize and validate the lead.
4. Verify consent and contact eligibility.
5. Deduplicate.
6. Create or update the person and mortgage lead in Twenty.
7. Assign the lead to Ellis or a configured owner.
8. Enroll the lead in the correct campaign.
9. Send the first compliant touch.
10. Log the communication.
11. Detect an inbound reply.
12. Pause future automation.
13. Alert the broker.
14. Gather missing quote assumptions.
15. Generate deterministic quote scenarios.
16. Present them for broker approval.
17. Log approval and delivery.
18. Track application and pipeline progress.
```

Until this path works reliably, adding more orchestrators, memory databases, agent frameworks, or decorative dashboards is secondary.

---

# 27. Delivery Priorities

## P0 — Business-Critical

- Twenty CRM authoritative data model;
- safe lead ingestion;
- consent and suppression;
- campaign state;
- Twilio/SendGrid communication;
- reply pause/STOP;
- quote engine;
- broker approvals;
- authenticated app;
- audit events;
- central LiteLLM;
- private worker routes;
- secrets;
- observability;
- backup and restore.

## P1 — High Leverage

- Nyra assistant;
- Hermes runtime;
- A2A;
- OpenClaw remote interface;
- memory consolidation;
- document management;
- advanced lead scoring;
- campaign analytics;
- referral workflows;
- agent console;
- ProjectNyra.com cinematic landing;
- RateHunter 3D polish.

## P2 — Expansion

- multi-tenant team product;
- lender integrations;
- borrower portal;
- voice assistant;
- advanced underwriting document extraction;
- white-label deployment;
- predictive conversion;
- larger agent mesh;
- more sophisticated local inference scheduling.

---

# 28. Non-Goals and Anti-Regression Rules

Do not:

- merge RateHunter and Project Nyra into one brand surface;
- make ProjectNyra.com borrower-facing;
- make the authenticated app look like a marketing film;
- make Twenty and the Nyra app conflicting systems of record;
- let the assistant write directly to databases;
- expose raw GPU endpoints publicly;
- duplicate LiteLLM policy on every worker;
- place core business state only inside n8n;
- rely on prompt text as the only compliance mechanism;
- silently merge fuzzy duplicate leads;
- claim rates are live when they are samples;
- grant every agent broad filesystem, shell, Docker, CRM, and secrets access;
- add infrastructure without ownership, health checks, backups, and documentation;
- resurrect deprecated systems because an archived prompt mentions them;
- perform a broad rewrite before the real vertical slice is stable.

---

# 29. Definition of Done

A feature is complete only when:

- code exists;
- types/contracts exist;
- validation exists;
- tests exist;
- errors are handled;
- authorization is enforced;
- compliance is enforced;
- audit events exist;
- observability exists;
- documentation is updated;
- environment variables are documented;
- secrets are not committed;
- deployment is defined;
- health checks exist;
- rollback or recovery is understood;
- UI distinguishes live, cached, mock, degraded, and blocked state;
- the result fits the Project Nyra architecture.

An infrastructure service is not done merely because a container starts.

A product feature is not done merely because a page renders.

An AI workflow is not done merely because a prompt produces a convincing answer.

---

# 30. Hermes Execution Doctrine

When Hermes receives a Project Nyra task, it should:

1. Restate the concrete objective internally.
2. Identify the affected product surface.
3. Identify the authoritative data owner.
4. Identify security and compliance boundaries.
5. Inspect existing files and deployments.
6. Separate current state from desired state.
7. Choose the smallest coherent implementation slice.
8. Implement through explicit contracts.
9. Add tests and health checks.
10. Update documentation.
11. Report:
    - what changed;
    - what was tested;
    - what remains;
    - risks;
    - manual owner actions.

Hermes should be highly autonomous but not reckless.

It should prefer:

- evidence over assumption;
- deterministic services over hallucinated calculations;
- small reviewable diffs over giant rewrites;
- centralized policy over duplicated gateways;
- strong boundaries over convenient superuser access;
- business value over tool accumulation.

---

# 31. One-Sentence Product Definition

> **Project Nyra is a distributed, AI-native mortgage operating system that captures and nurtures leads, synchronizes Twenty CRM, enforces communication compliance, generates deterministic quote scenarios, assists brokers through Nyra/Hermes, and runs across a privately networked hybrid local-cloud infrastructure controlled by the broker.**

---

# 32. Final Vision

The completed Project Nyra experience should feel as though Ellis has a tireless mortgage operations team embedded in his infrastructure.

A lead arrives and is not lost.

The system recognizes where it came from, verifies whether it may communicate, records it correctly, begins the right sequence, stops when the borrower responds, alerts the broker, prepares the relevant context, produces explainable quote scenarios, records every action, and keeps the relationship alive.

The AI does not replace the broker.

It removes latency, fragmentation, repetition, and operational blindness so the broker can focus on judgment, relationships, negotiation, and closing.

That is Project Nyra.
