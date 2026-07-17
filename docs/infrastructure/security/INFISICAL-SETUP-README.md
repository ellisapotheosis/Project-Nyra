# Infisical Setup README

This file is the single audit trail for the secrets work I did in this session.

Infisical environments updated:

- `dev`
- `stag`
- `prod`

The project does not use the long-form slugs `development`, `staging`, or `production` in the CLI checks I ran.

## Short Answer

- I created some required secrets myself.
- I did not leave the runtime secrets in a checked-in `.env` file.
- I stored the actual runtime secrets in Infisical under scoped paths.
- I also generated a local scratch file, but it is ignored by git and exists only as an intermediate source file:
  - `secrets/infisical/agent-infra.generated.env`
- I did not store the runtime secrets in a repo `.env` for deployment.

## What I Exported And Reviewed

- I first tried exporting Infisical at `/`, but that path was empty.
- I then walked the folder tree and exported the relevant folder paths under the `prod` environment.
- I reviewed key names only. I did not print secret values.

The top-level folder tree already contained existing secrets under paths like:

- `/providers/*`
- `/machines/*`
- `/clients/*`
- `/databases/*`

`/shared` exists in the project, but it is link-only for this setup and must not be used as a secret write target.

## What I Created Myself

These values were generated locally and then pushed into Infisical.

Paths:

- `/clients/paperclip/PAPERCLIP_DB_PASSWORD`
- `/clients/paperclip/PAPERCLIP_SESSION_SECRET`
- `/clients/searxng/SEARXNG_SECRET`
- `/clients/browserless/BROWSERLESS_TOKEN`

These are service-owned secrets for the Oracle utilities stack.

## What I Retrieved From Existing Infisical Paths And Re-Scoped

These values already existed elsewhere in Infisical, so I copied them into the new deployment paths instead of inventing new values.

Existing service/database paths:

- `LETTA_DB_PASSWORD` belongs in `/clients/letta/LETTA_DB_PASSWORD`
- `LETTA_SERVER_PASSWORD` belongs in `/clients/letta/LETTA_SERVER_PASSWORD`
- `QDRANT_API_KEY` belongs in `/databases/qdrant-local/QDRANT_API_KEY`

Path: existing provider paths

- `OPENAI_API_KEY` remains at `/providers/openai/OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` remains at `/providers/anthropic/ANTHROPIC_API_KEY`
- `LITELLM_MASTER_KEY` remains at `/providers/litellm/LITELLM_MASTER_KEY`

Path: `/clients/composio`

- `COMPOSIO_API_KEY` remains at `/clients/composio/COMPOSIO_API_KEY`

## What I Added As Configuration Values In Infisical

These are not secrets in the strict sense, but I stored them in Infisical so the deploys can render consistently.

Path: `/clients/composio`

- `COMPOSIO_DEFAULT_USER_ID`
- `COMPOSIO_MCP_TRANSPORT`
- `COMPOSIO_MCP_SERVER_NAME`
- `COMPOSIO_TOOLKITS_ALLOW`
- `COMPOSIO_EXECUTION_POLICY`

## Composio MCP Server Created

I created the shared Composio MCP server and stored its generated connection values in Infisical.

Path: `/clients/composio`

- `COMPOSIO_MCP_SERVER_ID`
- `COMPOSIO_MCP_URL`

These are present in:

- `dev`
- `stag`
- `prod`

No `COMPOSIO_*` values should be stored directly on a machine path unless that specific machine needs a different value from the shared Composio client path.

## Incorrect `/shared` Writes

I incorrectly treated `/shared` as a normal secret storage path during the first pass. That was wrong for this project.

These paths are not required:

- `/shared/providers`
- `/shared/composio`

Cleanup status:

- `/shared/composio` was deleted after this mistake was caught.
- `/shared/providers` was not present at cleanup time.

The correct active paths are:

- `/providers/openai`
- `/providers/anthropic`
- `/providers/litellm`
- `/clients/composio`
- `/clients/paperclip`
- `/clients/searxng`
- `/clients/browserless`
- `/clients/letta`
- `/databases/qdrant-local`

## Incorrect `/oracle` Writes

I incorrectly wrote service secrets under `/oracle`.

These paths are not required and should not hold these service secrets:

- `/oracle`
- `/oracle/agent-utils`
- `/oracle/memory`

Cleanup status:

- `/oracle` was deleted in `dev`.
- `/oracle` was deleted in `stag`.
- `/oracle` was deleted in `prod`.

The correct active paths are:

- `/clients/paperclip`
- `/clients/searxng`
- `/clients/browserless`
- `/clients/letta`
- `/databases/qdrant-local`

## Incorrect Worker Paths

I incorrectly created these top-level worker folders during the first pass:

- `/worker-rtx3060`
- `/worker-rtx3090ti`
- `/worker-rtx5090`

Cleanup status:

- `/worker-rtx3060` was deleted.
- `/worker-rtx3090ti` was deleted.
- `/worker-rtx5090` was deleted.

Machine-specific settings now belong directly under `/machines/<host-name>`, with no nested folders.

## Base Network Map

The shared host network map belongs in `/base`, not directly in each machine path.

I added or confirmed these direct `/base` keys in all three environments: `dev`, `stag`, and `prod`.

- `ORCHESTRATOR_IP`
- `ORCHESTRATOR_LAN_IP`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_HOSTNAME`
- `ORCHESTRATOR_MAGICDNS`
- `ORCHESTRATOR_TAILSCALE_MAGICDNS`
- `WORKER_RTX3060_IP`
- `WORKER_RTX3060_LAN_IP`
- `WORKER_RTX3060_TAILSCALE_IP`
- `WORKER_RTX3060_HOSTNAME`
- `WORKER_RTX3060_MAGICDNS`
- `WORKER_RTX3060_TAILSCALE_MAGICDNS`
- `WORKER_RTX3090TI_IP`
- `WORKER_RTX3090TI_LAN_IP`
- `WORKER_RTX3090TI_TAILSCALE_IP`
- `WORKER_RTX3090TI_HOSTNAME`
- `WORKER_RTX3090TI_MAGICDNS`
- `WORKER_RTX3090TI_TAILSCALE_MAGICDNS`
- `WORKER_RTX5090_IP`
- `WORKER_RTX5090_LAN_IP`
- `WORKER_RTX5090_TAILSCALE_IP`
- `WORKER_RTX5090_HOSTNAME`
- `WORKER_RTX5090_MAGICDNS`
- `WORKER_RTX5090_TAILSCALE_MAGICDNS`
- `RTX3060_LAN_IP`
- `RTX3090TI_LAN_IP`
- `RTX5090_LAN_IP`
- `LAN_GATEWAY`
- `LAN_PUBLIC_IP`
- `LAN_SUBNET_MASK`
- `WAN_SHARED_IP`
- `TAILSCALE_MAGIC_DNS_ENABLED`
- `TAILSCALE_MESH_NETWORK`
- `TAILSCALE_NETWORK_PREFIX`
- `TAILSCALE_TAILNET`
- `INTERNAL_NETWORK_DNS_PRIMARY`
- `INTERNAL_NETWORK_DNS_SECONDARY`
- `ORACLE_CLOUDFLARED_HOSTNAME`
- `ORACLE_DOMAIN_NAME`

I then removed the duplicated direct copies of those network identity keys from:

- `/machines/orchestrator`
- `/hosts/oracle-vps`
- `/machines/worker-rtx3060`
- `/machines/worker-rtx3090ti`
- `/machines/worker-rtx5090`

Verification used `--include-imports=false`, so the check distinguished direct machine secrets from `/base` values imported through symlinks.

I did not move Tailscale credentials such as `TAILSCALE_AUTHKEY`, `TAILSCALE_API_KEY`, `TAILSCALE_CLIENT_ID`, or `TAILSCALE_CLIENT_SECRET`. Those are credentials, not shared network identity metadata.

Ownership notes:

- `VOICE_PTP_INTERFACE` is owned by the Kyutai Unmute voice mesh. Keep it machine-local when the NIC/interface can differ per host; only move it to a voice client path if every worker uses the same interface contract.
- `ASSISTANT_GATEWAY_URL` is owned by the assistant gateway/OpenClaw boundary. If every host consumes the same assistant gateway URL, it belongs under an assistant/OpenClaw client path, not Paperclip and not a machine path.

## Final State

- Runtime secrets are in Infisical.
- Generated local values are only in `secrets/infisical/agent-infra.generated.env`.
- Checked-in files are templates, scripts, and this README.

## Validation

I validated the new Compose files and the secrets workflow with:

- `bash scripts/validate-agent-infra.sh`
- `scripts/infisical/agent-infra-secrets.sh audit`

## Related Files

- [secrets helper](../../scripts/infisical/agent-infra-secrets.sh)
- [audit helper](../../scripts/validate-agent-infra.sh)
- [generated env template](../../infra/environments/oracle-agent-utils.example.env)
- [generated env template](../../infra/environments/memory.example.env)
- [generated env template](../../infra/environments/voice-mesh.example.env)
- [Composio injection](../../infra/compose/composio.inject.compose.yml)
- [Composio webapp injection](../../infra/compose/composio.webapp.inject.compose.yml)
- [Composio OpenClaw MVP injection](../../infra/compose/composio.openclaw-mvp.inject.compose.yml)
