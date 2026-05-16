# 07 Conflicts and Missing Information

## Conflict Register

### CONFLICT-001 — Letta vs Mem0/OpenMemory as final memory stack

- Conflicting versions: Several sources say Letta is master memory manager via Letta MCP; one converged stack says Letta was dropped in favor of Mem0/Postgres/FalkorDB/Graphiti.
- Likely best default: Keep Letta as an optional/protected memory-manager agent/UI profile while using Postgres/Twenty for durable records and Mem0/FalkorDB/Graphiti for memory substrate.
- Impact if wrong: Overbuilds memory stack or removes a desired memory control layer.
- Affected prompts: 02, 06, 08, 09, 12.

### CONFLICT-002 — TwentyCRM on orchestrator vs Oracle VPS

- Conflicting versions: Earlier plan deploys Twenty on orchestrator; later converged stack puts core state on Oracle.
- Likely best default: Production/default TwentyCRM on Oracle for 24/7 availability; local/orchestrator instance allowed for dev only.
- Impact if wrong: Public leads may fail if home machine is down, or local latency improves but uptime suffers.
- Affected prompts: 01, 03, 07, 08.

### CONFLICT-003 — Paperclip on Oracle vs orchestrator

- Conflicting versions: One source assigns Paperclip to Oracle as async dashboard; later final Neko grid assigns Paperclip to orchestrator.
- Likely best default: If Paperclip is operational/ticket dashboard integrated with OpenClaw/Nerve, run it on orchestrator. If it is pure async goal/ticket database, run on Oracle. Implement with compose profiles so placement can change.
- Impact if wrong: Latency vs uptime tradeoff.
- Affected prompts: 01, 10.

### CONFLICT-004 — OpenClaw gateway on workers vs orchestrator

- Conflicting versions: Some conversations place gateway with GPU workers; final topology places two gateways on orchestrator targeting worker vLLM endpoints.
- Likely best default: Gateways on orchestrator, vLLM/compute on workers. This preserves VRAM and centralizes operator control.
- Impact if wrong: More UI/service bloat on GPU machines or higher network complexity.
- Affected prompts: 01, 02, 10.

### CONFLICT-005 — Nerve placement and count

- Conflicting versions: Run Nerve on workers vs orchestrator; one Nerve vs two Nerve instances.
- Likely best default: Two Nerve instances on orchestrator, one targeting 5090 gateway and one targeting 3090Ti gateway.
- Impact if wrong: Config swapping, unclear console targeting, wasted worker resources.
- Affected prompts: 01, 02, 09.

### CONFLICT-006 — n8n vs Activepieces primary automation engine

- Conflicting versions: Activepieces replaces Zapier/n8n in one plan; later plans use n8n for heavy mortgage drip and Activepieces for triggers.
- Likely best default: n8n for heavy dynamic mortgage campaign logic; Activepieces for simple triggers/integrations/admin access.
- Impact if wrong: Either overcomplicates simple automations or underpowers complex mortgage flows.
- Affected prompts: 05, 06, 09.

### CONFLICT-007 — Hermes usage

- Conflicting versions: Older sources mention Hermes; later user correction says no Hermes.
- Likely best default: Do not use Hermes. Use vLLM/OpenAI-compatible model serving and OpenClaw.
- Impact if wrong: Builds deprecated/unwanted containers.
- Affected prompts: 01, 02.

### CONFLICT-008 — Raw n8n embed vs custom campaign builder

- Conflicting versions: Embed n8n in webapp vs custom campaign builder controlling n8n headlessly.
- Likely best default: Custom campaign builder for daily campaign management; raw n8n admin view only in tools/admin section.
- Impact if wrong: Broker workflow becomes brittle and too technical.
- Affected prompts: 06, 09, UI quarantine.

### CONFLICT-009 — Public/professional mortgage UX vs cyberpunk command deck

- Conflicting versions: Dramatic terminal/cyberpunk visuals vs mortgage trust/compliance/professional landing.
- Likely best default: Public landing remains professional with tasteful tech polish; internal app can use stronger command-deck styling.
- Impact if wrong: Public trust and conversion suffer.
- Affected prompts: UI quarantine.

### CONFLICT-010 — External project facts and repo availability

- Conflicting versions: Sources include claims about new Nexus/Hive/Grafbase/Letta repos and 2026 statuses that may require live verification.
- Likely best default: Treat uploaded claims as planning context, but verify external repo URLs/docs before implementation.
- Impact if wrong: Agent builds against outdated/hallucinated APIs.
- Affected prompts: 02, 06, 10, 12.

## Missing Information Register

| Missing item | Why it matters | Suggested default | Can proceed? | Affected areas | Risk |
|---|---|---|---|---|---|
| Exact private repo state | Needed before file edits | Inspect repo before changes; use additive scaffolds | yes | all implementation | medium |
| Actual host IPs/Tailscale names | Needed for compose/env routing | Use hostnames/placeholders and document substitutions | yes | infra/routing | medium |
| Final domain/subdomain map | Needed for Cloudflare/Traefik | Use ratehunter.net defaults from sources | yes | deployment | medium |
| Exact upstream URL for `external/openclaw-n8n-stack` | Needed to fix `.gitmodules` | Add placeholder and block build until verified | partial | Cloudflare Pages | high |
| Final memory architecture decision | Avoid duplicate memory bloat | Optional Letta + durable Mem0/Postgres/FalkorDB substrate | yes | memory/agents | medium |
| Twilio/SendGrid account details | Needed for real sends | Sandbox placeholders | yes | comms | medium |
| Mortgage compliance copy | Needed for public/borrower messages | Conservative estimates-only disclaimers | yes | quote/campaign | medium |
| Final UI design | Needed for visuals | Quarantine and run Claude Desktop design prompt | yes for nonvisual | UI | high |
| Model names/paths | Needed for vLLM containers | Use `MODEL_PATH` placeholders | yes | GPU workers | medium |
| Live Vercel/Cloudflare build logs | Needed to confirm current failures | Do not alter; inspect in agent mode later | yes | deploy | low/medium |
