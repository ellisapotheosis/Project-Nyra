# GITEA_TEA_MCP_STRATEGY

Last updated: 2026-05-24

## Decision Table

Use the right tool for the job. Never substitute one for another.

| Tool         | Use For                                                                                            | Do NOT Use For                                   |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `git`        | Local commits, branches, push, pull, merge, rebase, stash                                          | Gitea-specific resources (issues, PRs, releases) |
| `tea`        | Gitea issues, PRs, releases, repos, webhooks — in shell scripts and deterministic agent automation | MCP clients; interactive UI                      |
| `gitea-mcp`  | Natural-language repository operations from MCP clients (Claude, Letta, OpenClaw)                  | Shell scripts requiring deterministic output     |
| `github-mcp` | GitHub mirror management, GitHub Actions, GitHub-hosted integrations ONLY                          | Anything on the local Gitea instance             |

`tea` is a CLI binary, not an MCP server. Do not model it as one.

---

## Gitea Instance

- URL: `http://oracle.trex-fiordland.ts.net:3000`
- Tailscale direct: `http://100.64.0.3:3000`
- Container: `docker-compose.gitea.yml` on oracle-vps
- Admin account: configured via Infisical (GITEA_ADMIN_USER / GITEA_ADMIN_PASSWORD)

---

## Tea CLI

Tea is the official Gitea CLI client.

### Config Location

```
~/.config/tea/config.yml
```

### Authentication Setup

```bash
tea login add \
  --name nyra-gitea \
  --url http://oracle.trex-fiordland.ts.net:3000 \
  --token <GITEA_API_TOKEN>   # from Infisical — never hardcode
```

### Example Commands

```bash
# List open issues in a repo
tea issues list --repo nyra/project-nyra --state open

# Create an issue
tea issues create --repo nyra/project-nyra \
  --title "Fix LiteLLM routing on 5090" \
  --body "Routing fails after vLLM restart."

# Create a pull request
tea pulls create --repo nyra/project-nyra \
  --head feature/my-branch --base main \
  --title "Add voice mesh distributed mode"

# List repos
tea repos list

# Create a release
tea releases create --repo nyra/project-nyra \
  --tag v1.2.0 --title "Release v1.2.0" --note "Changelog here"

# Close an issue
tea issues close --repo nyra/project-nyra --id 42
```

### In Automation Scripts

```bash
# Deterministic issue creation in a shell script — use tea, not gitea-mcp
tea issues create \
  --repo nyra/project-nyra \
  --title "Automated: deployment complete $(date +%Y-%m-%d)" \
  --body "Stack deployed by orchestrator agent." \
  --token "$GITEA_API_TOKEN"
```

---

## Gitea MCP

gitea-mcp is the MCP server that provides natural-language Gitea operations to
MCP clients such as Claude Code, Letta agents, and OpenClaw sessions.

Config placeholder (add to MCP client config):

```json
{
  "mcpServers": {
    "gitea": {
      "command": "node",
      "args": ["/path/to/gitea-mcp/dist/index.js"],
      "env": {
        "GITEA_URL": "http://oracle.trex-fiordland.ts.net:3000",
        "GITEA_TOKEN": "<from Infisical>"
      }
    }
  }
}
```

Capabilities: list/create/close issues, list/create PRs, search code, list repos,
create releases, manage webhooks.

---

## GitHub MCP

Use `github-mcp` only for:

- Managing GitHub mirrors of Gitea repos
- Triggering GitHub Actions workflows
- Reading GitHub-hosted integrations

Never use `github-mcp` to operate the local Gitea instance.

---

## Summary Rule

> Shell scripts and agent automation → `tea`
> MCP client natural language → `gitea-mcp`
> Local git operations → `git`
> GitHub only → `github-mcp`
