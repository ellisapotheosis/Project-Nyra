# INFISICAL_DOCKER_CONTEXT_FLOW

Last updated: 2026-05-24

## Overview

All runtime secrets flow from Infisical through a `secrets-init` sidecar into a shared
Docker volume (`/run/nyra-secrets`). Services read mounted secret files at startup.
No secrets are hardcoded in compose files, Dockerfiles, or git history.

---

## Secret Flow (Step by Step)

```
Infisical Cloud
     │
     │  Machine Token (INFISICAL_TOKEN in .zshrc — bootstrap hosts only)
     ▼
secrets-init sidecar container
     │  Fetches secrets for the project/environment
     │  Writes files to shared volume
     ▼
/run/nyra-secrets/ (Docker volume)
     │
     ├── POSTGRES_PASSWORD
     ├── REDIS_PASSWORD
     ├── TWENTY_SECRET_KEY
     ├── LETTA_API_KEY
     ├── LITELLM_MASTER_KEY
     └── ... (all service credentials)
     │
     ▼
Application containers
     │  Read /run/nyra-secrets/<SECRET_NAME> at startup
     │  OR sourced via entrypoint wrapper
     ▼
Running service (no secrets in environment variables visible to `docker inspect`)
```

---

## Bootstrap Hosts

Only two hosts require `INFISICAL_TOKEN` in `.zshrc`:

| Host           | Why                                                                              |
| -------------- | -------------------------------------------------------------------------------- |
| orchestrator   | Runs secrets-init for orchestrator stack; needed before Docker daemon starts     |
| worker-rtx5090 | Runs secrets-init for worker stack; primary inference host needs early bootstrap |

All other hosts (oracle-vps, worker-rtx3090ti, worker-rtx3060) receive their tokens
via the compose secrets-init sidecar pattern, which is triggered by the compose startup
on oracle-vps using its own machine token injected at deploy time.

---

## Docker Context Setup (Remote Host Operations)

Operators on orchestrator can manage remote host stacks via Docker contexts without
SSHing to each host:

```bash
# Create a Docker context for oracle-vps
docker context create oracle-vps \
  --docker "host=ssh://user@100.64.0.3"

# Create a Docker context for worker-rtx5090
docker context create worker-5090 \
  --docker "host=ssh://user@100.64.0.7"

# Use a context
docker --context oracle-vps ps
docker --context worker-5090 compose -f docker-compose.yml up -d
```

Docker contexts require SSH key auth to target hosts via Tailscale IPs. No passwords.

---

## Infisical Sidecar Pattern (Compose Snippet)

```yaml
services:
  secrets-init:
    image: infisical/secrets-init:latest # or custom nyra secrets-init image
    container_name: ${COMPOSE_PROJECT_NAME}-nyra-secrets-init
    environment:
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_ENVIRONMENT=${INFISICAL_ENVIRONMENT:-production}
    volumes:
      - nyra-secrets:/run/nyra-secrets
    restart: "no" # runs once at startup

  my-service:
    image: my-image:latest
    depends_on:
      secrets-init:
        condition: service_completed_successfully
    volumes:
      - nyra-secrets:/run/nyra-secrets:ro
    # entrypoint reads /run/nyra-secrets/* before starting

volumes:
  nyra-secrets:
```

---

## Validation Checks

Before deploying any stack, verify:

1. `secrets-init` container exits with code 0 (check `docker logs <secrets-init-container>`)
2. `/run/nyra-secrets/` volume is non-empty on the target host
3. No placeholder values (e.g. `CHANGE_ME`, `your-token-here`) appear in mounted secrets
4. `docker inspect <service>` environment shows no raw secret values — only file paths

---

## Never Do

- Do not commit `.env` files containing real tokens
- Do not paste `INFISICAL_TOKEN` values into agent prompts or shared terminals
- Do not use the generic `TUNNEL_TOKEN` variable — use `ORACLE_TUNNEL_TOKEN` or
  `ORCHESTRATOR_TUNNEL_TOKEN` explicitly
- Do not use `environment:` in compose for secrets that belong in Infisical
