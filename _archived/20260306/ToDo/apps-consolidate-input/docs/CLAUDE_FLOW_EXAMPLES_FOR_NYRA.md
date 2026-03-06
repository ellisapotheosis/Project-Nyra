# Claude-Flow examples to steal for Nyra

GitHub’s directory listing for `examples/` sometimes errors in the browser, so this doc maps **the patterns** Claude-Flow documents (templates, SPARC, swarm/hive-mind, hooks) into **direct Nyra wins**.

## The 6 examples/patterns that help Nyra immediately

### 1) Templates -> enforce “parallel execution” + code standards
Use CLAUDE.md templates to lock agent behavior (parallelism, code style, security guardrails, ...).
- Apply a template per repo/module
- Then override with a Nyra-specific CLAUDE.md layer

### 2) Swarm init + agent spawn
Use swarm init to set topology for coordination, then spawn specialist roles:
- Compliance Sentinel
- CRM Integrator (Twenty)
- Campaign Engineer
- Quote Engine
- Observability/DevOps

### 3) Hooks workflow (pre-task / post-edit / notify)
For anything touching production systems, require hooks:
- `hooks pre-task` before starting a unit of work
- `hooks post-edit` after file writes
- `hooks notify` whenever a decision is made

### 4) SPARC batch files
Use a single batch file to describe a whole delivery slice (schema + API + UI + workflows).
Nyra ships fastest when you:
- write one batch file per slice
- run it non-interactively
- review diffs

### 5) Non-interactive automation
For CI/CD: run claude-flow in non-interactive mode against:
- unit tests
- lint
- contract checks
- doc generation

### 6) Memory usage
Use memory for:
- “What did we decide?”
- “What field names did Twenty generate?”
- “Which campaign rules are approved?”

## Which Nyra modules should use which claude-flow features?
- `services/quote-api`: SPARC TDD + batch (math correctness)
- `services/campaign-engine`: SPARC + non-interactive (deterministic scheduling)
- `apps/nyra-admin`: template web-development + UI component agents
- `integrations/twenty`: swarm tasks (schema bridging + webhook wiring)

## How to run (copy/paste)
From repo root:

```bash
# 0) Init once
npx @claude-flow/cli@latest init --sparc

# 1) Start swarm (mesh for wide exploration)
npx claude-flow swarm init --topology mesh --max-agents 8 --name nyra

# 2) Run a batch slice
npx claude-flow sparc batch "Execute prompts/claude-flow/02_BATCH_NYRA_MONOREPO.md"
```
