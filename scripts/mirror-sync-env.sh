#!/usr/bin/env bash

# =============================================================================
# Project Nyra - Infisical Mirror-Sync Script
# =============================================================================
# Merges /shared secrets and /machines/[host] secrets into local .env files.
# =============================================================================

set -euo pipefail

SECRETS_FILE="$HOME/.zsh/99-secrets.zsh"
if [[ -z "${INFISICAL_TOKEN:-}" && -f "$SECRETS_FILE" ]]; then
  set +u
  set -a
  # shellcheck source=/dev/null
  source "$SECRETS_FILE"
  set +a
  set -u
fi

if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
  echo "Error: INFISICAL_TOKEN is missing from your environment!"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENV_NAME="${INFISICAL_ENV:-${AGENT_INFRA_ENV:-prod}}"
BASE_DIR="${ROOT_DIR}/infra/hosts"

echo "🐾 Starting Mirror-Sync for Project Nyra..."

# Loop through every directory in infra/hosts
for dir in "$BASE_DIR"/*/; do
    # Skip non-host directories
    if [[ "$dir" == *"/_templates/" ]] || [[ "$dir" == *"/homeassistant/" ]]; then
        continue
    fi

    folder_name=$(basename "$dir")
    infisical_path="/machines/$folder_name"
    target_env="${dir}.env"
    example_env="${dir}.env.example"
    local_env_host="${dir}.env.host"

    echo "🔍 Processing $folder_name -> $infisical_path"

    : > "$target_env"

    if [[ -f "$example_env" ]]; then
        cat "$example_env" >> "$target_env"
    fi

    printf "\n# --- Host Specific Local Overrides ---\n" >> "$target_env"
    if [[ -f "$local_env_host" ]]; then
        cat "$local_env_host" >> "$target_env"
    fi

    printf "\n# --- Infisical Secrets (Shared + Machine) ---\n" >> "$target_env"
    infisical export \
        --projectId="$PROJECT_ID" \
        --env="$INFISICAL_ENV_NAME" \
        --path="$infisical_path" \
        --format=dotenv >> "$target_env"

    echo "✅ Created $target_env"
done

echo "🎉 Injection complete! Time to check those stack requirements. nya~"
