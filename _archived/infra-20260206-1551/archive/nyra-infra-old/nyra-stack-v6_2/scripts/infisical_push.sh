#!/usr/bin/env bash
set -euo pipefail
FILES=${FILES:-"nyra-infra/nyra-stack-v6_2/secrets/example.shared.env"}
IFS=',' read -r -a FILES_ARR <<< "$FILES"
PATHS=${PATHS:-"/shared"}
IFS=',' read -r -a PATHS_ARR <<< "$PATHS"
: "${INFISICAL_PROJECT_ID:?Missing}"
: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?Missing}"
: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?Missing}"
INFISICAL_API_URL="${INFISICAL_API_URL:-https://app.infisical.com}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"
export INFISICAL_TOKEN="$(infisical login --method=universal-auth --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --silent --plain)"
export INFISICAL_API_URL
parse() { grep -v '^\s*#' "$1" | grep -v '^\s*$'; }
for f in "${FILES_ARR[@]}"; do
  [[ -f "$f" ]] || { echo "Missing $f" >&2; continue; }
  while IFS= read -r line; do
    key="${line%%=*}"; val="${line#*=}"
    for p in "${PATHS_ARR[@]}"; do
      infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$INFISICAL_ENV" --path="$p" "$key=$val" >/dev/null || true
    done
  done < <(parse "$f")
done
echo "Infisical upload complete."
