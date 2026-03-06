#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="$(dirname "$0")/../env/.env"
[[ -f "$ENV_FILE" ]] || cp "$(dirname "$0")/../env/.env.example" "$ENV_FILE"

if command -v 7z >/dev/null 2>&1; then
  find "$(dirname "$0")/../integrations" -type f -name "*.7z" -print0 2>/dev/null | while IFS= read -r -d '' f; do
    7z x "$f" -o"$(dirname "$f")" -y >/dev/null
  done
fi

pushd "$(dirname "$0")/../orchestrator" >/dev/null
PROFILES="--profile orchestration --profile ui --profile secrets"
[[ "${1:-}" == "--public" ]] && PROFILES="$PROFILES --profile edge"
docker compose --env-file ../env/.env -f docker-compose.yml $PROFILES up -d
popd >/dev/null

find "$(dirname "$0")/../integrations" -type f -name "docker-compose*.yml" -print0 2>/dev/null | while IFS= read -r -d '' f; do
  d="$(dirname "$f")"; ( cd "$d" && docker compose --env-file "$(dirname "$0")/../env/.env" -f "$(basename "$f")" up -d )
done

"$(dirname "$0")/metamcp_preseed.sh" "http://localhost:12008" "openwebui-api" || true
"$(dirname "$0")/register_owui_toolserver.sh" "http://localhost:3000" "http://localhost:12008/metamcp/openwebui-api/api" "" || true
echo "NYRA v6.2 started."
