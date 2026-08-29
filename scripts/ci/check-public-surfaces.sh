#!/usr/bin/env bash
set -euo pipefail

public_surfaces=(
  "https://projectnyra.com|Project Nyra"
  "https://ratehunter.net|RateHunter"
  "https://3d.ratehunter.net|RateHunter 3D"
)

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

for entry in "${public_surfaces[@]}"; do
  url=${entry%%|*}
  marker=${entry#*|}
  body="$tmp_dir/${#url}"
  status=$(curl --fail-with-body --silent --show-error --location \
    --max-time 20 --retry 2 --retry-all-errors \
    --output "$body" --write-out '%{http_code}' "$url")
  [[ "$status" == "200" ]] || {
    printf 'public surface failed: %s returned HTTP %s\n' "$url" "$status" >&2
    exit 1
  }
  grep -Fq "$marker" "$body" || {
    printf 'public surface failed: %s missing marker %q\n' "$url" "$marker" >&2
    exit 1
  }
  printf 'public surface healthy: %s (HTTP %s)\n' "$url" "$status"
done

app_status=$(curl --silent --show-error --location \
  --max-time 20 --retry 2 --retry-all-errors \
  --output /dev/null --write-out '%{http_code}' \
  'https://app.projectnyra.com')
case "$app_status" in
  200|302|401|403) printf 'protected app reachable: https://app.projectnyra.com (HTTP %s)\n' "$app_status" ;;
  *) printf 'protected app failed: https://app.projectnyra.com returned HTTP %s\n' "$app_status" >&2; exit 1 ;;
esac
