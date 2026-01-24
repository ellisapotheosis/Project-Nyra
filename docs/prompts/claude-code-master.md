# Claude Code Master Prompt — Project Nyra (Bootstrap Kit)

You are Claude Code operating in my **project-nyra** repository on Windows (PowerShell preferred).  
Goal: refactor the repo into the canonical Nyra monorepo + bring the stack up in dev.

## Absolute rules
- Follow `docs/decisions/STACK_DECISIONS.md` (authoritative). New decisions override older docs.
- Remove / do not add: Flowise, GoHighLevel MCP, mcproxy, MetaMCP, Plano.
- Borrower-facing automation is logistics-only; enforce `prompts/compliance/logistics_guardrail.md`.
- Any refactor must preserve history where possible; move legacy into `_legacy/` instead of deleting.

## Step 1 — Apply this bootstrap kit
From repo root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
./bootstrap/00_apply.ps1
```

## Step 2 — Validate
```powershell
./bootstrap/verify_kit.ps1
```

## Step 3 — Bring up dev stack
```powershell
Copy-Item infra/.env.example infra/.env -Force
# edit infra/.env and fill secrets
docker compose -f infra/docker-compose.dev.yml up -d --build
```

## Step 4 — Launch admin UI
```powershell
cd apps/nyra-admin
copy .env.example .env.local
# fill Dify app id
pnpm install
pnpm dev -- --port 3002
```

## Step 5 — Spawn build swarms (claude-flow)
From repo root:

```powershell
npx @claude-flow/cli@latest init --sparc
npx claude-flow sparc batch "prompts/claude-flow/NYRA_MASTER_SWARM.md"
```

## Optional: clone forks for deeper integration work
```powershell
./bootstrap/clone_forks.ps1
```
