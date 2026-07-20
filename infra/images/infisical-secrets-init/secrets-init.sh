#!/bin/sh
set -eu
echo "[Nyra Secrets Init] Fetching secrets from Infisical..."
umask 077
mkdir -p /run/nyra-secrets

infisical export \
  --token="$INFISICAL_TOKEN" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --path="$INFISICAL_PATH" \
  --format=json > /tmp/nyra_secrets_raw.json

/usr/local/bin/materialize-secrets.sh /tmp/nyra_secrets_raw.json

rm -f /tmp/nyra_secrets_raw.json
echo "[Nyra Secrets Init] Done. Secrets available at /run/nyra-secrets/current/."
