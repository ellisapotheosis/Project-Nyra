# PROJECT NYRA — REPO CONSOLIDATION & CLEANUP PROMPT
## For Claude Code / Claude Desktop

**Objective**: Prepare the repository for the new bootstrap infrastructure package by auditing the codebase, identifying duplicates/dead code, consolidating Docker Compose files, normalizing monorepo structure, fixing imports, validating integrity, and generating a cleanup report.

**Estimated Runtime**: 45–60 minutes automated  
**Definition of Done**: Consolidation artifacts created, imports normalized, validations executed, report generated, and ready for `make init && make bootstrap`.

---

## EXECUTION CONTRACT (IMPORTANT)

You are executing this in an existing repository.

1. Use `set -euo pipefail` in all bash blocks.
2. Use `docker compose` (plugin) first; only fallback to `docker-compose` if plugin unavailable.
3. Never delete compose/env files before creating backups.
4. Never commit secrets (`.env`, API keys, tokens, passwords).
5. After each phase, print:
   - files changed,
   - validation status (pass/fail/warn),
   - next action.
6. If a command/tool is missing, continue with best-effort and log warning in the report.
7. If writing markdown or scripts that contain heredocs, **never reuse the same delimiter name** (avoid accidental execution/cutoff).

---

## PHASE 0 — PREFLIGHT & TOOLING CHECK

Run:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🔎 PREFLIGHT"

echo "Repo: $(pwd)"
git rev-parse --is-inside-work-tree >/dev/null

echo "Git status:"
git status --short || true

echo "\nTool versions:"
(command -v node >/dev/null && node --version) || echo "⚠️ node not found"
(command -v npm >/dev/null && npm --version) || echo "⚠️ npm not found"
(command -v bun >/dev/null && bun --version) || echo "ℹ️ bun not found"
(command -v pnpm >/dev/null && pnpm --version) || echo "ℹ️ pnpm not found"
(command -v docker >/dev/null && docker --version) || echo "⚠️ docker not found"

if command -v docker >/dev/null; then
  docker ps >/dev/null 2>&1 && echo "✅ docker daemon reachable" || echo "⚠️ docker daemon not reachable"
fi

if docker compose version >/dev/null 2>&1; then
  echo "✅ docker compose plugin available"
elif command -v docker-compose >/dev/null 2>&1; then
  echo "⚠️ using legacy docker-compose"
else
  echo "⚠️ no compose command available"
fi
```

---

## PHASE 1 — CODEBASE AUDIT

### 1.1 Create Inventory Report

```bash
#!/usr/bin/env bash
set -euo pipefail

AUDIT_REPORT="CODEBASE_AUDIT_$(date +%Y%m%d_%H%M%S).md"

{
  echo "# Codebase Audit Report"
  echo "Date: $(date -Iseconds)"
  echo

  echo "## 1) Source Inventory"
  total_src=$(find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/build/*' ! -path '*/.next/*' | wc -l)
  echo "- Total TS/JS files: $total_src"
  echo

  echo "### Lines of code by top-level folders"
  for dir in src services apps packages; do
    if [ -d "$dir" ]; then
      loc=$(find "$dir" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
        ! -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
      echo "- $dir: ${loc:-0}"
    fi
  done
  echo

  echo "## 2) Docker Artifacts"
  find . -type f \( -name 'Dockerfile*' -o -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) | sort
  echo

  echo "## 3) Config & Env"
  echo "### .env files"
  find . -type f -name '.env*' ! -path '*/node_modules/*' | sort
  echo
  echo "### TOML/YAML files (first 100)"
  find . -type f \( -name '*.toml' -o -name '*.yaml' -o -name '*.yml' \) ! -path '*/node_modules/*' ! -path '*/.git/*' | sort | head -100
  echo

  echo "## 4) Tree snapshot"
  tree -L 2 -I 'node_modules|.git|dist|build' 2>/dev/null || find . -maxdepth 2 -type d ! -path '*/.*' | sort
} | tee "$AUDIT_REPORT"

echo "✅ Audit complete: $AUDIT_REPORT"
```

### 1.2 Duplicate & Dead-Code Heuristic Scan

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Duplicate/Dead-code scan"

echo "\nCompose files:"
find . -type f \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) | sort

echo "\n.env files:"
find . -type f -name '.env*' ! -path '*/node_modules/*' | sort

echo "\nPotentially under-imported services (heuristic):"
if [ -d src/services ]; then
  for d in src/services/*/; do
    [ -d "$d" ] || continue
    s="$(basename "$d")"
    imports=$(rg -n "services/$s" src --glob '*.ts' --glob '*.tsx' 2>/dev/null | wc -l || true)
    if [ "${imports:-0}" -lt 2 ]; then
      echo "⚠️  $s imported ${imports:-0} times"
    fi
  done
else
  echo "ℹ️ src/services not found; skipped heuristic"
fi
```

---

## PHASE 2 — DOCKER COMPOSE CONSOLIDATION

### 2.1 Audit existing compose files, services, and ports

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🐳 Compose audit"

find . -type f \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) | sort | while read -r f; do
  echo "\n📄 $f"
  echo "lines: $(wc -l < "$f")"
  echo "services (heuristic):"
  awk '/^services:/{flag=1;next}/^[^[:space:]]/{if(flag)exit}flag' "$f" \
    | sed -n 's/^  \([a-zA-Z0-9._-][a-zA-Z0-9._-]*\):.*/- \1/p' | head -30
  echo "ports:"
  rg -n "[0-9]{2,5}:[0-9]{2,5}" "$f" || true
done
```

### 2.2 Backup and validate master compose file

```bash
#!/usr/bin/env bash
set -euo pipefail

ts="$(date +%Y%m%d_%H%M%S)"
backup_dir="infra/docker-compose.backups/$ts"
mkdir -p "$backup_dir"

find infra -maxdepth 4 -type f \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) -exec cp {} "$backup_dir" \;

echo "✅ Backed up compose files to $backup_dir"

if docker compose -f infra/docker-compose.yml config >/dev/null 2>&1; then
  echo "✅ docker compose config valid"
elif command -v docker-compose >/dev/null 2>&1 && docker-compose -f infra/docker-compose.yml config >/dev/null 2>&1; then
  echo "⚠️ valid via docker-compose legacy"
else
  echo "❌ compose validation failed (fix before deleting old files)"
  exit 1
fi
```

### 2.3 Optional cleanup (only if validation passed)

```bash
#!/usr/bin/env bash
set -euo pipefail

# ONLY run if Phase 2.2 passed and backups exist
rm -f infra/docker-compose.orchestrator.yml || true
rm -f infra/docker-compose.workers.yml || true
rm -f infra/docker-compose.oracle.yml || true

echo "✅ Optional old compose files removed"
```

---

## PHASE 3 — MONOREPO STRUCTURE NORMALIZATION

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🏗️ Creating/normalizing monorepo directories"
mkdir -p src/{orchestrator,agents,services,mcp-servers,workflows}
mkdir -p packages/{types,db,utils,mcp}
mkdir -p apps/{landing-page,admin-ui,borrower-portal,archon-integrations}
mkdir -p config/{orchestrator,oracle,secrets}
mkdir -p tests/{unit,integration,e2e}
mkdir -p docs scripts

echo "✅ Directory structure normalized"
```

---

## PHASE 4 — IMPORT PATH NORMALIZATION

### 4.1 Patch `tsconfig.json` paths (if needed)

Add/verify aliases:
- `@nyra/types` → `packages/types/index.ts`
- `@nyra/db` → `packages/db/index.ts`
- `@nyra/utils` → `packages/utils/index.ts`
- `@nyra/mcp` → `packages/mcp/index.ts`
- `@nyra/services` → `src/services/index.ts`
- `@nyra/agents` → `src/agents/index.ts`
- `@nyra/workflows` → `src/workflows/index.ts`

### 4.2 Safe incremental replacement strategy

1. Detect relative imports first:
```bash
rg -n "from ['\"]\.\./" src packages apps --glob '*.ts' --glob '*.tsx' || true
```
2. Replace one pattern at a time.
3. Run `npx tsc --noEmit` after each replacement batch.
4. If errors spike, revert that batch.

---

## PHASE 5 — CONFIG CONSOLIDATION

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "⚙️ Consolidating env/config"
mkdir -p config/secrets/backups

# Backup env files found at root
find . -maxdepth 1 -type f -name '.env*' -exec cp {} config/secrets/backups/ \; 2>/dev/null || true

# Ensure env example targets exist
mkdir -p config/orchestrator config/oracle
if [ -f .env.example ]; then
  cp .env.example config/orchestrator/.env.example
  cp .env.example config/oracle/.env.example
else
  echo "⚠️ .env.example missing; create one before bootstrap"
fi

# Canonical config directories
mkdir -p infra/nexus infra/prometheus

echo "✅ Config consolidation scaffolding complete"
```

---

## PHASE 6 — VALIDATION MATRIX

Run all checks and collect results:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "✅ Validation matrix"

# Compose
if docker compose -f infra/docker-compose.yml config >/dev/null 2>&1; then
  echo "PASS compose"
elif command -v docker-compose >/dev/null 2>&1 && docker-compose -f infra/docker-compose.yml config >/dev/null 2>&1; then
  echo "WARN compose (legacy docker-compose used)"
else
  echo "FAIL compose"
fi

# TypeScript
if npx tsc --noEmit >/dev/null 2>&1; then
  echo "PASS tsc"
else
  echo "WARN tsc"
fi

# Tests
if npm test >/dev/null 2>&1; then
  echo "PASS tests"
else
  echo "WARN tests"
fi

# Lint
if npx eslint . >/dev/null 2>&1; then
  echo "PASS eslint"
else
  echo "WARN eslint"
fi

# JSON sanity
if command -v jq >/dev/null 2>&1 && jq . package.json >/dev/null 2>&1; then
  echo "PASS package.json"
else
  echo "WARN package.json/jq"
fi
```

---

## PHASE 7 — CONSOLIDATION REPORT GENERATION

```bash
#!/usr/bin/env bash
set -euo pipefail

REPORT="CONSOLIDATION_REPORT_$(date +%Y%m%d_%H%M%S).md"

compose_count=$(find . -type f \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) | wc -l)
src_count=$(find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) 2>/dev/null | wc -l || true)

{
  echo "# Repository Consolidation Report"
  echo "Date: $(date -Iseconds)"
  echo
  echo "## Completed"
  echo "- [x] Preflight"
  echo "- [x] Audit"
  echo "- [x] Duplicate scan"
  echo "- [x] Compose backup/validation"
  echo "- [x] Monorepo structure normalization"
  echo "- [x] Config/env scaffolding"
  echo
  echo "## Metrics"
  echo "- Source files in src/: $src_count"
  echo "- Compose files currently present: $compose_count"
  echo
  echo "## Manual Follow-ups"
  echo "1. Resolve any TypeScript errors from alias migration"
  echo "2. Confirm env values and secret injection workflow"
  echo "3. Execute bootstrap: make init && make bootstrap"
} | tee "$REPORT"

echo "📄 Generated $REPORT"
```

---

## PHASE 8 — GIT SAFETY + NEXT STEPS

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Git safety"
git status --short

echo "\nSensitive file check (.env/secret/password):"
git status --short | rg -n "\.env|secret|password|token|apikey|api_key" || echo "✓ none detected in working tree status"

echo "\nNext recommended commands:"
echo "  git add -A"
echo "  git commit -m 'chore: repo consolidation & cleanup'"
echo "  make init && make bootstrap"
```

---

## QUICK START (COPY/PASTE SAFE)

> Use this exact block to avoid accidental heredoc breakage:

```bash
cat > REPO-CONSOLIDATION-PROMPT.md <<'PROMPT_DOC_EOF'
# (Paste full prompt content here)
PROMPT_DOC_EOF
```

Then in Claude Code/Desktop:
1. Open a new chat.
2. Paste the full prompt.
3. Ask: **"Execute this consolidation plan phase by phase and stop on failures."**

---

## COMMON FAILURE MODES + DEBUG PLAYBOOK

1. **Prompt appears to auto-run while being written**
   - Cause: heredoc delimiter collision.
   - Fix: unique outer delimiter (`PROMPT_DOC_EOF`) that does not occur in content.

2. **`docker-compose` not found**
   - Use `docker compose` plugin first.
   - If both missing, install Docker/Compose or run compose checks in CI.

3. **`vitest: not found`**
   - Run dependency install first (`npm install` or workspace package manager).
   - Re-run `npm test`.

4. **ESLint v9 config error (`eslint.config.*` missing)**
   - Add flat config or use project-specific lint command.
   - Until configured, treat lint as warn and capture in report.

5. **TypeScript alias migration causes breakage**
   - Batch replacements by folder.
   - Compile after each batch (`npx tsc --noEmit`).
   - Revert last batch if error count spikes.

6. **`npm install` fails on native modules (`node-gyp`, missing `distutils`)**
   - Ensure Python tooling exists (`python3`, `setuptools`, compiler toolchain).
   - If Node version mismatch appears (ex: package requires Node 22+), switch via nvm before install.
   - Re-run install, then re-run tests/lint.

---

## FINAL SUCCESS CHECKLIST

- [ ] Audit report generated (`CODEBASE_AUDIT_*.md`)
- [ ] Compose backups created
- [ ] `infra/docker-compose.yml` validates
- [ ] Monorepo folders normalized
- [ ] Import alias strategy applied (or migration plan documented)
- [ ] Env/config consolidation completed
- [ ] Consolidation report generated (`CONSOLIDATION_REPORT_*.md`)
- [ ] Validation outcomes captured (compose/tsc/tests/lint)
- [ ] No secrets staged for commit
- [ ] Ready for `make init && make bootstrap`

