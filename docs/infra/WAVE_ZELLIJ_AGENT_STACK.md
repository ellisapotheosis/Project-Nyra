# WaveTerm, Zellij, and Agent Stack

## Commands

```bash
make wave-stack-up
make wave-stack-up-3060
make wave-only
make wave-only-3060
make wave-stack-status
```

`wave-stack-up` starts the default orchestrator, RTX5090, RTX3090Ti, Oracle
memory, Twenty/webapp, Portainer, MCP tools, and a persistent Zellij cockpit.
`wave-stack-up-3060` adds the RTX3060 OpenClaw/Ollama lane.

## Persistent Terminal State

Zellij keeps the session alive after terminal disconnects. Each pane is launched
through `scripts/nyra-zellij-pane.sh`, which appends command and terminal
transcript logs under:

```text
~/.nyra/zellij-history/
```

WaveTerm config is generated under:

```text
~/.config/waveterm/
```

## Agent Profiles

Profiles live in:

```text
config/agents/llxprt-profiles.json
config/agents/letta-stack-orchestrator.json
```

Subscription profiles route through the LLxprt bridge:

```text
nyra-codex-subscription
nyra-gemini-subscription
nyra-claude-subscription
```

Local profiles route through LiteLLM or directly to Tailscale-only worker model
endpoints:

```text
nyra-local-cluster
worker-rtx5090
worker-rtx3090ti
worker-rtx3060
```

## Letta Role

Letta is configured as the stack orchestrator and memory-manager agent. It should
coordinate subscription agents, LLxprt free/subscription agents, OpenClaw agents,
and local worker models through Nexus/LiteLLM rather than exposing worker model
ports publicly.

## Secrets

The Makefile uses Docker contexts and `--env-file /dev/null` so per-host compose
stacks consume the active environment and Infisical sidecars instead of checked
in `.env` files.
