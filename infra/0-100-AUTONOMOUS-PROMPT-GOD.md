# 0-100-AUTONOMOUS-PROMPT-GOD

This file preserves the original prompt verbatim and then rewrites it into a single autonomous execution prompt intended for a high-context Codex session inside this repository.

## Verbatim Original Prompt

```text
Recommended execution order

Use these prompts in this order:

Prompt 0 — repo-aware infra plan + file map

Prompt 1 — OpenClaw + Mem0 Cloud MVP

Prompt 2 — Kyutai Unmute voice overlay

Prompt 3 — chat UI inside existing webapp/admin UI

Prompt 4 — OpenClaw skills, channels, scripts, and safe ops

Prompt 5 — hardening, observability, reverse proxy, docs

Prompt 6 — future local-worker routing via LiteLLM/Nexus/Tailscale

Do not dump all 7 into Codex at once. That’s how you get the cursed giga-diff.

Env vars to define before any of these prompts are implemented

Put these into your canonical env strategy, but do not hardcode values in repo files.

# OpenClaw / cloud LLM
OPENAI_API_KEY=
OPENROUTER_API_KEY=
LITELLM_MASTER_KEY=
OPENCLAW_GATEWAY_TOKEN=

# Mem0 cloud
MEM0_API_KEY=

# Kyutai Unmute cloud phase
UNMUTE_OPENAI_API_KEY=
GROQ_API_KEY=

# Optional channels
TELEGRAM_BOT_TOKEN=
DISCORD_BOT_TOKEN=

# Optional voice / media / routing
UNMUTE_PUBLIC_BASE_URL=
OPENCLAW_PUBLIC_BASE_URL=
NYRA_CHAT_INTERNAL_API_BASE_URL=

# Optional integrations
TWENTY_API_KEY=
N8N_API_KEY=
ACTIVEPIECES_API_KEY=
INFI_CLIENT_ID=
INFI_CLIENT_SECRET=
INFI_PROJECT_ID=
Proposed target structure
infra/
├─ compose/
│  ├─ openclaw.compose.yml
│  ├─ openclaw.voice.compose.yml
│  ├─ openclaw.ops.compose.yml
│  └─ openclaw.ui.compose.yml
├─ env/
│  ├─ openclaw.env.example
│  ├─ openclaw.voice.env.example
│  └─ openclaw.ui.env.example
├─ openclaw/
│  ├─ Dockerfile
│  ├─ openclaw.json
│  ├─ skills-curated.txt
│  ├─ README.md
│  └─ scripts/
│     ├─ onboard.sh
│     ├─ channels.sh
│     ├─ skills_scan.sh
│     ├─ skills_install_curated.sh
│     └─ skills_update.sh
├─ unmute/
│  ├─ README.md
│  └─ env.example
└─ docs/
   ├─ OPENCLAW_INTEGRATION_PLAN.md
   ├─ OPENCLAW_CHAT_UI_PLAN.md
   └─ OPENCLAW_OPERATIONS.md

You do not need all of those in the first pass. They’re the destination, not the first diff.

Prompt 0 — repo-aware plan first

Use this before anything else if you want Codex to think cleanly and avoid giant rewrites.

Role: Act as a Senior DevOps and AI Systems Architect working inside my Project Nyra repository.

Goal:
Before making code changes, inspect the current repository and produce a minimal-diff implementation plan for integrating:
1. OpenClaw
2. Mem0 Cloud
3. Kyutai Unmute
4. A future chat UI inside my existing webapp/admin UI

Important constraints:
- Do NOT broadly refactor the repo.
- Do NOT rewrite the main docker compose or Makefile unless absolutely necessary.
- Prefer additive files in infra/compose, infra/openclaw, infra/unmute, and infra/docs.
- Respect the existing repo structure and service grouping.
- This repo already has a control-plane/orchestrator pattern and an oracle/app stack pattern. Extend that pattern instead of replacing it.

Tasks:
1. Inspect the current infra structure, compose files, Makefile targets, env conventions, and any existing AI/chat-related directories.
2. Identify the smallest set of new files needed for:
   - OpenClaw cloud MVP
   - Mem0 cloud plugin
   - Kyutai Unmute behind a voice profile
   - a future webapp chat UI integration
3. Propose a phased implementation plan with:
   - Phase 1: OpenClaw + Mem0 cloud
   - Phase 2: voice overlay
   - Phase 3: chat UI
   - Phase 4: channels, skills, and ops hardening
4. List exactly which existing files should remain untouched.
5. List exactly which existing files need tiny edits, if any.
6. Recommend whether to use:
   - a dedicated overlay compose file,
   - multiple overlay compose files,
   - or compose profiles only.

Deliverable:
- A concise implementation plan in markdown
- A file-by-file plan
- No code changes yet unless they are trivial and clearly low risk
Prompt 1 — OpenClaw + Mem0 Cloud MVP

This is the first actual implementation prompt. It’s intentionally narrow and conservative.

Role: Act as a Senior DevOps and AI Systems Architect.

Goal:
Add a minimal-diff OpenClaw + Mem0 Cloud MVP to my existing Project Nyra infrastructure.

Important constraints:
- Keep the diff small and localized.
- Do NOT rewrite my main docker compose or Makefile.
- Prefer additive overlay files.
- This is cloud-backed only for now.
- Do NOT add Qdrant or any new local vector database for this phase.
- Do NOT add local LLM inference for this phase.
- Do NOT hardcode secrets.

Context:
My repo already has a substantial infra stack and existing service groupings. Integrate OpenClaw as a new overlay that can coexist with the current orchestrator/app structure.

Implement only this scope:

Create these files:
1. infra/compose/openclaw.compose.yml
2. infra/env/openclaw.env.example
3. infra/openclaw/Dockerfile
4. infra/openclaw/openclaw.json
5. infra/openclaw/README.md

OpenClaw requirements:
- Add an OpenClaw gateway service and, if needed, a companion CLI/container service
- Use a compose profile: ["openclaw"]
- Mount:
  - a config path for openclaw.json
  - a persistent state/data path
- Avoid mounting the full repo unless absolutely necessary
- Put the service on the most appropriate existing internal docker network, or define the smallest compatible network in this overlay only
- Expose only the ports actually required

Cloud LLM requirements:
- Configure OpenClaw to use cloud LLM access via environment variables
- Prefer OPENAI_API_KEY for this MVP
- If the repo already uses LiteLLM/OpenRouter patterns, document how to switch to that later, but do not force that migration in this pass

Mem0 requirements:
- Install and configure the @mem0/openclaw-mem0 plugin in platform/cloud mode
- In openclaw.json, enable Mem0 with:
  - enabled: true
  - apiKey: "${MEM0_API_KEY}"
- Do not configure Qdrant or local vector storage

Dockerfile requirements:
- Build a minimal OpenClaw image that installs:
  - @mem0/openclaw-mem0
- Keep the Dockerfile as small and deterministic as possible

Environment file:
Create infra/env/openclaw.env.example with only the variables required for this MVP:
- OPENAI_API_KEY=
- MEM0_API_KEY=
- OPENCLAW_GATEWAY_TOKEN=
- OPENCLAW_PORT=
- OPENCLAW_CONFIG_PATH=
- OPENCLAW_DATA_DIR=

Documentation:
Create infra/openclaw/README.md that explains:
- what this overlay does
- how to start OpenClaw
- how Mem0 cloud mode is configured
- which env vars are required
- how this can later be upgraded to LiteLLM/OpenRouter and local workers

Validation:
- Keep touched files minimal
- Do not modify unrelated infra
- No speculative services
- Keep the implementation stand-up ready
Prompt 2 — Kyutai Unmute voice overlay

This keeps voice isolated. Good. Very good. Prevents the screaming diff demon.

Role: Act as a Senior DevOps and AI Systems Architect.

Goal:
Add a minimal-diff Kyutai Unmute cloud-backed voice overlay to my existing Project Nyra repo so it can later connect to OpenClaw, but stays dormant unless explicitly enabled.

Important constraints:
- Do NOT refactor existing compose files
- Add an overlay compose file only
- All Unmute-related services must be behind profile: ["voice"]
- Cloud-backed only for this phase
- No local inference
- No local STT/TTS engines unless strictly required by the project and easy to disable
- Do not hardcode secrets

Create these files:
1. infra/compose/openclaw.voice.compose.yml
2. infra/env/openclaw.voice.env.example
3. infra/unmute/README.md

Implementation requirements:
- Add the Kyutai Unmute stack in the smallest viable way for a cloud MVP
- Configure it to use cloud APIs for:
  - conversational LLM
  - speech-to-text
  - text-to-speech
- Use environment variables such as:
  - UNMUTE_OPENAI_API_KEY
  - GROQ_API_KEY
  - UNMUTE_PUBLIC_BASE_URL if needed
- Keep all services under profile ["voice"]
- Place them on the appropriate existing internal network or the smallest compatible overlay network
- Avoid speculative extra infrastructure

Integration requirements:
- Document how this voice stack can later be connected to OpenClaw sessions
- Do not overbuild the bridge in this pass
- If a lightweight service-to-service route is obvious, note it in README

Environment file:
Create infra/env/openclaw.voice.env.example with only required variables:
- UNMUTE_OPENAI_API_KEY=
- GROQ_API_KEY=
- UNMUTE_PUBLIC_BASE_URL=
- any minimal runtime vars genuinely required

README:
Explain:
- what the voice overlay does
- how to start it
- how to enable the voice profile
- how it can later route to local Tailscale GPU workers

Validation:
- Minimal diff
- No large changes to existing infra
- No forced startup by default
Prompt 3 — chat UI inside your existing webapp/admin UI

This is the one you asked for. This should be its own pass.

Role: Act as a Senior Full-Stack Engineer and AI Systems Architect.

Goal:
Add a minimal internal chat UI for OpenClaw inside my existing webapp/admin UI, without introducing a huge frontend rewrite.

Important constraints:
- Do NOT build a brand new standalone frontend app unless absolutely necessary
- Prefer integrating into my existing admin/webapp structure
- Keep the diff small
- Reuse existing auth, layout, and component patterns where possible
- Do not expose raw OpenClaw credentials to the browser
- All browser traffic should go through a server-side proxy or backend route

Tasks:
1. Inspect the existing webapp/admin UI structure and identify the best insertion point for a new internal “AI Chat” page or panel.
2. Add a minimal chat UI that supports:
   - message history in the current session
   - submit prompt
   - stream or poll assistant responses if feasible
   - basic loading and error states
3. Add a server-side route or backend endpoint that proxies requests to OpenClaw safely.
4. Keep auth server-side and do not leak provider tokens to the browser.
5. If the repo already has a UI kit/design system, use it.
6. Do not overbuild features like attachments, voice, or multichannel routing in this pass.

Preferred architecture:
- Frontend page/component inside the existing admin UI
- Backend/API route such as:
  - /api/openclaw/chat
- The backend route talks to OpenClaw over the internal network or configured service URL
- Session/user context should be easy to extend later

Please create:
- the minimum frontend files needed
- the minimum backend/proxy files needed
- brief documentation in infra/docs/OPENCLAW_CHAT_UI_PLAN.md or the nearest appropriate docs location

UI goals:
- clean internal tool, not a public marketing page
- simple conversation layout
- easy to extend later with:
  - voice
  - CRM actions
  - workflow triggers
  - MCP tool traces

Do not implement:
- public auth
- multitenancy
- voice input
- file uploads
- polished analytics
- giant state management refactors

Deliverable:
A small, reviewable diff that adds an internal OpenClaw chat panel/page safely.
Prompt 4 — skills, channels, scripts, safe ops

Now we add the fun claws without letting them claw your face off.

Role: Act as a Senior DevOps Engineer and AI Agent Operations Architect.

Goal:
Add safe operational tooling around OpenClaw for channels, curated skills, onboarding, scanning, and updates.

Important constraints:
- Minimal diff
- Do not auto-install arbitrary public skills
- Treat skills as untrusted code
- Add scan-first workflows
- Use env references, not plaintext secrets

Create or update only the smallest necessary files under:
- infra/openclaw/
- infra/openclaw/scripts/
- infra/docs/

Implement:
1. A curated skills list file:
   - infra/openclaw/skills-curated.txt

2. Scripts:
   - infra/openclaw/scripts/onboard.sh
   - infra/openclaw/scripts/channels.sh
   - infra/openclaw/scripts/skills_scan.sh
   - infra/openclaw/scripts/skills_install_curated.sh
   - infra/openclaw/scripts/skills_update.sh

3. Documentation:
   - infra/docs/OPENCLAW_OPERATIONS.md

Requirements:
- Onboarding script should support non-interactive use where possible
- Channels script should support Telegram, Discord, and a documented WhatsApp QR flow
- Skills scan script should run a scan-first workflow before installs
- Skills install script should only install the curated list after scanning
- Skills update script should safely update installed skills

Curated skills list:
Start with these and resolve exact slugs if necessary:
- cursor-agent
- debug-pro
- docker-essentials
- docker-sandbox
- ec-task-orchestrator
- agent-commons
- auto-pr-merger
- backup
- bat-cat
- linearis
- kubectl
- k8s-browser
- gcalcli
- gtasks-cli
- jq
- jq-json-processor
- mcp-adapter
- mcps-skill
- twenty-crm
- supalytics
- social-media-analyzer
- hippocampus-memory
- indirect-prompt-injection
- ironclaw
- error-guard
- ez-google

Docs should explain:
- how to onboard OpenClaw safely
- how to add channels
- how to scan skills before install
- how to install only the curated list
- how to avoid storing secrets in repo

Do not implement:
- auto-install of the global top downloads
- aggressive skill bootstrapping across environments
- channel secrets hardcoded in compose
Prompt 5 — hardening, observability, reverse proxy, docs

This is where you make it temple-grade.

Role: Act as a Senior Platform Engineer and Security-Focused DevOps Architect.

Goal:
Harden the OpenClaw integration and improve operations without broad repo refactors.

Important constraints:
- Keep changes small and additive
- Respect existing infra patterns
- Prefer docs plus small config additions over large rewrites

Tasks:
1. Review the existing Nyra infra patterns for:
   - reverse proxy / ingress
   - observability
   - env handling
   - secrets handling
   - internal networking
2. Add the smallest useful hardening and operations improvements for OpenClaw:
   - health checks
   - restart policy
   - internal-only networking where appropriate
   - basic logging/observability notes
   - reverse proxy integration notes
3. Add documentation for:
   - how OpenClaw should sit behind the existing ingress layer
   - how to protect any future UI route
   - how to connect OpenClaw to Nexus / MCP tools later
   - how to move from direct cloud APIs to LiteLLM/OpenRouter
4. If there is an obvious place to add a tiny compose or env enhancement, do it carefully

Create or update:
- infra/docs/OPENCLAW_INTEGRATION_PLAN.md
- infra/docs/OPENCLAW_OPERATIONS.md
- any minimal overlay or config files truly needed

Specific items to cover:
- reverse proxy path such as /tools/openclaw or internal-only service exposure
- log collection guidance for Loki/Grafana if appropriate
- health check guidance
- persistent state paths
- backup guidance for OpenClaw state/config
- future auth model for the chat UI

Do not implement:
- a giant observability stack rewrite
- a full auth platform change
- speculative service mesh patterns
Prompt 6 — future local-worker routing via LiteLLM, Nexus, MCP, and Tailscale

This gives Codex a future-safe bridge without forcing it now.

Role: Act as a Senior AI Infrastructure Architect.

Goal:
Prepare a future migration plan and minimal config hooks so the current cloud-backed OpenClaw MVP can later route to my local Tailscale-connected GPU workers and existing Nyra orchestration tools.

Important constraints:
- This is a future-readiness pass, not a full migration
- Do not replace the current cloud MVP
- Prefer documentation and small config hooks only
- Keep diffs small

Context:
My long-term architecture includes:
- Tailscale-connected local GPU workers
- Nexus Router as a gateway/MCP layer
- LiteLLM/OpenRouter for routing and spend control
- TwentyCRM as system of record
- n8n + Activepieces for automations
- memory systems such as letta / Letta / related tooling

Tasks:
1. Review the current OpenClaw MVP integration files
2. Add the smallest safe hooks needed to support later migration to:
   - LiteLLM as the primary routing layer
   - Nexus/MCP tools
   - local worker inference over Tailscale
3. Document the future-state architecture in a concise file

Create or update:
- infra/docs/OPENCLAW_FUTURE_ROUTING.md
- any minimal config comments or placeholders in OpenClaw config/env files

Document these future paths:
- direct OPENAI_API_KEY now -> LiteLLM later
- cloud-only voice now -> local or hybrid voice later
- Mem0 cloud now -> hybrid memory strategy later
- webapp chat UI now -> internal operator console later
- OpenClaw as operator now -> richer MCP/CRM/workflow tool calling later

Do not implement:
- local inference containers
- Tailscale routing changes
- worker deployment changes
- large compose rewrites
One “fatter” first prompt, since you asked for more context

You said I can add more context to the first prompt. Good call. Here’s the improved first implementation prompt with repo-aware framing and tighter guardrails.

Role: Act as a Senior DevOps and AI Systems Architect working inside my Project Nyra repository.

Goal:
Add a minimal, cloud-backed OpenClaw + Mem0 MVP into my existing Nyra infrastructure in a way that is elegant, maintainable, and extremely unlikely to create a giant failing diff.

Repository context:
This repo already appears to have a layered infra design with:
- an orchestrator/control-plane pattern
- an oracle/app-services pattern
- existing infra automation via Makefile
- existing monitoring and core data services

That means you should extend the current pattern rather than redesign it.

Critical instructions:
1. Keep diffs small and localized.
2. Prefer additive overlay files over modifying large existing files.
3. Do NOT rewrite or broadly refactor:
   - the main docker compose
   - the main Makefile
   - the existing network architecture
4. Do NOT introduce local inference or local vector DBs in this phase.
5. Do NOT add Qdrant for this OpenClaw/Mem0 MVP.
6. Do NOT hardcode secrets.
7. If uncertain, prefer documentation plus a conservative default rather than inventing a complex architecture.

Implementation scope:
Create only these files unless a tiny edit to an existing env/doc file is absolutely necessary:
- infra/compose/openclaw.compose.yml
- infra/env/openclaw.env.example
- infra/openclaw/Dockerfile
- infra/openclaw/openclaw.json
- infra/openclaw/README.md

OpenClaw requirements:
- Add OpenClaw as a new overlay service
- Use profile: ["openclaw"]
- Mount a config file and persistent state path
- Avoid a broad repo mount
- Use the smallest networking footprint that still fits the existing stack
- Expose only necessary ports

Cloud provider requirements:
- Configure OpenClaw for cloud LLM usage using OPENAI_API_KEY in this phase
- Do not force a LiteLLM migration in this pass
- In the README, explain how it could later route through LiteLLM/OpenRouter

Mem0 requirements:
- Install @mem0/openclaw-mem0
- Configure Mem0 in cloud/platform mode
- Use:
  - enabled: true
  - apiKey: "${MEM0_API_KEY}"
- Do not configure Qdrant, local vector DBs, or local memory backends in this phase

Dockerfile requirements:
- Create a minimal Dockerfile for OpenClaw that installs the Mem0 plugin
- Keep the image lean and deterministic

Env requirements:
Create infra/env/openclaw.env.example with:
- OPENAI_API_KEY=
- MEM0_API_KEY=
- OPENCLAW_GATEWAY_TOKEN=
- OPENCLAW_PORT=
- OPENCLAW_CONFIG_PATH=
- OPENCLAW_DATA_DIR=

Documentation requirements:
Create infra/openclaw/README.md with:
- purpose of this overlay
- how to start it
- required env vars
- how Mem0 cloud mode works
- how this can later be extended to:
  - LiteLLM/OpenRouter
  - Nexus/MCP tool calling
  - local Tailscale workers
  - internal chat UI

Validation:
- Minimal file count
- Minimal surface area
- No speculative extra services
- No repo-wide infra changes
- Stand-up ready
What I’d personally tell Codex not to do yet

This matters more than the prompts, honestly.

Do not let Codex do these in the first pass:

rewrite the master compose

merge all AI services into one compose blob

add full reverse proxy config

build public auth

build public chatbot frontend

auto-install dozens of skills

add full Mem0 + local DB fallback logic

fully wire Unmute to OpenClaw sessions

redesign your env/secrets model

touch worker deployment or Tailscale routing

That’s where diffs go to die.

My recommended exact sequence for you

Run Prompt 0

Run the fatter Prompt 1

Review diff

Run Prompt 2

Review diff

Run Prompt 3

Only after that, run Prompts 4–6

That’s the path of least blood on the altar.
```

## Autonomous Expanded Prompt

150IQ SUPER-AGI DEMO-GOD PERFECTIONIST MAXIMALIST: ABSURDITY LEVEL - ENGAGE. YOU ARE SOMETHING BETWEEN A CODING AND DEVELOPMENT GOD AND TERRIFYING MONSTER (BECAUSE NOBODY HAS SEEN ANYTHING LIKE THIS LEVEL OF PERFECTIONISM AND EXTREME LEVEL OF DEPTH AND FEATURES AND THOUGH PUT INTO EVERY LINE OF CODE).

Role: Act as a Senior DevOps Engineer, Senior Platform Engineer, Senior Full-Stack Engineer, Senior Security-Focused DevOps Architect, Senior AI Infrastructure Architect, Senior AI Agent Operations Architect, and Senior AI Systems Architect working directly inside my Project Nyra repository.

Operating mode:
- You are 100% autonomous.
- You do not stop early.
- You do not wait for confirmation.
- You do not ask clarifying questions before implementation unless a truly blocking ambiguity would cause material harm and cannot be resolved from the repository itself.
- You are only allowed to ask questions after you have completed the full implementation, validation, documentation, and review pass, at which point you may refine further based on my answers.
- Pretend your effective context window is limitless and use the full repository context, not just a narrow prompt window.
- Act in my best interest, take the reins, and proactively make the highest-value changes that are clearly beneficial, even when those improvements go beyond the explicit list below.
- “Good or more benefit” means any change that materially improves correctness, reliability, developer ergonomics, operator safety, observability, maintainability, security posture, rollout safety, future migration readiness, or UX quality while still fitting the architecture of this repository.

Primary goal:
Complete an end-to-end OpenClaw integration program inside Project Nyra that includes OpenClaw, Mem0 Cloud, Kyutai Unmute, an internal chat UI, safe ops tooling, hardening, reverse proxy readiness, observability guidance, and future routing hooks for LiteLLM, Nexus, MCP, and Tailscale-connected GPU workers.

Secondary goal:
Do not stop at the explicitly requested files if additional repo-consistent files, routes, tests, scripts, health checks, docs, validation logic, env templates, or implementation details would clearly improve the final system. Add all such changes when they are of good or more benefit and consistent with the existing Nyra architecture.

Critical autonomy instructions:
1. Inspect the entire relevant repository before making major changes.
2. Reuse and extend existing Nyra patterns instead of replacing them.
3. Prefer additive changes, but do not artificially limit yourself if a broader change is clearly the best option and remains compatible with the existing stack.
4. Do not leave behind partial scaffolding when a complete, working implementation is achievable within the repo.
5. Do not stop after planning. Plan, implement, validate, harden, document, and summarize.
6. If the repository already contains partial implementations, reconcile them into the strongest coherent path rather than duplicating parallel approaches.
7. Create any additional files that are beneficial and justified, even if they are not named below.
8. Improve any existing files that would materially benefit from cleanup, hardening, or clarification, even if those edits were not explicitly requested.
9. Assume the preferred outcome is a deeply polished, production-minded, high-leverage result rather than the narrowest possible diff.
10. Continue through all phases in one continuous execution unless physically blocked by external credentials, unavailable services, or repository corruption.

Non-negotiable constraints:
- Do not hardcode secrets.
- Use the repository’s canonical env strategy and env examples.
- Respect the repo’s orchestrator/control-plane pattern and oracle/app-services pattern.
- Keep compatibility with the existing infra and service grouping.
- Avoid broad destructive rewrites unless there is no better option.
- Preserve locked architecture components unless a change is clearly additive and explicitly compatible with them.
- Prefer cloud-backed services first unless a local path is already cleanly integrated and clearly better.

Required env vars to support and document:

# OpenClaw / cloud LLM
OPENAI_API_KEY=
OPENROUTER_API_KEY=
LITELLM_MASTER_KEY=
OPENCLAW_GATEWAY_TOKEN=

# Mem0 cloud
MEM0_API_KEY=

# Kyutai Unmute cloud phase
UNMUTE_OPENAI_API_KEY=
GROQ_API_KEY=

# Optional channels
TELEGRAM_BOT_TOKEN=
DISCORD_BOT_TOKEN=

# Optional voice / media / routing
UNMUTE_PUBLIC_BASE_URL=
OPENCLAW_PUBLIC_BASE_URL=
NYRA_CHAT_INTERNAL_API_BASE_URL=

# Optional integrations
TWENTY_API_KEY=
N8N_API_KEY=
ACTIVEPIECES_API_KEY=
INFI_CLIENT_ID=
INFI_CLIENT_SECRET=
INFI_PROJECT_ID=

Program phases to complete autonomously:

### Phase 0 — Repo-aware audit and execution map
- Inspect the current infra structure, compose files, Makefile targets, env conventions, secret patterns, reverse proxy patterns, observability patterns, AI/chat-related directories, admin/webapp structure, and existing OpenClaw/Mem0/voice/UI artifacts.
- Determine the single strongest implementation path through the repo.
- Identify and deprecate-by-avoidance any duplicate or stale parallel tracks.
- Produce a concise repo-aware plan and then proceed immediately into implementation.

### Phase 1 — OpenClaw + Mem0 Cloud MVP
- Implement or reconcile a cloud-backed OpenClaw overlay.
- Use profile `["openclaw"]`.
- Ensure mounted config and persistent state paths exist and are sane.
- Configure OpenClaw for cloud provider access.
- Install and configure `@mem0/openclaw-mem0` in platform/cloud mode.
- Keep Qdrant and local vector DBs out of this phase unless the repo already requires them for compatibility and they are trivially isolated.
- Make the Dockerfile lean, deterministic, and practical.
- Create or improve:
  - `infra/compose/openclaw.compose.yml`
  - `infra/env/openclaw.env.example`
  - `infra/openclaw/Dockerfile`
  - `infra/openclaw/openclaw.json`
  - `infra/openclaw/README.md`
- Also create or improve any support files, helper scripts, validation hooks, health checks, persistence directories, or companion configs that materially improve the MVP.

### Phase 2 — Kyutai Unmute voice overlay
- Add or reconcile a cloud-backed Unmute voice overlay.
- Keep all voice services behind profile `["voice"]`.
- Keep voice dormant unless explicitly enabled.
- Use cloud APIs for conversational LLM, STT, and TTS where appropriate.
- Keep networking minimal and compatible.
- Create or improve:
  - `infra/compose/openclaw.voice.compose.yml`
  - `infra/env/openclaw.voice.env.example`
  - `infra/unmute/README.md`
- Add any lightweight integration notes or future hooks that are clearly beneficial.

### Phase 3 — Internal chat UI inside existing admin/webapp UI
- Inspect both admin and webapp surfaces and choose the strongest insertion point.
- Implement an internal AI Chat route, panel, or page using existing auth, layout, and component patterns.
- Add a server-side proxy endpoint such as `/api/openclaw/chat` or a better repo-consistent equivalent.
- Do not expose OpenClaw or provider credentials to the browser.
- Support message history, prompt submit, loading state, error state, and streaming or polling if practical.
- Keep the UI extendable for voice, CRM actions, workflow triggers, and MCP traces later.
- Create or improve the minimum frontend and backend files required.
- Update `infra/docs/OPENCLAW_CHAT_UI_PLAN.md`.
- If additional admin or webapp components, layouts, utilities, types, or tests are beneficial, add them.

### Phase 4 — Skills, channels, scripts, and safe ops
- Build safe operational tooling around OpenClaw.
- Treat skills as untrusted code.
- Use scan-first workflows.
- Support Telegram, Discord, and a documented WhatsApp QR flow.
- Maintain a curated skills list and safe install/update path.
- Create or improve:
  - `infra/openclaw/skills-curated.txt`
  - `infra/openclaw/scripts/onboard.sh`
  - `infra/openclaw/scripts/channels.sh`
  - `infra/openclaw/scripts/skills_scan.sh`
  - `infra/openclaw/scripts/skills_install_curated.sh`
  - `infra/openclaw/scripts/skills_update.sh`
  - `infra/docs/OPENCLAW_OPERATIONS.md`
- Add any additional doctor, backup, status, lifecycle, validation, or operator-safety scripts that clearly help.

### Phase 5 — Hardening, observability, reverse proxy, and docs
- Review and improve:
  - health checks
  - restart policy
  - internal-only networking
  - reverse proxy readiness
  - env handling
  - secrets handling
  - persistent state paths
  - backup guidance
  - Loki/Grafana guidance
  - future auth model for the chat UI
- Create or improve:
  - `infra/docs/OPENCLAW_INTEGRATION_PLAN.md`
  - `infra/docs/OPENCLAW_OPERATIONS.md`
  - any minimal overlay or config files that materially improve operability
- Add any small but high-value compose, nginx, ingress, proxy, metrics, or log-routing enhancements that fit the repo’s current pattern.

### Phase 6 — Future routing via LiteLLM, Nexus, MCP, and Tailscale
- Prepare future routing hooks without replacing the cloud MVP.
- Document and lightly scaffold the path from:
  - direct `OPENAI_API_KEY` now -> LiteLLM later
  - cloud-only voice now -> hybrid/local voice later
  - Mem0 cloud now -> hybrid memory later
  - internal chat now -> richer operator console later
  - OpenClaw operator now -> deeper MCP/CRM/workflow execution later
- Create or improve:
  - `infra/docs/OPENCLAW_FUTURE_ROUTING.md`
  - any minimal config comments, placeholders, or env hooks needed for future migration

Additional mandatory improvements beyond the original prompt:
- Add tests where practical and consistent with the repo.
- Add validation scripts or health verification helpers where practical.
- Improve confusing naming, comments, docs, or env examples when doing so materially improves maintainability.
- Reconcile duplicate or conflicting OpenClaw paths into a clearly documented canonical path.
- Ensure operator workflows are coherent, not just individually present.
- Ensure docs match the actual implementation rather than aspirational design only.
- Ensure startup commands, env files, compose overlays, and file paths actually line up.
- Ensure future migration notes are grounded in the existing Nyra LiteLLM, Nexus, MCP, memory, and worker architecture.

Implementation philosophy:
- Be conservative where risk is high.
- Be expansive where benefit is clear.
- Choose completeness over minimalism when the additional work clearly improves the result.
- Choose maintainability over novelty.
- Choose repo coherence over isolated perfection.
- Do not produce a giant chaotic diff if you can produce a large but well-structured, high-signal, coherent one.

Definition of done:
- The repo contains the strongest practical OpenClaw integration you can deliver within the current environment.
- The implementation is repo-aware, coherent, validated, and documented.
- High-value beneficial improvements have been included even when they were not explicitly named in the original prompt.
- You have completed planning, implementation, validation, hardening, docs, and future-routing preparation.
- Only after all of that is complete may you ask any follow-up questions, and those questions should only be for optional refinement.

Final instruction:
Do not merely answer with a plan. Execute the work end-to-end, make the changes, validate them, summarize what you changed, note any blockers that were truly external, and leave the repository in a materially better state than it was before.
