#!/usr/bin/env bash
# Print an Infisical access token for automation.
#
# Preferred auth is Universal Auth:
#   INFISICAL_UNIVERSAL_AUTH_CLIENT_ID
#   INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
#
# Fallback auth is a pre-existing INFISICAL_TOKEN. Secret values are never
# logged; the caller may capture stdout and pass it to infisical --token.

set -euo pipefail

LOCAL_SECRETS_FILE="${INFISICAL_LOCAL_SECRETS_FILE:-$HOME/.zsh/99-secrets.zsh}"
INFISICAL_DOMAIN="${INFISICAL_API_URL:-${INFISICAL_DOMAIN:-https://app.infisical.com/api}}"

if [[ -f "$LOCAL_SECRETS_FILE" ]]; then
  if [[ -z "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" || -z "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$LOCAL_SECRETS_FILE" >/dev/null 2>&1 || true
    set +a
  fi
fi

if [[ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" && -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]]; then
  token="$(
    infisical login \
      --method universal-auth \
      --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
      --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
      --domain "$INFISICAL_DOMAIN" \
      --plain \
      --silent 2>/dev/null || true
  )"
  if [[ -n "$token" ]]; then
    printf '%s\n' "$token"
    exit 0
  fi
fi

if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
  printf '%s\n' "$INFISICAL_TOKEN"
  exit 0
fi

echo "ERROR: set INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET or INFISICAL_TOKEN." >&2
exit 1
