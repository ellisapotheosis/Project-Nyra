#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

compose_files=()
while IFS= read -r -d '' file; do
  compose_files+=("$file")
done < <(
  find infra/hosts -type f \
    \( -iname '*compose*.yml' \
    -o -iname '*compose*.yaml' \
    -o -iname 'compose.yml' \
    -o -iname 'docker-compose.yml' \
    -o -iname 'docker-compose.*.yml' \
    -o -iname 'docker-compose.*.yaml' \) \
    -print0 | sort -z
)

failures=0
warnings=0
notes=0

section() {
  printf '\n== %s ==\n' "$1"
}

fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1" >&2
}

note() {
  notes=$((notes + 1))
  printf 'NOTE: %s\n' "$1"
}

pass() {
  printf 'OK: %s\n' "$1"
}

grep_compose() {
  grep -HnE "$1" "${compose_files[@]}" 2>/dev/null || true
}

grep_worker_compose() {
  local files=()
  local file
  for file in "${compose_files[@]}"; do
    case "$file" in
      infra/hosts/worker-*) files+=("$file") ;;
    esac
  done

  if ((${#files[@]} == 0)); then
    return 0
  fi

  grep -HnE "$1" "${files[@]}" 2>/dev/null || true
}

section "Compose Source Of Truth"
if scripts/infra/assert-compose-source-of-truth.sh; then
  pass "Compose runtime sources are scoped to infra/hosts/*"
else
  fail "Compose runtime sources exist outside infra/hosts/*"
fi

section "Secret Defaults"
secret_default_pattern='(PASSWORD|SECRET|TOKEN|API_KEY|KEY)[^}]*:-([^}[:space:]]*)'
insecure_default_pattern=':-((admin)|(password)|(pass)|(changeme)|(change-me[^}]*)|(dummy)|(sk-dummy)|(OPENLIT)|(paperclip))'

if matches=$(grep_compose "$secret_default_pattern" | grep -E "$insecure_default_pattern" || true); then
  if [[ -n "$matches" ]]; then
    printf '%s\n' "$matches" >&2
    fail "Insecure secret defaults remain in host compose files"
  else
    pass "No known insecure secret defaults found in host compose files"
  fi
fi

required_secret_pattern='\$\{[A-Z0-9_]+:\?'
if required=$(grep_compose "$required_secret_pattern" | wc -l | tr -d ' '); then
  pass "$required compose secret references fail closed with :? guards"
fi

section "Worker Public Exposure"
worker_cloudflared=$(grep_worker_compose '^[[:space:]]*cloudflared:')
if [[ -n "$worker_cloudflared" ]]; then
  printf '%s\n' "$worker_cloudflared" >&2
  note "Worker compose files contain disabled cloudflared service stubs; keep workers tunnel-free at runtime"
else
  pass "No worker cloudflared services found"
fi

worker_public_ports=$(grep_worker_compose '0\.0\.0\.0:[0-9]+:[0-9]+')
if [[ -n "$worker_public_ports" ]]; then
  printf '%s\n' "$worker_public_ports" >&2
  note "Worker GPU ports bind 0.0.0.0 for Tailscale access; confirm host firewall/Tailscale-only reachability before deploy"
else
  pass "No worker ports explicitly bind 0.0.0.0"
fi

section "Privileged Containers"
privileged=$(grep_compose 'privileged:[[:space:]]*true')
if [[ -n "$privileged" ]]; then
  printf '%s\n' "$privileged" >&2
  note "Privileged containers exist; current expected use is local host/container metrics collection"
else
  pass "No privileged containers found"
fi

section "Summary"
printf 'Failures: %s\nWarnings: %s\nNotes: %s\nCompose files checked: %s\n' "$failures" "$warnings" "$notes" "${#compose_files[@]}"

if (( failures > 0 )); then
  exit 1
fi
