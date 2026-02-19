#!/bin/bash
# Save as: ~/projects/project-nyra/infra/scripts/health-check-all.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Project Nyra - Service Health Check                ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# MCP Servers
echo -e "\n📡 MCP SERVERS"
echo "─────────────────────────────────────────"

services=(
  "Nexus Router|http://localhost:6000/health"
  "Claude-Flow|http://localhost:3001/health"
  "Graphiti|http://localhost:8100/health"
  "RuVector|http://localhost:8200/health"
  "AgentDB|http://localhost:8300/health"
  "Twenty MCP|http://localhost:8400/health"
  "LiteLLM|http://localhost:8500/health"
  "Letta AI|http://localhost:8283/health"
  "Activepieces|http://localhost:5000/health"
)

for service in "${services[@]}"; do
  name="${service%%|*}"
  url="${service#*|}"
  response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  if [ "$response" == "200" ]; then
    echo "  ✅ $name: HEALTHY"
  else
    echo "  ❌ $name: UNHEALTHY (HTTP $response)"
  fi
done

# Core Services
echo -e "\n🏢 CORE SERVICES"
echo "─────────────────────────────────────────"

core_services=(
  "Twenty CRM|http://localhost:3020/healthz"
  "n8n|http://localhost:5678/healthz"
  "Archon OS|http://localhost:4000/health"
  "Archon UI|http://localhost:4001/"
  "Claude-Flow Dashboard|http://localhost:3100/"
  "Gitea|http://localhost:3000/api/healthz"
  "Moltbot|http://localhost:3333/health"
)

for service in "${core_services[@]}"; do
  name="${service%%|*}"
  url="${service#*|}"
  response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  if [ "$response" == "200" ]; then
    echo "  ✅ $name: HEALTHY"
  else
    echo "  ❌ $name: UNHEALTHY (HTTP $response)"
  fi
done

# Databases
echo -e "\n🗄️  DATABASES"
echo "─────────────────────────────────────────"

pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo "  ✅ Twenty Postgres: READY" || echo "  ❌ Twenty Postgres: NOT READY"
pg_isready -h localhost -p 5433 > /dev/null 2>&1 && echo "  ✅ RuVector Postgres: READY" || echo "  ❌ RuVector Postgres: NOT READY"
pg_isready -h localhost -p 5434 > /dev/null 2>&1 && echo "  ✅ Archon Postgres: READY" || echo "  ❌ Archon Postgres: NOT READY"
redis-cli -p 6379 ping > /dev/null 2>&1 && echo "  ✅ Redis: PONG" || echo "  ❌ Redis: NO RESPONSE"
redis-cli -p 6380 ping > /dev/null 2>&1 && echo "  ✅ FalkorDB: PONG" || echo "  ❌ FalkorDB: NO RESPONSE"

# Tailscale
echo -e "\n🌐 TAILSCALE NETWORK"
echo "─────────────────────────────────────────"
if command -v tailscale &> /dev/null; then
  ts_ip=$(tailscale ip -4 2>/dev/null || echo "unknown")
  echo "  ✅ Orchestrator IP: $ts_ip"

  # Ping workers
  for worker in "100.107.188.97" "100.102.204.112"; do
    if tailscale ping -c 1 "$worker" > /dev/null 2>&1; then
      echo "  ✅ Worker $worker: REACHABLE"
    else
      echo "  ⚠️  Worker $worker: UNREACHABLE"
    fi
  done
fi

echo -e "\n✨ Health check complete!"
