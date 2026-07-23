# Development Stack — Operator Experience Layer

Portable, non-secret operator configuration for the Nyra stack. This directory
is the source-controlled developer-experience layer: Wave apps, terminal
layouts, LLxprt profile manifests, Letta agent import manifests, MCP client
templates, and installation/validation guidance. It is deliberately separate
from product applications (`apps/`) and from host runtime definitions
(`infra/hosts/<host>/`).

## Source

Curated from `DEVELOPMENT_STACK_175IQ_FASTSTART` (the bootstrap package at
`~/repos/DEVELOPMENT_STACK_175IQ_FASTSTART`). Runtime material that is already
owned by the live repository, or that would create an impermissible parallel
runtime, is intentionally NOT copied here. See
`bootstrap/.../REPO_INTEGRATION_DECISION.md` for the full disposition table.

## Layout

```
development/
  README.md                 # this file
  waveapps/                 # curated Wave app sources + authoring prompts
  workstation/
    zellij/                 # portable layouts
    waveterm/               # settings, presets, themes, WaveAI definitions
    jefe/                   # non-secret Jefe settings + themes
    systemd/user/           # user-unit templates only
  llxprt/
    profiles/               # reviewed profile manifests (installed to ~/.llxprt/profiles)
    providers/              # non-secret provider config templates
    subagents/              # reviewed subagent manifests
    commands/               # reusable LLxprt command definitions
  letta/
    agents/                 # importable agent manifests
    mcp/                    # Letta/MCP integration notes + client templates
  mcp/clients/              # local MCP-client templates, never credentials
  docs/                     # operator runbooks + compatibility decisions
```

## Status (2026-07-22)

- LLxprt profiles/subagents/commands/providers: installed to `~/.llxprt/` via
  bootstrap `apply-llxprt-profiles.sh`. (Source manifests to be mirrored here.)
- Wave Terminal configs: deployed to `~/.config/waveterm/` for host
  `worker-rtx5090` (cyberpunk-neon theme) via bootstrap `setup-wave-configs.sh`.
- Hermes: configured at `C:\Users\edane\.hermes` to route through the central
  LiteLLM gateway (`https://litellm.projectnyra.com`) with Cloudflare Access
  Service Token headers. See AGENTS.md for the agent-runtime contract.
- Memory/MCP/Infisical-Agent-Vault/OpenClaw: being wired by parallel
  setup workstreams; verified endpoint paths to be recorded under `docs/`.

## Rules

- Never commit credentials or `.env` files. Secrets live in Infisical
  (project `8374cea9-...`, env `prod`) or machine keyrings.
- Scripts here must wrap or improve existing Makefile/host targets; they must
  NOT start a second Compose stack and must not contain `docker compose`
  except when delegating to a repo Makefile target under `infra/hosts/`.
- Port/rewrite bootstrap scripts one at a time; validate with `git diff
  --check` + dry-run + the relevant Makefile health target before marking
  active.
