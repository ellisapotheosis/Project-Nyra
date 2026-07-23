#!/usr/bin/env bash
set -euo pipefail

AGENT_VAULT_ADDR="${AGENT_VAULT_ADDR:-http://127.0.0.1:14321}"

echo "Checking Agent Vault at ${AGENT_VAULT_ADDR}"

if ! curl -fsS "${AGENT_VAULT_ADDR}/health" >/dev/null 2>&1; then
  echo "ERROR: Agent Vault health endpoint unreachable."
  echo "  - Is the container running? Check: docker ps | grep agent-vault"
  echo "  - Check logs: docker logs nyra-agent-vault"
  exit 1
fi

echo "✓ Health endpoint OK"

if command -v agent-vault >/dev/null 2>&1; then
  echo ""
  echo "Agent Vault CLI info:"
  agent-vault account whoami || echo "  (not logged in)"
  echo ""
  echo "Vaults:"
  agent-vault vault list || true
else
  echo ""
  echo "agent-vault CLI not found on this machine."
  echo "Install with:"
  echo "  curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL https://get.agent-vault.dev | sh"
fi

echo ""
echo "Exposed ports:"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -i vault || echo "  (no agent-vault container found)"
