# Step-by-step (Windows only)
## 0) Requirements
Docker Desktop, Git, Node.js 20+, Python 3.11+
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
```
## 1) Install
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\nyra-infra\tasks\windows\nyra-bootstrap.ps1
```
## 2) Env & network
```powershell
'APP_URL=http://localhost:12008' | Out-File -Encoding utf8 -FilePath .\nyra-infra\.env
docker network create nyra-network
```
## 3) Bring up core
```powershell
docker compose -f .\nyra-infra\compose\compose.core.yml --env-file .\nyra-infra\.env up -d
```
## 4) Init Claude-Flow
```powershell
npx claude-flow@alpha init --force
```
## 5) Run consolidation (Claude Code prompt)
> Use **nyra-consolidate-bootstraps**, **nyra-consolidate-docker**, **nyra-consolidate-mcp** to migrate everything into `nyra-infra/*`. Follow **nyra-cheap-mode** + **nyra-git-discipline**.
