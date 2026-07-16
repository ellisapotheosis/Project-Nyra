#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENVIRONMENT="${INFISICAL_ENV:-prod}"
INFISICAL_SECRET_PATH="${INFISICAL_PATH:-/machines/oracle-vps}"
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
import sys

p = Path(sys.argv[1])
lines = p.read_text(errors="replace").splitlines()
invalid = []
duplicates = []
seen = set()
assignments = 0

for number, line in enumerate(lines, 1):
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        continue
    if "=" not in stripped:
        invalid.append(number)
        continue
    key, _value = stripped.split("=", 1)
    key = key.strip().removeprefix("export ").strip()
    if not key or any(ch.isspace() for ch in key):
        invalid.append(number)
        continue
    assignments += 1
    if key in seen:
        duplicates.append(key)
    seen.add(key)

print(
    f"lines={len(lines)} active_assignments={assignments} "
    f"unique_keys={len(seen)} invalid_lines={len(invalid)} "
    f"duplicate_keys={len(duplicates)}"
)

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

tmp_env="$(mktemp /tmp/oracle-vps.env.XXXXXX)"
trap 'rm -f "$tmp_env"' EXIT
chmod 600 "$tmp_env"

echo "Exporting Infisical secrets: project=${PROJECT_ID} env=${INFISICAL_ENVIRONMENT} path=${INFISICAL_SECRET_PATH}"
infisical export \
  --projectId="$PROJECT_ID" \
  --env="$INFISICAL_ENVIRONMENT" \
  --path="$INFISICAL_SECRET_PATH" \
  --format=dotenv \
  --silent > "$tmp_env"

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
p = Path('$REMOTE_ENV_PATH')
lines = p.read_text(errors='replace').splitlines()
invalid = []
seen = set()
duplicates = []
assignments = 0
for number, line in enumerate(lines, 1):
    stripped = line.strip()
    if not stripped or stripped.startswith('#'):
        continue
    if '=' not in stripped:
        invalid.append(number)
        continue
    key, _value = stripped.split('=', 1)
    key = key.strip().removeprefix('export ').strip()
    if not key or any(ch.isspace() for ch in key):
        invalid.append(number)
        continue
    assignments += 1
    if key in seen:
        duplicates.append(key)
    seen.add(key)
print(f'lines={len(lines)} active_assignments={assignments} unique_keys={len(seen)} invalid_lines={len(invalid)} duplicate_keys={len(duplicates)}')
if invalid or duplicates:
    raise SystemExit(1)
PY"

echo "Remote env repaired. Backup: ${remote_backup}"
