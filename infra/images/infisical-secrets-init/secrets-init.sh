#!/bin/sh
set -e
echo "[Nyra Secrets Init] Fetching secrets from Infisical..."
mkdir -p /run/nyra-secrets

resolve_infisical_token() {
  if [ -n "${INFISICAL_TOKEN:-}" ]; then
    printf '%s' "$INFISICAL_TOKEN"
    return 0
  fi

  if [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" ] && [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]; then
    infisical login \
      --method=universal-auth \
      --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
      --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
      --silent \
      --plain
    return 0
  fi

  echo "[Nyra Secrets Init] ERROR: set INFISICAL_TOKEN or INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET." >&2
  return 1
}

INFISICAL_RESOLVED_TOKEN="$(resolve_infisical_token)"

infisical export \
  --token="$INFISICAL_RESOLVED_TOKEN" \
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
