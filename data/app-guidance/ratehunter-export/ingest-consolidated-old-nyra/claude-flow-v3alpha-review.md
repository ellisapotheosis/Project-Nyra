# Claude-Flow v3alpha — what’s actually new (and what to care about)

## The big shift

Claude-Flow v3 is being shipped as a **modular set of packages** (not one giant blob). The GitHub repo documents the v3 package split and shows a dedicated `@claude-flow/cli` package (plus many others) used as building blocks.  

The v3 pre-release notes (Alpha 79) call out a **documentation overhaul** and a bunch of systems that matter for real deployments:

- Helper scripts (30+ automation tools)
- 50+ environment variables + example `.env`
- Configuration reference + JSON schema + dev/prod/CI configs
- Migration guide (v2 → v3)
- Skills system (42+ workflows)
- Claims system (work coordination)
- Intelligent routing (Q-learning)
- Programmatic SDK examples across `@claude-flow/*`
- “Flow Nexus” cloud platform integration
- Stream-chain (multi-agent pipelines)
- Pair programming (driver/navigator modes)

## Modules / packages you’ll actually use in Project-Nyra

From the repo’s v3 package list, the ones that matter most for you:

- `@claude-flow/core` — base runtime
- `@claude-flow/cli` — the CLI that `claude-flow` delegates to
- `@claude-flow/memory` — memory backends/adapters
- `@claude-flow/swarm` — swarm orchestration + coordination
- `@claude-flow/agents` — agent definitions
- `@claude-flow/mcp` + `@claude-flow/mcp-tools` — MCP server + exposed tool suite
- `@claude-flow/providers` — LLM provider integrations
- `@claude-flow/workflow` — workflow primitives for automation
- `@claude-flow/router` — routing logic
- `@claude-flow/analysis` — metrics/analytics primitives
- `@claude-flow/integrations` — where third-party hooks usually live

If you’re building a product (Nyra webapp), treat Claude-Flow as **two layers**:

1) **Runtime services** (MCP server + memory + routing)
2) **Your app** (web UI, CRM integration, workflows)

## Known sharp edges

- There has been at least one reported packaging issue where `@claude-flow/cli` had an output path mismatch (`dist/index.js` vs `dist/src/index.js`), breaking `npx` usage for some versions. Pin to a known-good alpha and upgrade once stable.

## How I recommend you run it

### Dev

- Run Claude-Flow locally (npx) in the repo
- Use default local memory for speed
- Turn on RuVector Postgres only when you need multi-machine shared memory

### Prod

- Run Claude-Flow MCP server as a container
- Put memory in **RuVector Postgres** (single source of truth)
- Put model calls behind **LiteLLM**
- Expose only what you must through **Cloudflare Tunnel**
- Keep admin paths only on **Tailscale**
