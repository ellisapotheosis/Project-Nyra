# Prompt 03 — Infra, Hosts, Secrets, Docker Contexts

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Create/update non-UI infrastructure scaffolding, host-stack docs, Makefile wiring, Docker Context conventions, Infisical sidecar docs, and ops runbooks. Do not touch UI/theme/components.

HOST TOPOLOGY:
- orchestrator: core control plane, Cloudflare Tunnel, OpenClaw Gateway, Nexus/Hive/LiteLLM coordination, root Makefile operations, bitnet.cpp, PocketTTS optional.
- worker-rtx5090: vLLM + LMCache + Redis, model switcher, LiteLLM, OpenClaw/NerveUI, burst reasoning/code/quote workloads; one of two machines with Infisical bootstrap envs.
- worker-rtx3090ti: vLLM + LMCache + Redis, model switcher, LiteLLM, OpenClaw/NerveUI, steady campaign/reply/webhook workloads.
- worker-rtx3060: Ollama, optional Redis, model switcher, LiteLLM, OpenClaw/NerveUI, lightweight/fallback jobs.
- worker-rtx4060 optional: backup OpenClaw Gateway if present.
- oracle: Cloudflare Tunnel, Gitea, Gitea DB, Infisical MCP, Twenty MCP, Git MCP, GitHub MCP, Gitea MCP.
- homeassistant-green: Vaultwarden and Linkwarden on LAN/Tailnet.

REPO STRUCTURE:
All host compose stacks belong under `/infra/hosts/<host-name>`.

SECRETS FLOW:
- Infisical sidecars per compose stack.
- Root Makefile uses Docker contexts.
- Commands are run from orchestrator or worker-rtx5090.
- Only those two machines need Infisical bootstrap env vars in shell/.zshrc.
- Target hosts do not need local plaintext secrets.
- Never commit real secrets.

REQUIRED ACTIONS:
1. Inventory existing `/infra/hosts` child folders and compose files.
2. Archive before replacing any old infra docs.
3. Create/update root Makefile targets:
   - context-list
   - stack-up HOST=<host>
   - stack-down HOST=<host>
   - stack-logs HOST=<host>
   - stack-ps HOST=<host>
   - health HOST=<host>
   - secrets-check HOST=<host>
   - all-health
4. Create/update per-host docs:
   - infra/hosts/orchestrator/README.md
   - infra/hosts/worker-rtx5090/README.md
   - infra/hosts/worker-rtx3090ti/README.md
   - infra/hosts/worker-rtx3060/README.md
   - infra/hosts/oracle/README.md
   - infra/hosts/homeassistant-green/README.md
   - optional worker-rtx4060 README only if folder exists or explicit placeholder docs folder is appropriate.
5. Create compose profile strategy for core, memory, agents, voice, observability, devtools, optional-n8n.
6. Document Portainer CE+agent on orchestrator and agent-only on other hosts.
7. Document Syncthing on all hosts.
8. Document Cloudflare Tunnel only on orchestrator and Oracle.
9. Document Tailscale-only defaults for internal services.
10. Create ops docs:
   - docs/ops/HOST_TOPOLOGY.md
   - docs/ops/INFISICAL_DOCKER_CONTEXT_FLOW.md
   - docs/ops/SERVICE_EXPOSURE_MATRIX.md
   - docs/ops/WORKER_ROUTING.md
   - docs/ops/VOICE_MESH_RUNBOOK.md
   - docs/ops/PORTAINER_SYNCTHING_RUNBOOK.md
   - docs/ops/SUPABASE_LOCAL_RUNBOOK.md
   - docs/ops/NEXUS_HIVE_MIGRATION_NOTES.md
   - docs/ops/N8N_FALLBACK_POLICY.md
   - docs/ops/BACKUP_AND_ARCHIVE_RUNBOOK.md
   - docs/ops/INCIDENT_RESPONSE_RUNBOOK.md
11. Add/update scripts:
   - scripts/healthcheck.sh and .ps1
   - scripts/infisical-run-example.sh and .ps1
   - scripts/docker-context-check.sh and .ps1
   - scripts/no-secrets-scan.sh and .ps1
12. Validate compose config where safe.

FINAL RESPONSE:
Files changed, checks run, host gaps, secrets warnings, exact next command sequence.
```
