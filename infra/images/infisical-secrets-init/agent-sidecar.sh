#!/bin/sh
# Live secrets rotation sidecar — polls Infisical and refreshes /run/nyra-secrets/* files.
set -e

POLL_INTERVAL="${INFISICAL_POLL_INTERVAL:-300s}"
echo "[Infisical Agent] Starting live-rotation sidecar (interval: ${POLL_INTERVAL})"

get_auth_token() {
  if [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" ] && [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]; then
    token="$(infisical login --method universal-auth --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --plain --silent 2>/dev/null || true)"
    if [ -n "$token" ]; then
      printf '%s' "$token"
      return 0
    fi
  fi

  if [ -n "${INFISICAL_TOKEN:-}" ]; then
    printf '%s' "$INFISICAL_TOKEN"
    return 0
  fi

  return 1
}

refresh_secrets() {
  auth_token="$(get_auth_token)" || {
    echo "[Infisical Agent] WARNING: no Infisical auth available, retaining current secrets"
    return 1
  }

  infisical export \
    --token="$auth_token" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$INFISICAL_PATH" \
    --format=dotenv > /tmp/nyra_agent_raw.env 2>/dev/null || {
      echo "[Infisical Agent] WARNING: export failed, retaining current secrets"
      return 1
    }

  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      \#*|"") continue ;;
    esac
    key="${line%%=*}"
    val="${line#*=}"
    val="${val%\"}"
    val="${val#\"}"
    fname=$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')
    mkdir -p "$(dirname "/run/nyra-secrets/${fname}")"
    printf '%s' "$val" > "/run/nyra-secrets/${fname}"
    done < /tmp/nyra_agent_raw.env

  rm -f /tmp/nyra_agent_raw.env
  echo "[Infisical Agent] Secrets refreshed at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

# Parse interval number for sleep (strip trailing 's' if present)
SLEEP_SECS=$(printf '%s' "$POLL_INTERVAL" | tr -d 's')

while true; do
  sleep "$SLEEP_SECS"
  refresh_secrets || true
done
