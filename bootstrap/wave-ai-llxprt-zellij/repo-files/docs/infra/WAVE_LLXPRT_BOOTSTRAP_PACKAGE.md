# Wave AI + Zellij + LLxprt Bootstrap Package

This package turns Project Nyra into a WaveTerm-first operator cockpit for:

- Wave AI modes backed by Nexus, Letta, LLxprt bridge, and worker endpoints.
- Zellij durable terminal sessions.
- LLxprt Code profiles for subscription-backed failover and short-task spreading.
- LLxprt Jefe as the multi-agent terminal control plane.
- OpenClaw or PicoClaw worker lanes on the GPU machines.

## Installed Surfaces

Run:

```bash
scripts/setup-wave-llxprt-bootstrap.sh
```

The bootstrap writes:

```text
~/.config/waveterm/settings.json
~/.config/waveterm/waveai.json
~/.config/waveterm/keybindings.json
~/.config/waveterm/termthemes/orchestrator-cyberpunk-neon.json
~/.config/waveterm/presets/presets.json
~/.llxprt/profiles/*.json
~/.llxprt/settings.project-nyra.bootstrap.json
~/.llxprt/nyra-auth.todo
```

The repo sources are:

```text
LLXPRT.md
config/agents/llxprt-settings.project-nyra.json
config/agents/llxprt-env.example
config/agents/llxprt-profiles/*.json
infra/configs/waveterm/*.json
infra/configs/zellij/nyra-wave-ai*.kdl
scripts/setup-wave-configs.sh
scripts/setup-wave-llxprt-bootstrap.sh
```

## Default Control Flow

Use this default path for long-running work:

```text
WaveTerm -> Zellij -> Jefe -> LLxprt Code profile nyra-subscription-ha -> provider failover
Wave AI -> Nexus -> Letta orchestrator -> MCP/tools/workers/OpenClaw
```

`nyra-subscription-ha` is the default LLxprt profile because failover keeps a single provider active until it actually fails. That preserves provider-side prompt caching better than round-robin.

Use `nyra-subscription-spread` for short, independent parallel work only.

Letta should consume subscription-backed capacity through the local
OpenAI-compatible `llxprt-bridge`:

```text
http://127.0.0.1:8090/v1
model: nyra-cli-triad-ha
```

Use Nexus/LiteLLM for local worker routing:

```text
http://orchestrator.trex-fiordland.ts.net:6000/v1
model: nyra-auto
```

LLxprt can call LiteLLM/Nexus directly through `nyra-local-nexus`; LiteLLM can
call LLxprt only through the bridge. LLxprt itself is not a host/session
manager; WaveTerm, Zellij, Jefe, and the Makefile own terminal and container
orchestration.

## LLxprt Profiles

Profile files are installed to `~/.llxprt/profiles`:

```text
nyra-subscription-ha.json
nyra-subscription-spread.json
nyra-cli-triad-ha.json
nyra-codex-oauth.json
nyra-claude-oauth.json
nyra-gemini-oauth.json
nyra-qwen-oauth.json
nyra-kimi-reasoning.json
nyra-openrouter-free.json
nyra-local-nexus.json
nyra-local-workers.json
nyra-worker-5090.json
nyra-worker-3090ti.json
nyra-worker-3060.json
nyra-worker-3060-embeddings.json
```

Provider auth is intentionally not stored in this repo. Run these interactively once inside LLxprt:

```text
/auth codex enable
/auth anthropic enable
/auth gemini enable
/auth qwen enable
/key save kimi <kimi-api-key>
/key save openrouter <openrouter-api-key>
/key save nyra-nexus <nexus-api-key-or-local-placeholder>
/key save nyra-worker <worker-api-key-or-local-placeholder>
```

For multiple-account failover, use named OAuth buckets:

```text
/auth codex login personal@example.com
/auth anthropic login claude-main@example.com
/auth gemini login gmail-main@example.com
```

Then save provider profiles with those bucket labels if you want account-by-account ordering.

## WaveTerm Presets

Installed presets:

- `nyra-mission-control`: default Jefe + LLxprt HA + Zellij + bridge health.
- `nyra-provider-auth`: interactive LLxprt OAuth/keyring setup.
- `nyra-openclaw-topology`: worker OpenClaw/PicoClaw logs.
- `nyra-cluster-health`: Docker context, Nexus, and GPU status.

Keybindings:

- `Cmd+Shift+C`: mission control.
- `Cmd+Shift+D`: provider auth.
- `Cmd+Shift+L`: OpenClaw topology.
- `Cmd+Shift+M`: cluster health.
- `Cmd+Shift+E`: Wave AI sidebar.

## Launch Commands

```bash
scripts/run-llxprt-code.sh --profile-load nyra-subscription-ha
scripts/run-llxprt-code.sh --profile-load nyra-subscription-spread
scripts/run-llxprt-jefe.sh
NYRA_INCLUDE_3060=1 scripts/nyra-wave-zellij.sh
make wave-stack-up
make wave-stack-up-3060
```

## Research Notes

Current LLxprt Code docs support:

- OAuth for Gemini, Anthropic, Codex, and Qwen.
- Keyring storage for API keys.
- Model profiles and load-balancer profiles.
- Provider aliases including Codex, Anthropic, Gemini, Qwen, Kimi, OpenRouter, Fireworks, Mistral, Cerebras, LM Studio, and llama.cpp.
- Failover and round-robin profile policies.
- Round-robin for deliberate request spreading.
- Project settings in `.llxprt/settings.json`.
- Subagent concurrency controls.

Current npm registry research found:

- `@vybestack/llxprt-code`: main CLI, latest `0.9.3` when checked on 2026-05-19.
- `@vybestack/llxprt-code-core`: core package, latest `0.9.3` when checked.
- `@vybestack/llxprt-code-lsp`: LSP service package, latest `0.9.3` when checked.
- `@vybestack/llxprt-ui`: experimental terminal UI, latest `0.9.3` when checked.
- `terminal-jarvis`: third-party wrapper for multiple terminal AI tools; not enabled in repo because it would add a separate control plane.

Current Wave AI docs support:

- Custom modes in `~/.config/waveterm/waveai.json`.
- `ai:provider` and custom OpenAI-compatible endpoints.
- Provider presets for OpenRouter and Groq with Wave secrets.
- Durable remote SSH sessions for preserving remote terminal state.
- `waveai:defaultmode` in WaveTerm settings.
- `waveai:showcloudmodes=false` for private/custom-only operation.
- `wsh editconfig`, `wsh setconfig`, `wsh secret`, and launch helpers.

Current LLxprt Jefe docs support:

- Repositories with default LLxprt profiles.
- Agents with profile and mode flags.
- tmux-backed durable sessions.
- relaunch, kill, split view, terminal capture, and persistent state.

## Validation

Run after changes:

```bash
node -e 'for (const f of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(f, "utf8"))' \
  config/agents/llxprt-settings.project-nyra.json \
  config/agents/llxprt-profiles/*.json \
  infra/configs/waveterm/*.json

bash -n scripts/setup-wave-configs.sh scripts/setup-wave-llxprt-bootstrap.sh scripts/llxprt-common.sh
zellij setup --check || true
```
