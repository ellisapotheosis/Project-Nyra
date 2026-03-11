#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"
ENV_EXAMPLE="${INFRA_DIR}/env/nyra.env.example"
ENV_FILE="${INFRA_DIR}/env/nyra.env"

echo "🐾 Nyra bootstrap (repo: ${REPO_ROOT})"

command -v docker >/dev/null 2>&1 || { echo "❌ docker not found"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ docker compose v2 not found"; exit 1; }

mkdir -p "${INFRA_DIR}/data/n8n-files" "${INFRA_DIR}/configs/grafana/provisioning/dashboards-json"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "→ Creating env file: ${ENV_FILE}"
  cp "${ENV_EXAMPLE}" "${ENV_FILE}"
fi

echo "→ Generating missing secrets (won't overwrite non-empty values)"
python3 "${INFRA_DIR}/scripts/gen_secrets.py"

if grep -q "^OPENROUTER_API_KEY=replace_me" "${ENV_FILE}"; then
  echo "❌ OPENROUTER_API_KEY is still 'replace_me' in infra/env/nyra.env"
  echo "   Set it and rerun."
  exit 1
fi

echo "→ Starting stack (profiles: core, ai, mcp, apps, obs)"
docker compose --env-file "${ENV_FILE}" -f "${INFRA_DIR}/compose/nyra.compose.yaml"   --profile core --profile ai --profile mcp --profile apps --profile obs up -d

echo ""
echo "✅ Up."
echo "   TwentyCRM:      http://localhost:3000"
echo "   n8n:            http://localhost:5678"
echo "   Activepieces:   http://localhost:8080"
echo "   LiteLLM:        http://localhost:4000"
echo "   Nexus (MCP):    http://localhost:8000/mcp"
echo "   Grafana:        http://localhost:3001"
echo ""
