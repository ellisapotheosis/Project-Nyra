# ChatGPT GitHub MCP Connector

This guide connects ChatGPT web conversations to the Docker Desktop MCP Toolkit
GitHub MCP server.

## What Runs Locally

The zsh helper `mcp-github` starts Docker Desktop MCP Toolkit with the
`github_write` profile:

```bash
mcp-github
```

It serves a local Streamable HTTP MCP endpoint:

```text
http://127.0.0.1:8080/mcp
```

Keep that terminal open while ChatGPT is using the connector.

## Expose It To ChatGPT

ChatGPT needs an HTTPS URL that can reach your local server. In a second
terminal, run:

```bash
mcp-github-tunnel
```

If `ngrok` is installed, this runs:

```bash
ngrok http 8080
```

If `cloudflared` is installed, it runs a quick tunnel to
`http://127.0.0.1:8080`.

Use the HTTPS tunnel URL with `/mcp` appended:

```text
https://<your-tunnel-host>/mcp
```

## Connect In ChatGPT

1. Open ChatGPT in the browser.
2. Go to Settings.
3. Open Apps & Connectors.
4. Enable Developer Mode under Advanced settings if it is not already enabled.
5. Create a new app/connector from a remote MCP server.
6. Paste the HTTPS tunnel URL ending in `/mcp`.
7. Save or connect it.
8. Start a new chat and ask ChatGPT to use the GitHub connector.

When you restart the tunnel, the public URL usually changes. Update the
connector URL in ChatGPT unless you are using a reserved/stable tunnel domain.

## Useful Commands

```bash
# Start the GitHub MCP endpoint on localhost:8080
mcp-github

# Start it with another Docker MCP profile
mcp-github nyra_mcp_toolkit_v1

# Start an HTTPS tunnel for ChatGPT
mcp-github-tunnel

# Inspect the Docker MCP GitHub profile
mcp-github-inspect
```

## Notes

- Docker Desktop must be running before `mcp-github` will work.
- The Docker MCP Toolkit profile must have GitHub credentials/secrets configured.
- Keep the MCP server and tunnel running for the whole ChatGPT session.
- After changing MCP tools or metadata, refresh/reconnect the connector in
  ChatGPT so it reloads tool descriptors.
