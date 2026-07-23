#!/usr/bin/env bash
set -Eeuo pipefail

INFISICAL_ENV=${INFISICAL_ENV:-prod}
OUT_DIR=${OUT_DIR:-/etc/projectnyra/secrets}
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
umask 077

die() { printf '[infisical-forgejo] ERROR: %s\n' "$*" >&2; exit 1; }
command -v infisical >/dev/null || die 'infisical CLI is required'
command -v python3 >/dev/null || die 'python3 is required'
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
  mkdir -p "$OUT_DIR"
else
  command -v sudo >/dev/null || die 'sudo is required to write /etc/projectnyra/secrets'
  sudo -n install -d -m 0700 "$OUT_DIR"
fi

get_infisical_token() {
  if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
    printf '%s' "$INFISICAL_TOKEN"
    return 0
  fi

  local client_secret
  client_secret=${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-${INFISICAL_UNIVERSAL_AUTH_SECRET:-}}
  if [[ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" && -n "$client_secret" ]]; then
    infisical login --method universal-auth \
      --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
      --client-secret "$client_secret" \
      --plain
    return 0
  fi

  die 'set INFISICAL_TOKEN or INFISICAL_UNIVERSAL_AUTH_CLIENT_ID plus INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET'
}

INFISICAL_ACCESS_TOKEN=$(get_infisical_token)

export_path() {
  local path=$1 output=$2
  local rendered
  rendered=$(mktemp)
  infisical export --env "$INFISICAL_ENV" --path "$path" --format json --silent --token "$INFISICAL_ACCESS_TOKEN" >"$TMP" || die "Infisical export failed for $path"
  test -s "$TMP" || die "Infisical path is empty: $path"
  python3 - "$TMP" "$rendered" "$path" <<'PY'
import json
import pathlib
import sys

source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2])
path = sys.argv[3]

allowlists = {
    "/apps/forgejo": {
        "FORGEJO_DB_PASSWORD",
        "FORGEJO_SECRET_KEY",
        "FORGEJO_INTERNAL_TOKEN",
        "FORGEJO_JWT_SECRET",
        "FORGEJO_ADMIN_TOKEN",
        "FORGEJO_SMTP_PASSWORD",
        "FORGEJO_OAUTH_CLIENT_SECRET",
    },
    "/apps/forgejo-runner": {
        "FORGEJO_RUNNER_REGISTRATION_TOKEN",
    },
    "/apps/renovate": {
        "RENOVATE_TOKEN",
        "RENOVATE_GITHUB_COM_TOKEN",
        "RENOVATE_DOCKER_USERNAME",
        "RENOVATE_DOCKER_PASSWORD",
        "RENOVATE_NPM_TOKEN",
    },
    "/apps/komodo": {
        "KOMODO_API_TOKEN",
        "KOMODO_WEBHOOK_SECRET",
        "KOMODO_REGISTRY_USERNAME",
        "KOMODO_REGISTRY_PASSWORD",
    },
}

payload = json.loads(source.read_text())
allowed = allowlists[path]
lines = []
for item in payload:
    key = item["key"]
    if key not in allowed:
        continue
    value = item.get("value", "")
    if value is None:
        value = ""
    value = str(value).replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')
    lines.append(f'{key}="{value}"')

if not lines:
    raise SystemExit(f"no allowlisted secrets found for {path}")

target.write_text("\n".join(lines) + "\n")
PY
  if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
    install -m 0600 "$rendered" "$OUT_DIR/$output"
  else
    sudo -n install -m 0600 "$rendered" "$OUT_DIR/$output"
  fi
  rm -f "$rendered"
}

export_path /apps/forgejo forgejo.env
export_path /apps/forgejo-runner forgejo-runner.env
export_path /apps/renovate renovate.env
export_path /apps/komodo komodo.env
printf '[infisical-forgejo] wrote four mode-0600 secret files under %s\n' "$OUT_DIR"
