# Project-Nyra — Repo Overview (Single-Repo)

**Profiles + flows + MCP** live in this repo so anyone who clones gets the same tools.

## Folders
- nyra-metamcp/ — central MCP proxy/config (later: code)
- nyra-core/ — shared TS types/schemas/utils
- nyra-orchestration/ — each orchestration framework gets a subfolder
- nyra-memory/ — databases & memory services (compose + configs)
- nyra-mcp/ — general MCP servers (compose + server code)
- nyra-agents/ — cross-system agent definitions & behaviors
- config/ — env-scoped JSON configs (dev/staging/prod)
- scripts/ — setup/dev/deploy (Windows-first)
- docs/ — human-readable guides

## Getting started
1. Copy `.env.example` → `.env` (secrets) in your repo root.
2. Run: `powershell -ExecutionPolicy Bypass -File .\.vscode-profiles\install-profiles.ps1 -ProfileName 'Default-AllAround'`
3. VS Code → **Profiles** → **Import from file** → pick `.vscode-profiles/Default-AllAround.code-profile`
4. In VS Code, open this repo, hit `/mcp` (Claude Code) and verify Tavily, GitHub, KG, Qdrant.
5. Run `claude/flows/research-to-pr.yaml` to test end-to-end: search → notes → commit → PR.

## Notes
- Kilo Code: install its Marketplace extension; add to profiles later if needed.
- Claude Flow (alpha) + Agent SDK: install as dev dependencies **in this repo** to pin versions.