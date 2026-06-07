#!/bin/sh
set -e
echo "[Nyra Secrets Init] Fetching secrets from Infisical..."
mkdir -p /run/nyra-secrets

auth_token=""
if [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" ] && [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]; then
  auth_token="$(infisical login --method universal-auth --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --plain --silent 2>/dev/null || true)"
fi
if [ -z "$auth_token" ] && [ -n "${INFISICAL_TOKEN:-}" ]; then
  auth_token="$INFISICAL_TOKEN"
fi
if [ -z "$auth_token" ]; then
  echo "[Nyra Secrets Init] ERROR: set Universal Auth client credentials or INFISICAL_TOKEN." >&2
  exit 1
fi

infisical export \
  --token="$auth_token" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$INFISICAL_PATH" \
  --format=json > /tmp/nyra_secrets_raw.json

# Use jq to create individual files directly in a subshell to avoid shell splitting issues
jq -c '.[]' /tmp/nyra_secrets_raw.json | while read -r row; do
    key=$(echo "$row" | jq -r '.key')
    val=$(echo "$row" | jq -r '.value')

    if [ -z "$key" ] || [ "$key" = "null" ]; then continue; fi

    fname=$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')
    echo "[Nyra Secrets Init] Writing secret: $fname"

    target="/run/nyra-secrets/${fname}"
    mkdir -p "$(dirname "$target")"

    printf '%s' "$val" > "$target"
done

rm -f /tmp/nyra_secrets_raw.json
echo "[Nyra Secrets Init] Done. Secrets written to /run/nyra-secrets/"
