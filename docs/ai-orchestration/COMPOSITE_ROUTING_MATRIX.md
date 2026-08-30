# Composite Routing Matrix and Agent-Vault Side-Channel

## Outcome

This deployment slice gives agents two stable LiteLLM entrypoints:

- `composite/reasoning`: llxprt Claude session → RTX 5090 local inference → OmniRoute → OpenRouter free terminal route.
- `composite/coding`: llxprt Codex session → RTX 3090 Ti coding model → OmniRoute coding → OpenRouter free terminal route.

The fallback graph is deliberately acyclic. A failed terminal free route cannot
re-enter an earlier local or subscription route and create an infinite retry
loop.

The Infisical Agent-Vault overlay writes atomic secret generations to a named
Docker volume. LiteLLM and OpenClaw receive the volume read-only; the sidecar
has no published ports, no Docker socket, no Linux capabilities, and a read-only
root filesystem.

## Corrections to the source draft

| Draft assumption | Canonical implementation |
| --- | --- |
| `http://ts.net` worker endpoints | Private Project Nyra DNS names such as `worker-rtx5090.projectnyra.com` |
| Claude/Codex subscription strings used as provider API keys | Existing `llxprt-bridge` transports authenticated CLI subscription sessions |
| Nested `lmcache_config.backend` YAML | Current LMCache `remote_url` config plus vLLM `LMCacheConnectorV1` |
| RTX 5090 24 GB / RTX 3060 6 GB | Repository inventory: RTX 5090 32 GB / RTX 3060 12 GB |
| A second self-hosted Infisical server | Existing Infisical control plane remains authoritative; this PR adds only the least-privilege sink sidecar |

Running another Infisical server from an unpinned `latest` image with a database
password interpolated into `DB_CONNECTION_URL` would duplicate the existing
control plane and expand the secret blast radius. The sidecar authenticates to
the existing control plane with Universal Auth instead.

## Required environment variables

Replace or supply these through the existing Infisical `/hosts/orchestrator`
path before running commands:

```dotenv
INFISICAL_PROJECT_ID=REPLACE_WITH_PROJECT_ID
INFISICAL_MACHINE_IDENTITY_CLIENT_ID=REPLACE_WITH_UNIVERSAL_AUTH_CLIENT_ID
INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET=REPLACE_WITH_UNIVERSAL_AUTH_CLIENT_SECRET
INFISICAL_HOST_URL=https://app.infisical.com
INFISICAL_ENV=prod
INFISICAL_PATH=/hosts/orchestrator

LITELLM_MASTER_KEY=REPLACE_WITH_48_PLUS_CHARACTER_KEY
LLXPRT_BRIDGE_API_KEY=REPLACE_WITH_BRIDGE_KEY
OMNIROUTE_API_KEY=REPLACE_WITH_ENDPOINT_KEY
OPENROUTER_API_KEY=REPLACE_WITH_OPENROUTER_KEY
```

Universal Auth credentials are preferred and obtain a fresh access token on
every refresh. `INFISICAL_TOKEN` is supported only as a fallback when Universal
Auth credentials are not supplied.

## Validate without deploying

From the repository root:

```bash
python3 -m unittest tests/test_composite_routing_matrix.py
bash -n infra/images/infisical-secrets-init/universal-auth-agent-sidecar.sh
bash -n infra/scripts/vllm-bootstrap.sh

cd infra/hosts/orchestrator
INFISICAL_PATH=/hosts/orchestrator bash ../../scripts/inject-secrets.sh \
  docker compose -p orchestrator \
    -f docker-compose.yml \
    -f docker-compose.litellm.yml \
    -f docker-compose.agent-vault.yml \
    config --quiet
```

## Start the orchestrator matrix

This is a deployment action and must be run only after reviewing the rendered
Compose configuration:

```bash
cd infra/hosts/orchestrator
INFISICAL_PATH=/hosts/orchestrator bash ../../scripts/inject-secrets.sh \
  docker compose -p orchestrator \
    -f docker-compose.yml \
    -f docker-compose.litellm.yml \
    -f docker-compose.agent-vault.yml \
    up -d agent-vault litellm openclaw-gateway
```

Verify that no values are printed:

```bash
docker compose -p orchestrator \
  -f docker-compose.yml \
  -f docker-compose.litellm.yml \
  -f docker-compose.agent-vault.yml \
  ps

curl -fsS -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://localhost:4010/health/readiness
```

The Letta OpenClaw client reads
`/run/nyra-secrets/current/openclaw_gateway_token` for every request, so token
rotation applies immediately. LiteLLM resolves its provider environment at
process start; after rotating a LiteLLM/provider key, restart only the LiteLLM
container through the guarded operator workflow.

## GPU worker bootstrap

`infra/scripts/vllm-bootstrap.sh` is intended for the RTX 5090 and RTX 3090 Ti
hosts. It generates the current LMCache Redis configuration and starts `vllm
serve` with `LMCacheConnectorV1`. Override the model or cache endpoint when the
host catalog changes:

```bash
export NYRA_NODE_NAME=worker-rtx5090
export VLLM_MODEL_ID=Qwen/Qwen3.8-27B
export LMCACHE_REMOTE_URL=redis://127.0.0.1:6379
sudo -E bash infra/scripts/vllm-bootstrap.sh
```

The RTX 3060 remains the Ollama utility, embedding, and guardrail tier; it does
not run this vLLM launcher. Both vLLM nodes default to their own loopback-bound
Redis instance. Cross-node Redis sharing is opt-in through
`LMCACHE_REMOTE_URL`; do not expose an unauthenticated Redis listener to the
tailnet.
