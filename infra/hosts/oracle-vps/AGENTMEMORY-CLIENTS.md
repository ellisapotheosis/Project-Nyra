# AgentMemory Client Wiring

This stack hosts a single shared AgentMemory server on the Oracle VPS and keeps it private to trusted paths.

## Canonical endpoint

- REST base: `http://100.64.0.3:3111`
- Alternate DNS base: `http://oracle.trex-fiordland.ts.net:3111`
- Viewer: `http://100.64.0.3:3113`
- Health: `http://100.64.0.3:3111/agentmemory/health`

Default `AGENTMEMORY_BIND_IP` is `100.64.0.3` so the endpoint stays on the Oracle tailnet interface instead of binding publicly.

## Required env

Every agent should use the same secret if `AGENTMEMORY_SECRET` is set on the server. In Nyra, `AGENTMEMORY_SECRET` is expected to be injected at runtime on the relevant hosts rather than committed in local config files.

```bash
export AGENTMEMORY_URL=http://100.64.0.3:3111
export AGENTMEMORY_SECRET=replace-me
```

## Hermes

Hermes on `worker-rtx5090` is prewired in [docker-compose.hermes.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/docker-compose.hermes.yml). The container inherits `AGENTMEMORY_URL` and `AGENTMEMORY_SECRET`, and the vendored plugin adds pre-compress/session-end/memory-write hooks.

## Claude Code

Use the upstream plugin flow so Claude Code gets hooks plus MCP:

```bash
export AGENTMEMORY_URL=http://100.64.0.3:3111
export AGENTMEMORY_SECRET=replace-me
/plugin marketplace add rohitg00/agentmemory
/plugin install agentmemory
```

## Gemini CLI

```bash
export AGENTMEMORY_URL=http://100.64.0.3:3111
export AGENTMEMORY_SECRET=replace-me
gemini mcp add agentmemory -- npx -y @agentmemory/mcp
```

## Codex CLI

Add this to `~/.codex/config.yaml`:

```yaml
mcp_servers:
  agentmemory:
    command: npx
    args: ["-y", "@agentmemory/mcp"]
```

Then launch Codex with `AGENTMEMORY_URL` and `AGENTMEMORY_SECRET` in the environment.

## Other MCP clients

Any MCP client that can spawn a local stdio server can use:

```json
{
  "mcpServers": {
    "agentmemory": {
      "command": "npx",
      "args": ["-y", "@agentmemory/mcp"]
    }
  }
}
```

The `@agentmemory/mcp` shim proxies to the remote AgentMemory REST server when `AGENTMEMORY_URL` is set.

## Direct REST clients

Tools that do not support MCP can call the REST API directly:

```bash
curl -H "Authorization: Bearer $AGENTMEMORY_SECRET" \
  http://100.64.0.3:3111/agentmemory/health
```
