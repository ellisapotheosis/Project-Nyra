# INFISICAL_SECRETS_RUNBOOK.md

Project Nyra secrets are sourced from Infisical at runtime. Do not hardcode
secret values in compose files, Makefiles, docs, or committed `.env` files.

Canonical local invocation:

```bash
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- <command>
```

The project Makefile uses the same pattern, then appends a host-specific
`--path=/machines/<host>` before invoking `docker --context <ctx> compose`.

## Secret Hierarchy

### 1. Shared Runtime

| Path | Target | Scope |
| :--- | :--- | :--- |
| `/shared` | All Nyra make/compose runs | Cross-service defaults, provider keys, shared routing tokens |

Project Nyra uses host-scoped secret paths to ensure physical isolation and security.

### 2. Machine Specific (Physical Topology)

| Path | Target Host | Scope |
| :--- | :--- | :--- |
| `/machines/orchestrator` | Orchestrator (MinisForum) | Nexus, Tunnel, Sync, LiteLLM |
| `/machines/oracle-vps` | Oracle Cloud | WebApp, TwentyCRM, Memory, Gitea |
| `/machines/worker-rtx5090` | RTX 5090 Node | vLLM, OpenClaw, Nerve UI |
| `/machines/worker-rtx3090ti` | RTX 3090 Ti Node | vLLM, OpenClaw, Nerve UI |
| `/machines/worker-rtx3060` | RTX 3060 Node | Ollama, PicoClaw, TTS |

### 3. Provider Specific (Global Ingress)

- `/providers/twilio/*`: Account SID, Auth Token.
- `/providers/sendgrid/*`: API Keys, Domain Verify.
- `/providers/llxprt/*`: Subscription Bridge Keys.
- `/providers/cloudflare/*`: Tunnel Tokens, API Access.

## Sidecar Injection Strategy

The Project Nyra root **Makefile** uses Infisical as the runtime secret source.

- **Local command wrapper**: `infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=dev --path=/shared --path=/machines/<host> -- docker --context <ctx> compose ...`
- **Compose overlay**: `infra/hosts/_templates/docker-compose.infisical-runtime.yml`
- **Runtime sidecars**: `infisical-agent` and `infisical-sidecar`
- **Secret volume**: `nyra_runtime_secrets:/run/nyra-secrets`
- **Result**: Make receives secrets from the operator shell's Infisical auth, then Docker Compose receives them through environment interpolation and an in-memory runtime volume.

Do not use committed host `.env` files for live secrets. Compose commands should
use `--env-file /dev/null` where practical so stale local files do not shadow
Infisical. Non-secret `.env.host` files may store host identity metadata only.

## Usage in Development

```bash
# Shared secret scope for local broker development
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- pnpm dev

# Orchestrator-scoped compose through the root Makefile
make up

# Oracle-scoped app services through the root Makefile
make oracle-webapp-twenty-up
```

The `infis` shell alias may be used when available, but docs and automation
should keep the full `infisical run ...` form so future agents can reproduce
the command without local shell aliases.

## Rotation Policy

- Rotate provider keys (Twilio, SendGrid) every 90 days.
- Rotate database passwords annually or upon personnel change.
- Never share real secrets via chat or document them in non-gitignored files.
