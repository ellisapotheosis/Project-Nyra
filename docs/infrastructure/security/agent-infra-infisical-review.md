# Agent Infra Infisical Review

Review date: 2026-04-28

## Export Result

The root path `/` exported successfully but contained no direct keys. A folder walk was required because this Infisical project stores secrets below top-level folders.

Local ignored export artifacts:

- `secrets/infisical/root.env`
- `secrets/infisical/export-prod/`
- `secrets/infisical/agent-infra.generated.env`

## Scoped Paths Created

- `/clients/paperclip`
- `/clients/searxng`
- `/clients/browserless`
- `/clients/letta`
- `/databases/qdrant-local`
- `/providers/openai`
- `/providers/anthropic`
- `/providers/litellm`
- `/clients/composio`

Correction: `/shared` is link-only and should not store secrets. `/shared/composio` was deleted after the mistake was caught. `/shared/providers` was not present at cleanup time.


## Generated and Stored

These did not already exist elsewhere in the export, so local cryptographic values were generated and pushed:

- `/clients/paperclip/PAPERCLIP_DB_PASSWORD`
- `/clients/paperclip/PAPERCLIP_SESSION_SECRET`
- `/clients/searxng/SEARXNG_SECRET`
- `/clients/browserless/BROWSERLESS_TOKEN`

## Retrieved and Re-Scoped

Existing values were copied into the new scoped paths without printing them:

- `/clients/letta/LETTA_DB_PASSWORD` remains at `/clients/letta/LETTA_DB_PASSWORD`
- `/clients/letta/LETTA_SERVER_PASSWORD` remains at `/clients/letta/LETTA_SERVER_PASSWORD`
- `/databases/qdrant-local/QDRANT_API_KEY` remains at `/databases/qdrant-local/QDRANT_API_KEY`
- `/providers/openai/OPENAI_API_KEY` remains at `/providers/openai/OPENAI_API_KEY`
- `/providers/anthropic/ANTHROPIC_API_KEY` remains at `/providers/anthropic/ANTHROPIC_API_KEY`
- `/providers/litellm/LITELLM_MASTER_KEY` remains at `/providers/litellm/LITELLM_MASTER_KEY`
- `/clients/composio/COMPOSIO_API_KEY` remains at `/clients/composio/COMPOSIO_API_KEY`

## Config Stored

Deterministic non-secret config was stored alongside the scoped secrets:

- `/clients/composio/COMPOSIO_DEFAULT_USER_ID`
- `/clients/composio/COMPOSIO_MCP_TRANSPORT`
- `/clients/composio/COMPOSIO_MCP_SERVER_NAME`
- `/clients/composio/COMPOSIO_TOOLKITS_ALLOW`
- `/clients/composio/COMPOSIO_EXECUTION_POLICY`

## Still Required

These require a Composio dashboard/API action and were not invented:

- `/clients/composio/COMPOSIO_MCP_SERVER_ID`
- `/clients/composio/COMPOSIO_MCP_URL`

After the hosted MCP server exists, store:

```bash
infisical secrets set COMPOSIO_MCP_SERVER_ID=<server-id> --env prod --path /clients/composio
infisical secrets set 'COMPOSIO_MCP_URL=https://backend.composio.dev/v3/mcp/<server-id>?user_id=nyra-system' --env prod --path /clients/composio
```

## Verification

Run:

```bash
scripts/infisical/agent-infra-secrets.sh audit
```
