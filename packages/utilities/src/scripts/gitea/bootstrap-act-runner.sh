#!/usr/bin/env sh
set -eu

CONFIG_TEMPLATE="${GITEA_RUNNER_CONFIG_TEMPLATE:-/config.template.yaml}"
CONFIG_PATH="${GITEA_RUNNER_CONFIG_PATH:-/data/config.yaml}"
RUNNER_STATE_FILE="${GITEA_RUNNER_STATE_FILE:-/data/.runner}"
TOKEN_FILE="${GITEA_RUNNER_REGISTRATION_TOKEN_FILE:-/run/nyra-secrets/gitea_runner_token}"
INSTANCE_URL="${GITEA_INSTANCE_URL:-http://gitea:3000}"
RUNNER_NAME="${GITEA_RUNNER_NAME:-nyra-runner-orchestrator}"
RUNNER_LABELS="${GITEA_RUNNER_LABELS:-ubuntu-latest:docker://node:20-bookworm,docker:host,self-hosted:host}"

mkdir -p /data

if [ ! -f "$CONFIG_PATH" ]; then
  cp "$CONFIG_TEMPLATE" "$CONFIG_PATH"
fi

if [ ! -f "$RUNNER_STATE_FILE" ]; then
  if [ ! -s "$TOKEN_FILE" ]; then
    echo "ERROR: runner registration token file missing or empty: $TOKEN_FILE" >&2
    exit 1
  fi

  TOKEN="$(cat "$TOKEN_FILE")"
  echo "Registering Gitea runner '$RUNNER_NAME' at $INSTANCE_URL"
  act_runner register \
    --no-interactive \
    --instance "$INSTANCE_URL" \
    --token "$TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS"
fi

echo "Starting Gitea act_runner daemon"
exec act_runner daemon --config "$CONFIG_PATH"
