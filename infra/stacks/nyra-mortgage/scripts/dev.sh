#!/usr/bin/env bash
set -euo pipefail

echo "Nyra Stack: local dev startup"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${STACK_DIR}"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Fill keys and worker hosts before distributed routing."
fi

chmod +x ./scripts/mesh-preflight.sh
./scripts/mesh-preflight.sh || true

docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.addons.yml config >/dev/null
docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.addons.yml up -d --build

echo ""
echo "Up. Open:"
echo "  Twenty CRM:            http://localhost:3000"
echo "  Nyra Orchestrator API: http://localhost:8010/docs"
echo "  Nexus Router:          http://localhost:6000"
echo "  LiteLLM:               http://localhost:4000"
echo "  Grafana:               http://localhost:3005 (admin/admin)"
echo "  Open WebUI:            http://localhost:8080"
