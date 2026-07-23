#!/usr/bin/env bash
set -euo pipefail

: "${AGENT_VAULT_ADDR:?Set AGENT_VAULT_ADDR}"
: "${AGENT_VAULT_TOKEN:?Set AGENT_VAULT_TOKEN}"
: "${AGENT_VAULT_VAULT:=nyra-llm}"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <agent-command> [args...]"
  echo ""
  echo "Examples:"
  echo "  $0 my-custom-agent --help"
  echo "  $0 python scripts/my-agent.py"
  exit 2
fi

command -v agent-vault >/dev/null 2>&1 || {
  echo "Install agent-vault CLI first:"
  echo "  curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL https://get.agent-vault.dev | sh"
  exit 1
}

export AGENT_VAULT_ADDR
export AGENT_VAULT_TOKEN
export AGENT_VAULT_VAULT

exec agent-vault run -- "$@"
