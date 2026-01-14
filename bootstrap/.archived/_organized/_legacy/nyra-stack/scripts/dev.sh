#!/usr/bin/env bash
set -euo pipefail

echo "Nyra Stack: local dev startup"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Fill keys before using outbound comms / LLM providers."
fi

docker compose -f docker-compose.yml -f docker-compose.services.yml up -d --build

echo ""
echo "Up. Open:"
echo "  Twenty CRM:            http://localhost:3000"
echo "  Nyra Orchestrator API: http://localhost:8010/docs"
echo "  Nexus Router:          http://localhost:6000"
echo "  Grafana:               http://localhost:3005 (admin/admin)"
echo "  Open WebUI:            http://localhost:8080"
