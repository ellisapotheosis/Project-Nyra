# Claude-Flow playbook for Project Nyra

This document tells you *exactly* how to use claude-flow in the Nyra repo.

## 1) Initialization (repo root)

```bash
npx --y claude-flow@alpha init --sparc
```

Then create/curate your root `CLAUDE.md`:
- logistics-only borrower assistant guardrails
- tool allowlists (borrower vs ops vs dev)
- repo structure conventions
- “never commit secrets” reminders

Claude-Flow provides a template collection for CLAUDE.md by project type. Use it as a base, then harden for finance. (See template wiki.) 

## 2) Swarm setup for parallel work

Use `swarm init` to create a swarm topology. For Nyra, use **hierarchical**:
- architect -> backend -> frontend -> qa/ci

Example:
```bash
claude-flow swarm init --topology hierarchical --max-agents 8 --name "nyra-dev" --memory-pool 256
```

## 3) Orchestrate multi-step workflows

Use workflow orchestration strategies:
- parallel for independent tasks (UI vs API)
- sequential for migrations

Example (parallel):
```bash
npx claude-flow task orchestrate --task "Implement Quote API + Nyra Admin skeleton" --strategy parallel --max-concurrent 6
```

Claude-Flow supports stream-json chaining, enabling agent outputs to pipe into dependent agents. This is ideal for “architect -> coder -> reviewer” loops.

## 4) Spawn specialist agents

```bash
claude-flow agent spawn backend-dev --task "Implement FastAPI quote endpoints" --capabilities "python,fastapi,testing" --priority high --memory-access read-write
claude-flow agent spawn frontend-dev --task "Build nyra-admin campaigns UI in shadcn" --capabilities "nextjs,shadcn,tailwind" --priority high --memory-access read-write
```

## 5) Use claude-flow memory (optional — not your primary memory)

Claude-Flow includes a key/value memory facility for lightweight coordination.
Your *durable* memory is Graphiti + Letta, but claude-flow memory can store “current sprint decisions”.

```bash
claude-flow memory usage --action store --key "stack" --value '{"router":"nexus","workflow":"n8n+activepieces"}' --namespace "decisions" --ttl 86400
```

## 6) Telemetry (recommended)

Enable token tracking for cost visibility in non-interactive/batch mode:
```bash
./claude-flow analysis setup-telemetry
./claude-flow analysis token-usage --breakdown --cost-analysis
```

## References
- Claude-Flow API Reference (swarm, agent, memory): https://raw.githubusercontent.com/wiki/ruvnet/claude-flow/API-Reference.md
- Workflow orchestration + stream-json chaining: https://raw.githubusercontent.com/wiki/ruvnet/claude-flow/Workflow-Orchestration.md
- Telemetry/token tracking: https://raw.githubusercontent.com/wiki/ruvnet/claude-flow/Token-Tracking-Telemetry.md
- CLAUDE.md templates collection: https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates
