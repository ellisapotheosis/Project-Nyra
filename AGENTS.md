# AGENTS.md — Project Nyra

## Mission

Project Nyra is a distributed AI mortgage operations platform. Build and maintain it as a production-minded, compliance-aware system that turns lead ingestion, campaign execution, quote generation, and broker assistance into one coherent control plane.

The system is not a generic chatbot project. It is a mortgage lead and workflow platform with:
- CRM as system of record
- strict compliance/suppression requirements
- distributed local inference on GPU workers
- cloud model fallback and coding-agent support
- a custom admin/product UI layer

## Source of truth

When there is a conflict, prefer this order:

1. `AGENTS.md`
2. `.serena/project.yml` and Serena memories
3. repo `README.md` / `docs/`
4. actual code and deployed config
5. older notes, archived prompts, or deprecated scaffolds

Do not resurrect deprecated stack choices unless explicitly instructed.

## Current architecture

### Control plane
Runs on the **orchestrator**.

Main responsibilities:
- Nexus Router (single MCP / model-service entrypoint)
- LiteLLM (provider/model routing and abstraction)
- Langfuse (LLM observability)
- Prometheus / Loki / Grafana (infra observability)
- n8n (internal workflow execution only)
- Portainer (container operations UI)
- Archon OS (context, workflow, prompting, and project memory manager)
- Mem0 + FalkorDB (selected assistant memory, not universal memory)
- OpenClaw Gateway + OpenClaw Studio
- Open WebUI (internal LLM ops/workbench)
- Twenty CRM and Nyra application services
- Cloudflared (public ingress)
- Postgres + Redis

### Compute plane
Runs on GPU workers.

- `worker-rtx5090`: primary vLLM node, mobile admin node
- `worker-rtx3090ti`: secondary vLLM node
- `worker-rtx3060`: Ollama node for smaller models, embeddings, ingestion utility work

### Networking
- Tailscale is the private east-west mesh
- Cloudflared is public north-south ingress
- Use MagicDNS hostnames as the default addresses
- Keep worker model servers private; expose public UI through orchestrator

## Product boundaries

### Main product/admin UI
Build and extend **Archon OS / Nyra Admin UI** as the primary operational surface.

### Customer-facing assistant
Use **OpenClaw** and the OpenClaw chat UI as the broker/customer assistant surface.

### Internal LLM ops UI
Use **Open WebUI** for internal experimentation, debugging, and model/tool workbench use.

### Container management
Use **Portainer** for visual container ops. It is an ops tool, not the product UI.

## CRM and workflow rules

### CRM
**Twenty CRM is the system of record.**

Persist and manage:
- leads
- campaigns
- communications
- quote records
- assignment and broker workflow state
- compliance/suppression state

### Workflow engine
Use **n8n now**, but only as an implementation detail behind Nyra services.

Do not design the product so business logic lives only inside n8n workflows.

Product logic must remain in Nyra services and the CRM layer:
- campaign state
- suppression / STOP / DNC
- quiet hours
- consent and audit data
- lead assignment
- quote approvals
- broker-facing workflow state

## Memory rules

### Use
- Archon OS for context/workflow/project memory management
- Mem0 + FalkorDB only for selected assistant/entity memory use cases

### Do not use
- RuVector
- Graphiti
- Letta
- openmemory / openmemory MCP
- Graphiti-style temporal graph stack unless explicitly reintroduced

### Memory policy
Do not indiscriminately auto-store every conversation and tool call in Mem0.
Use tight namespaces, filters, and explicit retention rules.

## Model serving rules

### Preferred deployment
- vLLM on `worker-rtx5090`
- vLLM on `worker-rtx3090ti`
- Ollama on `worker-rtx3060`

### Routing intent
- cloud Claude / Codex / Gemini for premium coding and reasoning workflows
- local vLLM for heavy private local inference
- Ollama for lighter utility models and embeddings-ish helper tasks

Do not attempt to force one live conversation to span all workers at the inference runtime layer.
Use orchestrator-level routing and parallel subagents instead.

## Coding and agent workflow

### Primary coding workflow
- Claude Code is the default coding agent
- Codex CLI and Gemini CLI may run in parallel tmux panes
- LLxprt Code / LLxprt Jefe may be used as a terminal control plane for multi-agent repo work
- Serena is the code-understanding and memory assistant layer for coding agents

### Expected tmux pattern
Typical battlestation sessions may include:
- `claude-main`
- `codex-main`
- `gemini-main`
- `local-5090`
- `local-3060`
- `ops`
- `jefe`

### Agent behavior expectations
Agents should:
- inspect the existing repo before changing architecture
- respect current stack choices
- write concise docs while making code changes
- avoid reintroducing deprecated components
- prefer incremental, verifiable steps
- produce scripts/configs that are runnable on Windows + WSL2 + Docker Desktop

## UI / design system rules

Use:
- shadcn/ui
- tweakcn palette/model styling choices
- Magic UI where it improves the interface
- one cohesive design language across landing, admin, and app surfaces

Keep:
- broker/admin interfaces professional and fast
- AI/chat surfaces secondary to the actual workflow controls
- the OpenClaw chat UI integrated into the web app where relevant

## Compliance rules

Mortgage workflow and outreach must be designed with compliance in mind.

Always preserve:
- opt-out / STOP handling
- DNC and suppression state
- quiet hours
- broker approval checkpoints where required
- auditability for communications and quote actions

Do not optimize away compliance state tracking for convenience.

## Repo expectations

Expected major areas:
- `apps/landing`
- `apps/webapp`
- `apps/admin`
- `services/*`
- `deploy/orchestrator`
- `deploy/worker-*`
- `docs/`
- `.serena/`

If the current repo differs, adapt carefully, but keep the target architecture above in mind.

## Definition of done for major work

A task is not complete until:
- code/config is written
- docs or notes are updated if needed
- obvious validation steps are included
- deprecated paths are not left half-reintroduced
- the result fits the actual Nyra architecture

## Anti-regression list

Do not reintroduce any of the following without explicit instruction:
- RuVector
- Graphiti
- Letta
- openmemory MCP
- generic “one giant workflow engine is the product” design
- Swarm/Kubernetes as a default deployment answer
- public exposure of worker model servers
- using Open WebUI or Portainer as the main customer/admin product UI
