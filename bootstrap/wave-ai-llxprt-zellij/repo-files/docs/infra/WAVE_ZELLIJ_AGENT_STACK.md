# WaveTerm, Zellij, and Agent Stack

## Commands

```bash
scripts/setup-wave-llxprt-bootstrap.sh
make llxprt-oracle-subscription-up
make wave-stack-up
make wave-stack-up-3060
make wave-only
make wave-only-3060
make wave-stack-status
```

`wave-stack-up` starts the default orchestrator, RTX5090, RTX3090Ti, Oracle
memory, Twenty/webapp, Portainer, MCP tools, and a persistent Zellij cockpit.
`wave-stack-up-3060` adds the RTX3060 OpenClaw/Ollama lane.

`wave-only` and `wave-only-3060` do not start containers. They only install the
Wave/LLxprt config files and attach to the persistent local Zellij cockpit.

## Routing Model

LLxprt does not keep SSH sessions alive by itself. The durable layers are:

- WaveTerm: terminal UI, AI modes, SSH connections, and remote durable sessions.
- Zellij: local persistent cockpit session and pane layout.
- LLxprt Code: provider/model/profile runtime for subscription, API-key, and local endpoints.
- LLxprt Jefe: multi-agent control plane backed by tmux sessions.
- Letta: stack orchestrator and memory-manager agent, consuming HTTP routes.

The intended control path is:

```text
Wave/Zellij panes
  -> llxprt-code and llxprt-jefe profiles
  -> llxprt-bridge at http://127.0.0.1:8090/v1 for subscription-backed capacity
  -> Nexus/LiteLLM on orchestrator for local model/tool routing
  -> OpenClaw/NerveUI on worker-rtx5090 and worker-rtx3090ti
  -> worker-rtx3060 for Ollama embeddings, extraction, summarization, and optional OpenClaw
```

LiteLLM can route to LLxprt only through the `llxprt-bridge` OpenAI-compatible
HTTP shim. LLxprt can also call LiteLLM/Nexus directly through the
`nyra-local-nexus` profile. Do not treat LLxprt profiles as Docker/network
orchestration; the Makefile and Docker contexts own container startup.

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
config/agents/llxprt-profiles/*.json
config/agents/letta-stack-orchestrator.json
```

Subscription profiles are installed to `~/.llxprt/profiles` by
`scripts/setup-wave-llxprt-bootstrap.sh`.

```text
nyra-subscription-ha
nyra-subscription-spread
nyra-cli-triad-ha
nyra-codex-oauth
nyra-gemini-oauth
nyra-claude-oauth
nyra-qwen-oauth
nyra-kimi-reasoning
nyra-openrouter-free
```

Local profiles route through LiteLLM or directly to Tailscale-only worker model
endpoints:

```text
nyra-local-nexus
nyra-local-workers
nyra-worker-5090
nyra-worker-3090ti
nyra-worker-3060
nyra-worker-3060-embeddings
```

See `docs/infra/WAVE_LLXPRT_BOOTSTRAP_PACKAGE.md` for the package inventory,
auth commands, WaveTerm presets, and validation checks.

## Letta Role

Letta is configured as the stack orchestrator and memory-manager agent. It should
coordinate subscription agents, LLxprt free/subscription agents, OpenClaw agents,
and local worker models through Nexus/LiteLLM rather than exposing worker model
ports publicly.

Letta should prefer these routes:

```text
subscription capacity: http://127.0.0.1:8090/v1 model=nyra-cli-triad-ha
private local routing: https://nexus.trex-fiordland.ts.net/v1 model=nyra-auto
worker direct diagnostics: worker profiles only over Tailscale MagicDNS
```

RTX3060 should stay a utility/background lane by default: Ollama embeddings,
memory extraction, summarization, and routing support. The `make
wave-stack-up-3060` target enables its optional OpenClaw/NerveUI tab.

## Secrets

The Makefile uses Docker contexts and `--env-file /dev/null` so per-host compose
stacks consume the active environment and Infisical sidecars instead of checked
in `.env` files.

The repo-secret contract is documented in:

```text
config/agents/llxprt-env.example
```

Store actual values in Infisical, OS keyrings, or Wave secrets. For Wave secrets,
use:

```bash
wsh secret set LLXPRT_BRIDGE_API_KEY=...
wsh secret set NEXUS_MASTER_KEY=...
wsh secret set NYRA_WORKER_API_KEY=...
wsh secret set OPENROUTER_KEY=...
wsh secret set GROQ_KEY=...
```

Inside LLxprt, run:

```text
/auth codex enable
/auth anthropic enable
/auth gemini enable
/auth qwen enable
/key save kimi <kimi-api-key>
/key save openrouter <openrouter-api-key>
/key save nyra-nexus <nexus-key-or-placeholder>
/key save nyra-worker <worker-key-or-placeholder>
```

## Researched Package Surface

Current registry/docs research found these useful LLxprt packages:

- `@vybestack/llxprt-code`: main CLI package.
- `@vybestack/llxprt-code-core`: core package published with the CLI.
- `@vybestack/llxprt-code-lsp`: LSP service package.
- `@vybestack/llxprt-ui`: experimental terminal UI package.

Provider aliases verified in LLxprt docs include `codex`, `anthropic`,
`gemini`, `qwen`, `kimi`, `openrouter`, `fireworks`, `mistral`,
`cerebras-code`, `lm-studio`, and `llama-cpp`. The repo only enables profiles
we can route cleanly today; add more after confirming API keys, model names, and
quota behavior.
