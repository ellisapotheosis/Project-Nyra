# Prompt 05 — Observability, Git/Gitea, DevOps Tooling

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Create/update non-UI observability, Gitea/Git automation, MCP repository tooling docs, and dev-agent workflow conventions. Do not touch UI/theme/components.

OBSERVABILITY STACK:
- Prometheus
- Loki
- Grafana if present/intended for observability
- cAdvisor
- node-exporter
- gpu-exporter
- promtail
- health-monitor
- Portainer CE+agent on orchestrator; Portainer agents on other hosts
- Syncthing on all hosts

GIT/DEV STACK:
- Gitea + Gitea DB on Oracle
- Git MCP
- GitHub MCP
- Gitea MCP where appropriate
- Tea CLI for deterministic Gitea issue/PR/release/repo automation
- llxprt-jefe + llxprt-code for subscription usage of gemini-cli, claude-code CLI, codex-cli
- WaveTerm/Wave AI + zellij for three subscription agents + Letta orchestrator + OpenClaw sessions

REQUIRED ACTIONS:
1. Create docs/ops/OBSERVABILITY_STACK.md.
2. Create docs/ops/METRICS_AND_LOGGING_CONVENTIONS.md.
3. Create docs/ops/GITEA_TEA_MCP_STRATEGY.md with this rule: Tea is a CLI, not MCP. Use Gitea MCP for MCP-native repository operations. Use Git over SSH/HTTPS for normal code operations. Use Git MCP for local repo operations if safer.
4. Create docs/ops/DEV_AGENT_TERMINAL_TOPOLOGY.md for WaveTerm/zellij/llxprt-jefe/llxprt-code/gemini-cli/claude-code/codex-cli.
5. Define monitoring labels for host, service, role, worker capability, GPU, model, stack, compose profile.
6. Define alert classes: secret-missing, tunnel-down, tailscale-down, worker-offline, GPU-hot, Redis-down, Qdrant-down, Letta-down, OpenClaw-down, Nerve-down, Twenty-sync-failed, STOP-not-processed, outbound-blocked, quote-engine-degraded.
7. Add healthcheck scripts for service endpoints where safe.
8. Add no-secrets scanning script if absent.
9. Add Gitea automation examples using Tea CLI and Gitea MCP config examples using placeholders only.
10. Add docs for which tool to use:
    - `git` for commits/branches/push/pull.
    - `tea` for Gitea issues/PRs/releases/repos in shell scripts and deterministic agent runs.
    - `gitea-mcp` for natural-language repository operations in MCP clients.
    - `github-mcp` only for GitHub mirrors/integrations.

FINAL RESPONSE:
Files changed, commands run, observability gaps, Gitea tooling recommendation, next steps.
```
