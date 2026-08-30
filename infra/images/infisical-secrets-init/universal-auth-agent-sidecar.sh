#!/bin/sh
# File-backed secret rotation with Infisical Universal Auth renewal.
# Values are never printed; failed refreshes retain the last complete generation.
set -eu

POLL_INTERVAL="${INFISICAL_POLL_INTERVAL:-300}"

require_value() {
  variable_name="$1"
  eval "variable_value=\${$variable_name:-}"
  if [ -z "$variable_value" ]; then
    echo "[Agent Vault] missing required configuration: $variable_name" >&2
    return 1
  fi
}

resolve_token() {
  if [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" ] || \
     [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]; then
    require_value INFISICAL_UNIVERSAL_AUTH_CLIENT_ID
    require_value INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
    require_value INFISICAL_HOST_URL

    infisical login --method universal-auth \
      --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
      --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
      --domain "$INFISICAL_HOST_URL" \
      --silent 2>&1 \
      | awk '/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/ { token=$0 } END { print token }'
    return
  fi

  require_value INFISICAL_TOKEN
  printf '%s' "$INFISICAL_TOKEN"
}

refresh_secrets() {
  token="$(resolve_token)" || return 1
  if [ -z "$token" ]; then
    echo "[Agent Vault] authentication returned no token; retaining current generation" >&2
    return 1
  fi

  raw_file="$(mktemp /tmp/nyra-agent-vault.XXXXXX.json)"
  trap 'rm -f "$raw_file"' EXIT HUP INT TERM

  if ! infisical export \
    --token="$token" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$INFISICAL_PATH" \
    --format=json \
    --silent >"$raw_file" 2>/dev/null; then
    rm -f "$raw_file"
    trap - EXIT HUP INT TERM
    unset token
    echo "[Agent Vault] export failed; retaining current generation" >&2
    return 1
  fi

  /usr/local/bin/materialize-secrets.sh "$raw_file"
  rm -f "$raw_file"
  trap - EXIT HUP INT TERM
  unset token
  echo "[Agent Vault] published a complete generation at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

require_value INFISICAL_PROJECT_ID
require_value INFISICAL_ENV
require_value INFISICAL_PATH

case "$POLL_INTERVAL" in
  ''|*[!0-9]*)
    echo "[Agent Vault] INFISICAL_POLL_INTERVAL must be whole seconds" >&2
    exit 2
    ;;
esac

refresh_secrets || {
  echo "[Agent Vault] initial secret materialization failed" >&2
  exit 1
}

while :; do
  sleep "$POLL_INTERVAL"
  refresh_secrets || true
done
