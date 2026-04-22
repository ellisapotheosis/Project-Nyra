#!/bin/sh
set -e
echo "[Nyra Secrets Init] Fetching secrets from Infisical..."
mkdir -p /run/nyra-secrets

infisical export \
  --token="$INFISICAL_TOKEN" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$INFISICAL_PATH" \
  --format=dotenv > /tmp/nyra_secrets_raw.env

# Write each secret as an individual file (KEY=VALUE -> /run/nyra-secrets/key)
# Downstream services use *_FILE env vars that expect plain-value files.
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    \#*|"") continue ;;
  esac
  key="${line%%=*}"
  val="${line#*=}"
  val="${val%\"}"
  val="${val#\"}"
  fname=$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')
  # Create parent directories if key contains slashes
  mkdir -p "$(dirname "/run/nyra-secrets/${fname}")"
  printf '%s' "$val" > "/run/nyra-secrets/${fname}"
done < /tmp/nyra_secrets_raw.env

rm -f /tmp/nyra_secrets_raw.env
echo "[Nyra Secrets Init] Done. Secrets written to /run/nyra-secrets/"
