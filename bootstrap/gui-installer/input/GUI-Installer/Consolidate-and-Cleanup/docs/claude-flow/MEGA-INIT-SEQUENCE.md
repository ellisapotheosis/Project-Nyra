# Claude-Flow (alpha) – “All Features” Init Sequence (Nyra)

## Philosophy
- Run **one** template init to scaffold structure.
- Then run mode injectors **one-by-one** (so you can preserve your repo README and configs).
- Every init step in the scripts backs up clobber-prone files into `bootstrap/_backups/<timestamp>/`.

## Command set (PowerShell)
From repo root:

```powershell
# Always run tools via pnpm dlx to avoid polluting node_modules
volta install node@22 pnpm@9
pnpm -v
node -v

# 1) Template scaffold
pnpm dlx claude-flow@alpha init --template web-app --force

# 2) Enhanced + pairing + verification + webui config injection
pnpm dlx claude-flow@alpha init --enhanced --verify --pair --webui --force

# 3) Feature mode injectors (best-effort; scripts try each and continue if unsupported)
pnpm dlx claude-flow@alpha init --sparc --force
pnpm dlx claude-flow@alpha init --neural --force
pnpm dlx claude-flow@alpha init --hive-mind --force
pnpm dlx claude-flow@alpha init --github --force
pnpm dlx claude-flow@alpha init --enterprise --force
pnpm dlx claude-flow@alpha init --monitoring --force

# 4) Memory: ReasoningBank
pnpm dlx claude-flow@alpha memory init --reasoningbank

# 5) Optional: Agent Booster benchmark (produces a local baseline)
pnpm dlx claude-flow@alpha agent-booster benchmark

# 6) Optional: Proxy (OpenRouter style)
pnpm dlx claude-flow@alpha proxy start --port 8080
```

## Recommended env vars
See:
- `infra/env/lan/shared/.env.example`

