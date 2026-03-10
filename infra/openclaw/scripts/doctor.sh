#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_OPENCLAW="${ENV_OPENCLAW:-$ROOT_DIR/infra/env/openclaw.env}"
ENV_VOICE="${ENV_VOICE:-$ROOT_DIR/infra/env/openclaw.voice.env}"
ENV_UI="${ENV_UI:-$ROOT_DIR/infra/env/openclaw.ui.env}"

warn=0
ok(){ echo "[OK] $*"; }
ng(){ echo "[WARN] $*"; warn=1; }

for cmd in docker python; do
  command -v "$cmd" >/dev/null 2>&1 && ok "command '$cmd' found" || ng "command '$cmd' not found"
done

for f in "$ENV_OPENCLAW" "$ENV_VOICE" "$ENV_UI" "$ROOT_DIR/infra/openclaw/openclaw.json" "$ROOT_DIR/infra/openclaw/ui/nginx.conf"; do
  [[ -f "$f" ]] && ok "file exists: $f" || ng "missing file: $f"
done

if [[ -f "$ENV_OPENCLAW" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_OPENCLAW"
  set +a
  [[ -n "${OPENAI_API_KEY:-}" && "$OPENAI_API_KEY" != REPLACE_ME_* ]] && ok "OPENAI_API_KEY set" || ng "OPENAI_API_KEY missing/placeholder"
  [[ -n "${MEM0_API_KEY:-}" && "$MEM0_API_KEY" != REPLACE_ME_* ]] && ok "MEM0_API_KEY set" || ng "MEM0_API_KEY missing/placeholder"
fi

python -m json.tool "$ROOT_DIR/infra/openclaw/openclaw.json" >/dev/null 2>&1 && ok "openclaw.json valid JSON" || ng "openclaw.json invalid JSON"
python - <<PY >/dev/null 2>&1 && ok "compose overlays parse" || ng "compose overlay parse failed"
import yaml
for f in [
"$ROOT_DIR/infra/compose/openclaw.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.voice.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.ui.compose.yml",
"$ROOT_DIR/infra/compose/openclaw.ops.compose.yml",
]:
  yaml.safe_load(open(f))
PY

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/infra/docker-compose.yml" -f "$ROOT_DIR/infra/compose/openclaw.compose.yml" --profile openclaw config >/dev/null 2>&1 \
    && ok "docker compose core overlay valid" || ng "docker compose core overlay failed"
fi

if [[ $warn -eq 1 ]]; then
  echo "Doctor completed with warnings."
  exit 1
fi

echo "Doctor checks passed."
