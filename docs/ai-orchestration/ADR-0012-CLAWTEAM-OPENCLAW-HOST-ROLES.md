# ADR-0012: ClawTeam, OpenClaw, and host roles

**Status:** Accepted for the current deployment phase
**Date:** 2026-09-04

## Decision

- `worker-rtx5090` runs the single ClawTeam primary.
- `orchestrator` remains an active execution node for Codex CLI, Claude Code,
  agent adapters, worktrees, queues, and coordination services.
- `worker-rtx5090` runs ClawTeam, OpenClaw, and Nerve together as the local
  assistant/GPU node.
- `oracle-vps` remains the shared platform plane for MCP aggregation, memory,
  databases, LiteLLM/OmniRoute, applications, and public/private ingress.
- Oracle must not run a second ClawTeam primary. Its legacy ClawTeam compose
  definition is profile-gated pending a verified node/replica protocol.

## Rationale

ClawTeam coordinates heterogeneous execution targets and therefore belongs on
the control/execution node, where local Codex and Claude Code processes,
worktrees, and callbacks are available. OpenClaw and Nerve benefit from local
co-location on the GPU worker because their UI and gateway traffic remain
local. Oracle already carries the shared data and ingress blast radius; adding
the coordinator there would couple coordination failure to the platform plane.

The worker's Docker engine reports approximately 48 GiB, while the
orchestrator's engine reports approximately 7.75 GiB. ClawTeam is therefore
bounded to 4 GB with a 2 GB reservation on the worker. The environment value
is an application hint; the Compose `deploy.resources` limit is the actual
container memory guard.

## Routing contract

```text
Nerve/OpenClaw/ClawTeam on worker-rtx5090
  -> orchestrator for Codex/Claude execution nodes and callbacks
  -> LiteLLM and MCP services on oracle-vps over Tailscale
  -> GPU workers, OmniRoute, or OpenRouter according to LiteLLM policy
```

The OpenClaw gateway does not move to the orchestrator merely because
ClawTeam is hosted there. A future centralized OpenClaw decision would be a
separate ADR and must include state, plugin, channel, and gateway ownership
migration.
