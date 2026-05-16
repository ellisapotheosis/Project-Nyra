#!/usr/bin/env bash
set -u

usage() {
  cat <<'USAGE'
Usage:
  bash ops/scripts/nyra-smoke-checks.sh [--json] [--strict] [--out path]

Runs read-only HTTP smoke checks against Project Nyra control-plane and worker
endpoints. Without --strict, unreachable services are reported but do not make
the command fail.
USAGE
}

JSON=false
STRICT=false
OUT_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      JSON=true
      shift
      ;;
    --strict)
      STRICT=true
      shift
      ;;
    --out)
      OUT_FILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

ORCH_HOST="${NYRA_ORCH_HOST:-orchestrator.trex-fiordland.ts.net}"
ORACLE_HOST="${NYRA_ORACLE_HOST:-oracle-vps.trex-fiordland.ts.net}"
W5090_HOST="${NYRA_W5090_HOST:-worker-rtx5090.trex-fiordland.ts.net}"
W3090_HOST="${NYRA_W3090_HOST:-worker-rtx3090ti.trex-fiordland.ts.net}"
W3060_HOST="${NYRA_W3060_HOST:-worker-rtx3060.trex-fiordland.ts.net}"

GITEA_PORT="${GITEA_HTTP_PORT:-${GITEA_PORT:-3100}}"
PAPERCLIP_PORT="${PAPERCLIP_PORT:-3101}"

declare -a checks=(
  "orchestrator-nexus|http://$ORCH_HOST:6000/health"
  "orchestrator-litellm|http://$ORCH_HOST:4000/health"
  "gitea|${NYRA_GITEA_URL:-http://$ORACLE_HOST:$GITEA_PORT/api/healthz}"
  "paperclip|${NYRA_PAPERCLIP_URL:-http://$ORACLE_HOST:$PAPERCLIP_PORT/health}"
  "worker-rtx5090-vllm|http://$W5090_HOST:8000/health"
  "worker-rtx3090ti-vllm|http://$W3090_HOST:8000/health"
  "worker-rtx3060-ollama|http://$W3060_HOST:11434/api/tags"
)

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

run_check() {
  local name="$1"
  local url="$2"
  local status elapsed

  local start end
  start="$(date +%s)"
  status="$(curl -fsS -m "${NYRA_SMOKE_TIMEOUT:-5}" -o /dev/null -w '%{http_code}' "$url" 2>/tmp/nyra-smoke.err || true)"
  end="$(date +%s)"
  elapsed=$((end - start))

  if [[ "$status" =~ ^[23][0-9][0-9]$ ]]; then
    printf '%s|ok|%s|%s|%s\n' "$name" "$status" "$elapsed" "$url"
  else
    local err
    err="$(tr '\n' ' ' </tmp/nyra-smoke.err | sed 's/[[:space:]]\+/ /g')"
    printf '%s|fail|%s|%s|%s|%s\n' "$name" "${status:-000}" "$elapsed" "$url" "$err"
  fi
}

declare -a results=()
failures=0

for check in "${checks[@]}"; do
  IFS='|' read -r name url <<<"$check"
  result="$(run_check "$name" "$url")"
  results+=("$result")
  IFS='|' read -r _ state _ <<<"$result"
  if [[ "$state" != "ok" ]]; then
    failures=$((failures + 1))
  fi
done

rm -f /tmp/nyra-smoke.err

render_text() {
  printf '%-26s %-6s %-6s %s\n' "check" "state" "code" "url"
  for result in "${results[@]}"; do
    IFS='|' read -r name state code _elapsed url _err <<<"$result"
    printf '%-26s %-6s %-6s %s\n' "$name" "$state" "$code" "$url"
  done
}

render_json() {
  printf '{\n'
  printf '  "strict": %s,\n' "$STRICT"
  printf '  "failures": %s,\n' "$failures"
  printf '  "checks": [\n'
  local index=0
  local total="${#results[@]}"
  for result in "${results[@]}"; do
    IFS='|' read -r name state code elapsed url err <<<"$result"
    printf '    {"name":"%s","state":"%s","status":"%s","elapsed_seconds":%s,"url":"%s","error":"%s"}' \
      "$(json_escape "$name")" \
      "$(json_escape "$state")" \
      "$code" \
      "$elapsed" \
      "$(json_escape "$url")" \
      "$(json_escape "${err:-}")"
    index=$((index + 1))
    if [[ "$index" -lt "$total" ]]; then
      printf ','
    fi
    printf '\n'
  done
  printf '  ]\n'
  printf '}\n'
}

if [[ "$JSON" == true ]]; then
  output="$(render_json)"
else
  output="$(render_text)"
fi

if [[ -n "$OUT_FILE" ]]; then
  printf '%s\n' "$output" >"$OUT_FILE"
fi

printf '%s\n' "$output"

if [[ "$STRICT" == true && "$failures" -gt 0 ]]; then
  exit 1
fi
