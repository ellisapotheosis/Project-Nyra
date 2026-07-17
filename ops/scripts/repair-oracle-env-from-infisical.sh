#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENVIRONMENT="${INFISICAL_ENV:-prod}"
INFISICAL_SECRET_PATH="${INFISICAL_PATH:-/hosts/oracle-vps}"
INFISICAL_DOMAIN_VALUE="${INFISICAL_DOMAIN:-${INFISICAL_API_URL:-${INFISICAL_URL:-}}}"
REMOTE_HOST="${ORACLE_VPS_SSH_HOST:-oracle-vps}"
REMOTE_ENV_PATH="${ORACLE_VPS_ENV_PATH:-/home/ubuntu/project-nyra/infra/hosts/oracle-vps/.env}"
DRY_RUN="${DRY_RUN:-0}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 127
  fi
}

validate_dotenv() {
  local file="$1"
  python3 - "$file" <<'PY'
from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
lines = p.read_text(errors="replace").splitlines()
invalid = []
duplicates = []
seen = set()
assignments = 0
open_quote = None
key_pattern = re.compile(r"^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=")

def closes_quote(value: str, quote: str) -> bool:
    escaped = False
    for ch in value:
        if escaped:
            escaped = False
            continue
        if quote == '"' and ch == "\\":
            escaped = True
            continue
        if ch == quote:
            return True
    return False

for number, line in enumerate(lines, 1):
    stripped = line.strip()
    if open_quote:
        if closes_quote(stripped, open_quote):
            open_quote = None
        continue
    if not stripped or stripped.startswith("#"):
        continue
    match = key_pattern.match(stripped)
    if not match:
        invalid.append(number)
        continue
    key = match.group(1)
    _key, value = stripped.split("=", 1)
    assignments += 1
    if key in seen:
        duplicates.append(key)
    seen.add(key)
    value = value.lstrip()
    if value.startswith(("'", '"')):
        quote = value[0]
        if not closes_quote(value[1:], quote):
            open_quote = quote

print(
    f"lines={len(lines)} active_assignments={assignments} "
    f"unique_keys={len(seen)} invalid_lines={len(invalid)} "
    f"duplicate_keys={len(duplicates)}"
)

if open_quote:
    print("unterminated_quoted_value=true")
    raise SystemExit(1)
if invalid:
    print("invalid_line_numbers=" + ",".join(map(str, invalid[:50])))
if duplicates:
    print("duplicate_keys=" + ",".join(duplicates[:50]))

if invalid or duplicates:
    raise SystemExit(1)
PY
}

require_cmd infisical
require_cmd python3
require_cmd ssh
require_cmd scp

infisical_domain_args=()
if [[ -n "$INFISICAL_DOMAIN_VALUE" ]]; then
  infisical_domain_args+=(--domain "$INFISICAL_DOMAIN_VALUE")
fi

infisical_token_args=()
if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
  infisical_token_args+=(--token "$INFISICAL_TOKEN")
else
  universal_client_id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-${INFISICAL_UNIVERSAL_AUTH_ID:-}}"
  universal_client_secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-${INFISICAL_UNIVERSAL_AUTH_SECRET:-}}"
  if [[ -n "$universal_client_id" && -n "$universal_client_secret" ]]; then
    echo "Authenticating to Infisical with Universal Auth"
    access_token="$(
      infisical login \
        --method=universal-auth \
        --client-id="$universal_client_id" \
        --client-secret="$universal_client_secret" \
        --plain \
        --silent \
        "${infisical_domain_args[@]}"
    )"
    infisical_token_args+=(--token "$access_token")
  fi
fi

tmp_env="$(mktemp /tmp/oracle-vps.env.XXXXXX)"
trap 'rm -f "$tmp_env"' EXIT
chmod 600 "$tmp_env"

echo "Exporting Infisical secrets: project=${PROJECT_ID} env=${INFISICAL_ENVIRONMENT} path=${INFISICAL_SECRET_PATH}"
infisical export \
  --projectId="$PROJECT_ID" \
  --env="$INFISICAL_ENVIRONMENT" \
  --path="$INFISICAL_SECRET_PATH" \
  --format=dotenv \
  --silent \
  "${infisical_domain_args[@]}" \
  "${infisical_token_args[@]}" > "$tmp_env"

echo "Validating exported dotenv syntax"
validate_dotenv "$tmp_env"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "DRY_RUN=1, not uploading to ${REMOTE_HOST}:${REMOTE_ENV_PATH}"
  exit 0
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
remote_tmp="/tmp/oracle-vps.env.${timestamp}"
remote_backup="${REMOTE_ENV_PATH}.bak.${timestamp}"

echo "Uploading validated env to ${REMOTE_HOST}:${remote_tmp}"
scp -q "$tmp_env" "${REMOTE_HOST}:${remote_tmp}"

echo "Backing up and replacing remote env"
ssh "$REMOTE_HOST" "set -euo pipefail
  test -f '$REMOTE_ENV_PATH'
  cp '$REMOTE_ENV_PATH' '$remote_backup'
  install -m 600 '$remote_tmp' '$REMOTE_ENV_PATH'
  rm -f '$remote_tmp'
  python3 - <<'PY'
from pathlib import Path
import re
p = Path('$REMOTE_ENV_PATH')
lines = p.read_text(errors='replace').splitlines()
invalid = []
seen = set()
duplicates = []
assignments = 0
open_quote = None
key_pattern = re.compile(r'^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=')

def closes_quote(value: str, quote: str) -> bool:
    escaped = False
    for ch in value:
        if escaped:
            escaped = False
            continue
        if quote == '\"' and ch == '\\\\':
            escaped = True
            continue
        if ch == quote:
            return True
    return False

for number, line in enumerate(lines, 1):
    stripped = line.strip()
    if open_quote:
        if closes_quote(stripped, open_quote):
            open_quote = None
        continue
    if not stripped or stripped.startswith('#'):
        continue
    match = key_pattern.match(stripped)
    if not match:
        invalid.append(number)
        continue
    key = match.group(1)
    _key, value = stripped.split('=', 1)
    assignments += 1
    if key in seen:
        duplicates.append(key)
    seen.add(key)
    value = value.lstrip()
    if value.startswith((\"'\", '\"')):
        quote = value[0]
        if not closes_quote(value[1:], quote):
            open_quote = quote

print(f'lines={len(lines)} active_assignments={assignments} unique_keys={len(seen)} invalid_lines={len(invalid)} duplicate_keys={len(duplicates)}')
if open_quote:
    print('unterminated_quoted_value=true')
    raise SystemExit(1)
if invalid or duplicates:
    raise SystemExit(1)
PY"

echo "Remote env repaired. Backup: ${remote_backup}"
