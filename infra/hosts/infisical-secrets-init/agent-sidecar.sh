#!/bin/sh
# Live secrets rotation sidecar — polls Infisical and refreshes /run/nyra-secrets/* files.
set -e

POLL_INTERVAL="${INFISICAL_POLL_INTERVAL:-300s}"
echo "[Infisical Agent] Starting live-rotation sidecar (interval: ${POLL_INTERVAL})"

refresh_secrets() {
  infisical export \
    --token="$INFISICAL_TOKEN" \
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
