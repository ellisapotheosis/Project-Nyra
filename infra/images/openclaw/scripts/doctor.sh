#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_OPENCLAW="${ENV_OPENCLAW:-$ROOT_DIR/infra/env/openclaw.env}"
ENV_VOICE="${ENV_VOICE:-$ROOT_DIR/infra/env/openclaw.voice.env}"
ENV_UI="${ENV_UI:-$ROOT_DIR/infra/env/openclaw.ui.env}"

warn=0
ok(){ echo "[OK] $*"; }
ng(){ echo "[WARN] $*"; warn=1; }

resolve_infra_path() {
  local path="$1"
  if [[ "$path" = /* ]]; then
    printf '%s\n' "$path"
  else
    printf '%s\n' "$ROOT_DIR/infra/${path#./}"
  fi
}

PYCMD=""
if command -v python >/dev/null 2>&1; then
  PYCMD="python"
elif command -v python3 >/dev/null 2>&1; then
  PYCMD="python3"
fi

command -v docker >/dev/null 2>&1 && ok "command 'docker' found" || ng "command 'docker' not found"
[[ -n "$PYCMD" ]] && ok "python interpreter found: $PYCMD" || ng "python interpreter not found"

for f in "$ENV_OPENCLAW" "$ENV_VOICE" "$ENV_UI" "$ROOT_DIR/infra/openclaw/ui/nginx.conf"; do
  [[ -f "$f" ]] && ok "file exists: $f" || ng "missing file: $f"
done

if [[ -f "$ENV_OPENCLAW" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_OPENCLAW"
  set +a
  [[ -n "${OPENAI_API_KEY:-}" ]] && ok "OPENAI_API_KEY set" || ng "OPENAI_API_KEY missing"
  [[ -n "${MEM0_API_KEY:-}" ]] && ok "MEM0_API_KEY set" || ng "MEM0_API_KEY missing"
  [[ -n "${OPENCLAW_GATEWAY_TOKEN:-}" ]] && ok "OPENCLAW_GATEWAY_TOKEN set" || ng "OPENCLAW_GATEWAY_TOKEN unset (optional for core MVP, required for gateway workflows)"
fi

OPENCLAW_CONFIG_PATH_RESOLVED="$(resolve_infra_path "${OPENCLAW_CONFIG_PATH:-./openclaw/openclaw.json}")"
[[ -f "$OPENCLAW_CONFIG_PATH_RESOLVED" ]] && ok "OpenClaw config exists: $OPENCLAW_CONFIG_PATH_RESOLVED" || ng "missing OpenClaw config: $OPENCLAW_CONFIG_PATH_RESOLVED"

if [[ -n "$PYCMD" ]]; then
  "$PYCMD" -m json.tool "$OPENCLAW_CONFIG_PATH_RESOLVED" >/dev/null 2>&1 && ok "openclaw config valid JSON" || ng "openclaw config invalid JSON"
  "$PYCMD" - <<PY >/dev/null 2>&1 && ok "compose overlays parse" || ng "compose overlay parse failed"
import yaml
for f in [
"$ROOT_DIR/infra/compose/openclaw.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.voice.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.ui.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.ops.compose.yml",
]:
  yaml.safe_load(open(f))
PY
else
  ng "skipping JSON/YAML parser checks because no python interpreter is available"
fi

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/infra/docker-compose.yml" -f "$ROOT_DIR/infra/compose/openclaw.compose.yml" --profile openclaw config >/dev/null 2>&1 \
    && ok "docker compose core overlay valid" || ng "docker compose core overlay failed"
fi

if [[ $warn -eq 1 ]]; then
  echo "Doctor completed with warnings."
  exit 1
fi

echo "Doctor checks passed."
