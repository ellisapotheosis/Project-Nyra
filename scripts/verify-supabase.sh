#!/usr/bin/env bash
set -euo pipefail

SUPABASE_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-https://api.projectnyra.com}}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}}"

printf 'Supabase endpoint: %s\n' "$SUPABASE_URL"

health_code="$(curl --silent --show-error --location --output /dev/null --write-out '%{http_code}' --max-time 15 "$SUPABASE_URL/auth/v1/health")"
case "$health_code" in
  200|401) printf 'Auth gateway: PASS (%s)\n' "$health_code" ;;
  *) printf 'Auth gateway: FAIL (%s)\n' "$health_code" >&2; exit 1 ;;
esac

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
  printf 'REST gateway: SKIP (set SUPABASE_ANON_KEY for authenticated probe)\n'
  exit 0
fi

rest_code="$(curl --silent --show-error --location --output /dev/null --write-out '%{http_code}' --max-time 15 \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/users?select=id&limit=1")"
case "$rest_code" in
  200|206) printf 'REST gateway: PASS (%s)\n' "$rest_code" ;;
  401|403) printf 'REST gateway: REACHABLE but unauthorized (%s)\n' "$rest_code"; exit 1 ;;
  *) printf 'REST gateway: FAIL (%s)\n' "$rest_code" >&2; exit 1 ;;
esac

