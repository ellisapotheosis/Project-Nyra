# Gitea, Tea CLI, Git MCP, Gitea MCP

## Practical answer

Use Git for source control, Tea CLI for deterministic Gitea automation, and Gitea MCP for MCP-native/natural-language repo operations.

- **Tea** is the official Gitea CLI. It is useful for issues, PRs, releases, repositories, and scripted/agent shell workflows. It is not an MCP server.
- **Gitea MCP Server** is a separate MCP server that lets MCP-capable clients operate Gitea with natural language/tool calls.
- **Git MCP** should be used for local repository operations when an agent needs constrained Git tools.
- **GitHub MCP** should be used only for GitHub mirrors/integrations, not as the primary Gitea path.

## Recommended setup

1. Install/configure `tea` on orchestrator and worker-rtx5090 agent environments.
2. Add a Gitea token scoped to repo/issue/PR operations through Infisical.
3. Run Gitea MCP on Oracle or another protected host.
4. Expose Gitea MCP only over Tailnet/protected network.
5. Use Gitea MCP for agent repository operations requiring tool visibility.
6. Use `tea` from scripts/Makefile/Codex shell tasks when deterministic CLI behavior is safer.
