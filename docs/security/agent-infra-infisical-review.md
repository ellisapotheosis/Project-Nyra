# Agent Infra Infisical Review

Review date: 2026-04-28

## Export Result

The root path `/` exported successfully but contained no direct keys. A folder walk was required because this Infisical project stores secrets below top-level folders.

Local ignored export artifacts:

- `secrets/infisical/root.env`
- `secrets/infisical/export-prod/`
- `secrets/infisical/agent-infra.generated.env`

## Scoped Paths Created

- `/oracle`
- `/oracle/agent-utils`
- `/oracle/memory`
- `/shared/providers`
- `/shared/composio`
- `/worker-rtx3060`
- `/worker-rtx3060/voice`
- `/worker-rtx3090ti`
- `/worker-rtx3090ti/voice`
- `/worker-rtx5090`
- `/worker-rtx5090/voice`

## Generated and Stored

These did not already exist elsewhere in the export, so local cryptographic values were generated and pushed:

- `/oracle/agent-utils/PAPERCLIP_DB_PASSWORD`
- `/oracle/agent-utils/PAPERCLIP_SESSION_SECRET`
- `/oracle/agent-utils/SEARXNG_SECRET`
- `/oracle/agent-utils/BROWSERLESS_TOKEN`

## Retrieved and Re-Scoped

Existing values were copied into the new scoped paths without printing them:

- `/machines/oracle/LETTA_DB_PASSWORD` -> `/oracle/memory/LETTA_DB_PASSWORD`
- `/machines/oracle/LETTA_SERVER_PASSWORD` -> `/oracle/memory/LETTA_SERVER_PASSWORD`
- `/databases/qdrant-local/QDRANT_API_KEY` -> `/oracle/memory/QDRANT_API_KEY`
- `/providers/openai/OPENAI_API_KEY` -> `/shared/providers/OPENAI_API_KEY`
- `/providers/anthropic/ANTHROPIC_API_KEY` -> `/shared/providers/ANTHROPIC_API_KEY`
- `/providers/litellm/LITELLM_MASTER_KEY` -> `/shared/providers/LITELLM_MASTER_KEY`
- `/providers/litellm/LITELLM_API_KEY` -> `/worker-rtx3090ti/voice/LITELLM_API_KEY`
- `/clients/composio/COMPOSIO_API_KEY` -> `/shared/composio/COMPOSIO_API_KEY`
- `/clients/composio/COMPOSIO_API_KEY` -> `/worker-rtx3090ti/voice/COMPOSIO_API_KEY`

## Config Stored

Deterministic non-secret config was stored alongside the scoped secrets:

- `/shared/composio/COMPOSIO_DEFAULT_USER_ID`
- `/shared/composio/COMPOSIO_MCP_TRANSPORT`
- `/shared/composio/COMPOSIO_MCP_SERVER_NAME`
- `/shared/composio/COMPOSIO_TOOLKITS_ALLOW`
- `/shared/composio/COMPOSIO_EXECUTION_POLICY`
- voice LAN IPs and route URLs under each worker voice path

## Still Required

These require a Composio dashboard/API action and were not invented:

- `/shared/composio/COMPOSIO_MCP_SERVER_ID`
- `/shared/composio/COMPOSIO_MCP_URL`
- `/worker-rtx3090ti/voice/COMPOSIO_MCP_URL`

After the hosted MCP server exists, store:

```bash
infisical secrets set COMPOSIO_MCP_SERVER_ID=<server-id> --env prod --path /shared/composio
infisical secrets set 'COMPOSIO_MCP_URL=https://backend.composio.dev/v3/mcp/<server-id>?user_id=nyra-system' --env prod --path /shared/composio
infisical secrets set 'COMPOSIO_MCP_URL=https://backend.composio.dev/v3/mcp/<server-id>?user_id=nyra-system' --env prod --path /worker-rtx3090ti/voice
```

## Verification

Run:

```bash
scripts/infisical/agent-infra-secrets.sh audit
```
