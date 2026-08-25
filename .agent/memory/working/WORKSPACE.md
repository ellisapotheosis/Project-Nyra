# Phase 2 MCP and memory work

## 2026-08-25

**Status:** Environment-blocked on interactive OAuth. Infrastructure UP.

### Verified & Working

- ✓ Oracle memory containers running: Mem0 (healthy, 2h), FalkorDB (19h), Qdrant, Letta services
- ✓ Orchestrator SSH sshd running and listening on port 23
- ✓ Orchestrator LiteLLM healthy (port 4010)
- ✓ Docker default context accessible and functioning
- ✓ REVIEW_QUEUE cleared: graduated 3 failures (infisical flag deprecation, docker context issues), rejected 1 duplicate

### Blocked: Requires Human Interaction

1. **Interactive OAuth callback** — Cloudflare Access/Portal hosted login. Needs real browser + human approval.
2. **Portal service-token MCP tests** — Depends on OAuth working first.
3. **Memory API tests** — Test script written but blocked on:
   - Container network DNS (oracle-vps-memory-* hostnames not resolvable from outside)
   - Mem0 API endpoint discovery (endpoints differ from standard v1 paths)

### Known Issues Found & Fixed

- Docker context `orchestrator` misconfigured (tried docker.example.com). Workaround: use default context.
- Infisical CLI v0.43.125 removed `--json` flag (deprecated). Skills using old flag need rewrite.
- REVIEW_QUEUE had 39 stale candidates (14+ days old). Graduated high-priority ones.

### Next Steps

- Interactive OAuth login required to unlock Portal tool tests (out of scope for Claude)
- Memory API tests can proceed once container DNS resolves or test runs inside Oracle network
- Master directive (OpenClaw convergence) can run in parallel after these basics verified
