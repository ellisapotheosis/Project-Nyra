#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

required_docs=(
  docs/ai-orchestration/MCP_ARCHITECTURE.md
  docs/ai-orchestration/MCP_CONTEXT_BENCHMARK.md
  docs/ai-orchestration/MEMORY_ARCHITECTURE.md
  docs/ai-orchestration/LETTA_ROLE.md
  docs/security/CLOUDFLARE_MCP_AUTH.md
  docs/security/MEMORY_ACCESS_POLICY.md
  docs/ai-orchestration/PHASE2_GREEN.json
)

for file in "${required_docs[@]}"; do
  test -s "$file" || { echo "missing or empty: $file" >&2; exit 1; }
done

if rg -n -i 'mempalace|mcplex|grafbase[ /_-]*(api[ /_-]*)?router|graphiti|ruvector' \
  infra/configs/nexus infra/hosts/oracle-vps/docker-compose.yml \
  docs/infrastructure/cloudflared/cloudflared-oracle.yml \
  infra/cloudflare/desired-state/exposure-matrix.yml; then
  echo "forbidden Phase 2 component remains in active Nexus/Oracle configuration" >&2
  exit 1
fi

if rg -n '^[[:space:]]*-[[:space:]]*"?8765:8765"?' infra/hosts/oracle-vps/docker-compose.yml; then
  echo "OpenMemory must not bind to every host interface" >&2
  exit 1
fi

docker compose -f infra/hosts/oracle-vps/docker-compose.yml config --no-interpolate --quiet

python3 - <<'PY'
import json
from pathlib import Path

payload = json.loads(Path("docs/ai-orchestration/PHASE2_GREEN.json").read_text())
assert payload["phase"] == "phase2-mcp-memory"
assert payload["green"] is False and payload["status"] == "blocked"
PY

echo "Phase 2 repository checks passed; live Cloudflare/Nexus/memory evidence is reported in PHASE2_GREEN.json."
