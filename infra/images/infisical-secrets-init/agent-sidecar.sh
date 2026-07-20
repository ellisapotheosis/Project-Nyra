#!/bin/sh
# Live secret-file rotation sidecar. Consumers must explicitly read
# /run/nyra-secrets/current/<lower-case-key>; container environments do not rotate.
set -eu

POLL_INTERVAL="${INFISICAL_POLL_INTERVAL:-300s}"
echo "[Infisical Agent] Starting live-rotation sidecar (interval: ${POLL_INTERVAL})"

refresh_secrets() {
  infisical export \
    --token="$INFISICAL_TOKEN" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$INFISICAL_PATH" \
    --format=json > /tmp/nyra_agent_raw.json 2>/dev/null || {
      echo "[Infisical Agent] WARNING: export failed, retaining current secrets"
      return 1
    }

  /usr/local/bin/materialize-secrets.sh /tmp/nyra_agent_raw.json
  rm -f /tmp/nyra_agent_raw.json
  echo "[Infisical Agent] Secrets refreshed at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

# Parse interval number for sleep (strip trailing 's' if present)
SLEEP_SECS=$(printf '%s' "$POLL_INTERVAL" | tr -d 's')

refresh_secrets || true
while true; do
  sleep "$SLEEP_SECS"
  refresh_secrets || true
done
