# Wave AI + Zellij + LLxprt + Letta Bootstrap Package

> **HISTORICAL SNAPSHOT — NOT CURRENT OPERATIONAL CONFIGURATION.**
>
> This tree is a frozen copy of the WaveTerm/LLxprt operator stack as it existed
> before the 2026-09-04 LiteLLM-native control-plane migration. It predates:
>
> * the retirement of the third GPU worker (RTX 3060),
> * the retirement of Nexus (both the bespoke `nexus-router` and Grafbase Nexus),
> * the single-LiteLLM-gateway control plane,
> * the root `compose.yaml` host-profile deployment model.
>
> Explicit references to the retired GPU worker have been removed, but residual
> loose mentions of legacy hostnames, ports and worker lanes may remain in this
> snapshot. **Do not copy deployment commands out of this tree.** The current
> architecture is described in `docs/architecture/NYRA_CONTROL_PLANE.md` and the
> current deployment procedure in
> `docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md`.

This is the copy-based recovery and portability package for the Project Nyra
WaveTerm/Wave AI, Zellij, LLxprt Code, LLxprt Jefe, and Letta operator stack.
Use it to bootstrap another coding PC without re-discovering all of the local
profile/config paths.

It includes:

- Repo-managed WaveTerm, Wave AI, Zellij, and LLxprt profile files.
- Repo-managed Letta stack-orchestrator profile.
- A local snapshot of installed WaveTerm and LLxprt non-secret config.
- A copy of the relevant non-secret zsh setup, including Wave/Zellij/LLxprt aliases.
- A local LLxprt Jefe source reference without build artifacts.
- An installer that can rehydrate the repo files and home config.
- A control CLI, doctor, profile matrix, safe live snapshotter, and redacted black box packager.

## Control CLI

The main operator surface is:

```bash
bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh --help
```

Available commands:

- `install`: install repo files and home config from this package.
- `check`: run package validation.
- `doctor`: run the full Wave/Zellij/LLxprt stack doctor.
- `snapshot`: refresh package copies from the current live repo and home config.
- `profiles`: print the LLxprt profile matrix.
- `profiles-load`: print the matrix and verify `llxprt --profile-load` can load each profile.
- `blackbox`: create a redacted timestamped support archive.
- `launch`: launch the default Wave/Zellij cockpit.
- The Project Nyra repo is cloned to `~/repos/project-nyra`.
- `zsh`, `rsync`, `node`, `docker`, `docker compose`, `zellij`, and WaveTerm are installed.
- Infisical CLI is logged in or the required `INFISICAL_TOKEN` / project env vars are exported in the shell that will run Docker Compose.
- Provider CLIs or OAuth flows are available for Codex CLI, Claude Code, Gemini CLI, and any free LLxprt-compatible providers you want to activate.

Install everything:

From the repo root:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh
```

Install only repo files:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh --repo-only
```

Install only home config and shell helpers:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh --home-only
```

Validate without changing files:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh --check
```

## What Gets Installed

Repo files are copied into the active checkout from:

```text
bootstrap/wave-ai-llxprt-zellij/repo-files/
```

Home config is copied into:

```text
~/.config/waveterm/
~/.llxprt/
~/.zsh/
```

The installer backs up an existing `~/.zshrc` before replacing it.

## Shell Helpers

After starting a fresh shell, these helpers are available:

```bash
nyra-wave-bootstrap
nyra-wave-install
nyra-wave
nyra-wave3060
nyra-wave-health
nyra-wave-control
nyra-wave-doctor
nyra-wave-snapshot
nyra-wave-blackbox
nyra-wave-profiles
llxprt-ha
llxprt-spread
llxprt-triad
llxprt-openrouter
llxprt-codex
llxprt-gemini
llxprt-claude
jefe
```

Launch the default durable cockpit:

```bash
make wave-only
```

Launch with the optional lane:

```bash
make wave-only-3060
```

Stand up the default orchestrator + 5090 + 3090Ti stack:

```bash
make wave-stack-up
```

Stand up the optional 3060 lane too:

```bash
make wave-stack-up-3060
```

Run subscription-backed LLxprt profiles directly:

```bash
scripts/run-llxprt-code.sh --profile-load nyra-subscription-ha
scripts/run-llxprt-code.sh --profile-load nyra-subscription-spread
scripts/run-llxprt-code.sh --profile-load nyra-cli-triad-ha
scripts/run-llxprt-code.sh --profile-load nyra-openrouter-free
scripts/run-llxprt-jefe.sh
```

Expose subscription-backed LLxprt to Letta/Nexus/LiteLLM through the local
OpenAI-compatible bridge:

```bash
make llxprt-oracle-subscription-up
```

Letta should use `http://127.0.0.1:8090/v1` with model
`nyra-cli-triad-ha` for subscription-powered orchestration, and use
`http://orchestrator.trex-fiordland.ts.net:6000/v1` for private local
Nexus/LiteLLM routing.

## Secret Policy

This package does not include live secrets. The real `~/.zsh/99-secrets.zsh`, OAuth caches, WaveTerm secrets, and provider tokens are excluded.

Use `dotfiles/zsh/99-nyra-wave-env.zsh.template` as the non-secret shape for required endpoint variables and key names.

Provider auth still requires one-time interactive setup on each PC:

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

Wave secrets are separate from LLxprt keyring/OAuth state. Set Wave AI secrets
with:

```bash
wsh secret set LLXPRT_BRIDGE_API_KEY=...
wsh secret set NEXUS_MASTER_KEY=...
wsh secret set NYRA_WORKER_API_KEY=...
wsh secret set OPENROUTER_KEY=...
wsh secret set GROQ_KEY=...
```

Letta, Nexus, OpenClaw, and LLxprt bridge runtime tokens should come from
Infisical, the local keyring, or exported host environment variables. Do not add
real tokens to this package.

## Validate

The check parses JSON, checks shell scripts, and validates the Zellij
config/layout surfaces when `zellij` is installed:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh --check
bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh doctor
bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh profiles
```

For a broader repo validation after installing:

```bash
make verify-paths
scripts/infra/assert-compose-source-of-truth.sh
infisical scan --source . --no-git --redact
```

## Refresh This Package

After changing live shell, WaveTerm, LLxprt, or repo package files:

```bash
bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh snapshot
```

The snapshotter excludes `~/.zsh/99-secrets.zsh`, LLxprt OAuth caches, `.git`, and Jefe `target/` build artifacts.

## Capture a Redacted Debug Bundle

```bash
bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh blackbox
```

Archives are written under `bootstrap/wave-ai-llxprt-zellij/blackbox/`.
