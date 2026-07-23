#!/usr/bin/env bash
set -euo pipefail

: "${AGENT_VAULT_ADDR:?Set AGENT_VAULT_ADDR, e.g. http://127.0.0.1:14321}"
: "${INFISICAL_PROJECT_ID:?Set INFISICAL_PROJECT_ID}"
: "${INFISICAL_ENV:=dev}"

command -v agent-vault >/dev/null 2>&1 || {
  echo "agent-vault CLI not found. Install with:"
  echo "  curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL https://get.agent-vault.dev | sh"
  exit 1
}

echo "Creating Infisical-backed Agent Vault vaults..."
echo "  AGENT_VAULT_ADDR=${AGENT_VAULT_ADDR}"
echo "  INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}"
echo "  INFISICAL_ENV=${INFISICAL_ENV}"
echo ""

agent-vault vault create nyra-llm \
  --credential-store=infisical \
  --infisical-project-id="${INFISICAL_PROJECT_ID}" \
  --infisical-environment="${INFISICAL_ENV}" \
  --infisical-path=/agents/agent-vault/llm \
  --poll-interval-seconds=60 || echo "  (vault may already exist)"

agent-vault vault create nyra-github \
  --credential-store=infisical \
  --infisical-project-id="${INFISICAL_PROJECT_ID}" \
  --infisical-environment="${INFISICAL_ENV}" \
  --infisical-path=/agents/agent-vault/github \
  --poll-interval-seconds=60 || echo "  (vault may already exist)"

agent-vault vault create nyra-comms \
  --credential-store=infisical \
  --infisical-project-id="${INFISICAL_PROJECT_ID}" \
  --infisical-environment="${INFISICAL_ENV}" \
  --infisical-path=/agents/agent-vault/comms \
  --poll-interval-seconds=60 || echo "  (vault may already exist)"

echo ""
echo "Vault summary:"
agent-vault vault credential-store show nyra-llm || true
agent-vault vault credential-store show nyra-github || true
agent-vault vault credential-store show nyra-comms || true
