# Project Nyra Repository Truth Audit, Conflict Register, and ADR Set

**Repository:** `ellisapotheosis/Project-Nyra`  
**Audited branch:** `main`  
**Audited commit:** `9efd1955744416974f3d373762638b855aa3afb9`  
**Audit date:** 2026-07-19

## 1. Evidence reviewed

- `README.md`
- `AGENTS.md`
- `package.json`
- `apps/projectnyra/package.json`
- `conductor/product.md`
- `conductor/tech-stack.md`
- `docs/architecture/MASTER_ARCHITECTURE.md`
- `docs/applications/apps/APPS-FOLDER-SUMMARY.md`
- `.github/workflows/deploy-cloudflare-pages.yml`
- `infra/configs/nexus/nexus.toml`
- `infra/configs/litellm/config.yaml`
- recent repository commits
- supplied Project Nyra finish-line, realignment, observability, and progress documents

## 2. Confirmed current direction

- Root package name is `project-nyra`.
- `apps/projectnyra` exists and package name is `projectnyra`.
- Root `pnpm dev` targets `projectnyra`, `projectnyra-landing`, `ratehunter-landing`, and `lead-capture-api`.
- Twenty CRM is declared as the system of record.
- Compliance and audit are explicit product invariants.
- Next.js App Router and TypeScript are the primary application stack.
- Nexus is configured as MCP and LLM ingress.
- LiteLLM includes local GPU, free, subscription bridge, and OpenRouter routes.
- The Cloudflare workflow expects `apps/ratehunter/landing`.
- Recent commits show active infrastructure, Supabase, Letta, OpenClaw, Mem0/FalkorDB, and Cloudflare delivery work.

## 3. Evidence-backed strengths

- Explicit global agent contract.
- Clear system-of-record principle.
- Explicit compliance and audit mandates.
- Host-specific Compose placement rule.
- Private worker design.
- Real local model routing.
- Current Project Nyra application package.
- Recent active development.
- Deterministic quote-service doctrine.
- Shared domain-model and integration-adapter direction.

## 4. High-priority risks

### Architecture and documentation drift

Multiple generations coexist:

- older `apps/webapp` and `apps/landing` guidance;
- a proposed category-based `apps/web/*` structure;
- current `apps/projectnyra`;
- the expected `apps/ratehunter/landing` deployment path.

### Nexus policy

At the audited commit:

- CORS allows `*`;
- a broad Docker toolkit is registered;
- Infisical is registered without a documented read-only boundary;
- Twenty is registered as a raw MCP endpoint rather than an explicit read/staged-write separation;
- Letta is directly registered, creating a potential recursive orchestration risk.

### Model spend

Automatic LiteLLM fallbacks include subscription models. This conflicts with the stated rule that paid spend requires explicit owner configuration.

### Letta recursion

Direct Letta MCP registration should be replaced or wrapped by a narrow bridge to constrain operations and prevent recursive orchestration.

### Ingress ambiguity

Some documents say Cloudflared runs only on the orchestrator. Others describe tunnels on the orchestrator and Oracle VPS. A binding ADR and public-exposure validation are required.

### Observability generation drift

Older architecture references Langfuse. Newer target material specifies OpenLIT, OpenTelemetry, and Tempo. Select a primary stack and mark optional or legacy components explicitly.

### Toolchain drift

- root package manager: pnpm 11.9.0;
- Cloudflare workflow: pnpm 10.27.0;
- conductor declaration: pnpm 10+;
- root TypeScript: 6.0.x;
- application TypeScript: 5.3.x;
- conductor declaration: TypeScript 5.7+.

These versions may coexist, but the supported matrix must be explicit.

## 5. Conflict register

| ID | Conflict | Evidence | Canonical decision | Required action |
|---|---|---|---|---|
| C-001 | `apps/webapp` vs `apps/projectnyra` | README and older docs vs current package | `apps/projectnyra` is the canonical operator app | Update stale docs and links |
| C-002 | RateHunter intended path vs missing package fetch | Workflow targets `apps/ratehunter/landing` | Verify the tree locally; preserve intended deployment path until disproven | Add repo-doctor path check |
| C-003 | Category-based proposed layout vs current domain layout | 2026-01 proposed app architecture | Proposed document is historical, not binding | Mark proposed or archive |
| C-004 | Cloudflared only orchestrator vs both hosts | Global contract vs README/master architecture | Decide by ADR; minimize public blast radius | Owner and SRE review |
| C-005 | Langfuse vs OpenLIT | Older architecture vs newer observability target | OpenLIT and OTel are primary; Langfuse optional | Reconcile Compose and docs |
| C-006 | Paid fallback disabled vs automatic subscription fallback | Global rule vs LiteLLM config | No automatic metered paid fallback | Config PR |
| C-007 | Broad direct Letta MCP vs narrow bridge | Nexus config vs realignment doctrine | One canonical Letta and narrow bridge | Service/config PR |
| C-008 | Broad Twenty MCP vs mutation boundary | Nexus config vs product law | CRM read tools plus staged service writes | Tool-scope refactor |
| C-009 | Infisical read/write ambiguity | Nexus registration lacks documented scope | General access read-only; admin write isolated | Tool-scope refactor |
| C-010 | Wildcard Nexus CORS | Current Nexus config | Explicit production origins | Config PR |
| C-011 | pnpm version drift | Package, workflow, and docs | Pin one supported version | Toolchain ADR |
| C-012 | TypeScript version drift | Root, app, and docs | Supported matrix and controlled upgrade | Toolchain ADR |
| C-013 | Worker `.projectnyra.com` names vs MagicDNS doctrine | LiteLLM config vs infra rules | Private Split DNS or MagicDNS only | DNS/config review |
| C-014 | Durable service inventory varies | Documentation generations | Generate service catalog from active Compose | Validation automation |
| C-015 | Quote automation priority | Older plans vs API availability | Broker-reviewed manual foundation first | Product roadmap |

## 6. Source priority

When sources conflict:

1. active code and runtime configuration;
2. active host-specific Compose files;
3. current root agent contracts;
4. current package manifests and component specifications;
5. recent CI and deployment workflows;
6. accepted ADRs and this constitution package;
7. recent evidence-backed operational reports;
8. historical or proposed docs;
9. prompts not validated against source.

Reconciliation rules:

- never blend contradictions into a vague compromise;
- record the conflict;
- name the evidence;
- choose a decision or mark owner review;
- assign an implementation action;
- add validation;
- update stale documentation;
- never claim production truth from documentation alone.

## 7. Status vocabulary

- **verified:** observed in active source or runtime and validated where possible;
- **configured:** present in config, runtime not verified;
- **implemented:** source exists, integration may not be live;
- **planned:** accepted target, not built;
- **proposed:** under review;
- **legacy:** superseded but retained;
- **archive:** historical reference only;
- **unknown:** requires inspection.

---

# Architecture Decision Records

## ADR-001 — Nexus, LiteLLM, and Letta responsibilities

**Status:** Accepted target

### Decision

- Grafbase Nexus is the singular governed MCP and LLM ingress.
- LiteLLM is the model gateway behind Nexus.
- One canonical production Letta instance owns stateful orchestration.
- Other systems call Letta through a narrow bridge.
- Letta calls Nexus for tools.
- Recursive self-orchestration is prohibited by default.

### Consequences

- clear policy boundary;
- model/provider portability;
- centralized observability;
- bridge implementation required;
- scoped token design required;
- current direct Letta MCP registration must be reviewed.

## ADR-002 — Twenty CRM as mortgage system of record

**Status:** Accepted

### Decision

Twenty CRM owns mortgage CRM records. Nyra services own domain execution state and map it to Twenty identifiers. Frontends, agents, and workflow engines do not directly mutate Twenty.

### Consequences

- typed CRM adapter;
- idempotent writes;
- sync and error projections;
- timeline integration;
- no raw general-agent CRM write tool.

## ADR-003 — Memory hierarchy

**Status:** Accepted target

### Decision

- transactional truth: Twenty and governed Postgres;
- agent state: Letta;
- semantic/runtime memory: Mem0 and OpenMemory;
- graph: FalkorDB;
- vector: Qdrant;
- experimental systems: feature-flagged.

### Consequences

Memory objects require provenance, scope, confidence, retention, and correction. RTX 3060 may compute indexes but is not the sole durable storage location.

## ADR-004 — Public, Access-gated, and private domains

**Status:** Proposed; owner must finalize tunnel placement

### Decision

Public endpoints are minimal. Admin UIs are Cloudflare Access gated or Tailscale-only. Workers, databases, raw MCP, observability internals, and model servers use private Split DNS or MagicDNS.

### Open decision

Choose whether public Cloudflare tunnels run only on the orchestrator or on the orchestrator plus Oracle VPS. Prefer the topology with the least public blast radius and clearest service ownership.

## ADR-005 — Human approval and audit

**Status:** Accepted target

### Decision

Consequential actions use explicit preview, policy decision, approval, execution, and verification states. Approval binds to the exact payload digest and expires.

Every mutation and communication emits an audit event.

### Consequences

- approval service and schema;
- UI approval inbox;
- exact payload digest;
- append-only audit;
- no silent agent execution.

## 8. Recommended follow-up PR sequence

1. Nexus authentication, CORS, and tool-scope hardening.
2. LiteLLM spend and fallback hardening.
3. Narrow Letta bridge and recursion guards.
4. Public/private domain and tunnel ADR implementation.
5. OpenTelemetry/OpenLIT/Tempo wiring.
6. Lead-nurture vertical slice.
7. Root README and path reconciliation.
8. Supported toolchain matrix.
