#!/usr/bin/env bash
set -euo pipefail

if ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  :
else
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

usage() {
  cat <<'EOF'
Usage: scripts/infisical/capabilities.sh <scan|pam|gateway|kms|status> [args...]

Commands:
  scan      Run the local secret scanner wrapper.
  pam       Delegate to `infisical pam` for privileged access workflows.
  gateway   Delegate to `infisical gateway` for private-resource reachability.
  kms       Run the Infisical KMS API helper.
  status    Print the repository capability map and available local tooling.
EOF
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf '%s[capabilities]%s missing dependency: %s\n' "$RED" "$NC" "$cmd" >&2
    exit 2
  fi
}

run_scan() {
  exec "$ROOT/scripts/security/nyra-secret-scan.sh" "$@"
}

run_pam() {
  require_command infisical
  exec infisical pam "$@"
}

run_gateway() {
  require_command infisical
  exec infisical gateway "$@"
}

run_kms() {
  exec "$SCRIPT_DIR/kms.sh" "$@"
}

show_status() {
  printf '%sInfisical capability surface%s\n' "$BLUE" "$NC"
  printf '  scan     : local leak prevention plus optional Infisical scan\n'
  printf '  pam      : brokered access to servers/databases through Infisical PAM\n'
  printf '  gateway  : private-resource bridge without direct inbound exposure\n'
  printf '  kms      : encrypt/decrypt/sign/verify/key admin through Infisical KMS\n'
  printf '\n'
  printf '%sLocal tooling%s\n' "$BLUE" "$NC"
  if command -v infisical >/dev/null 2>&1; then
    printf '  infisical : %s\n' "$(infisical --version 2>/dev/null || printf 'installed')"
  else
    printf '  infisical : not installed\n'
  fi
  if [[ -x "$ROOT/scripts/security/nyra-secret-scan.sh" ]]; then
    printf '  scan hook : available\n'
  else
    printf '  scan hook : missing\n'
  fi
  printf '\n'
  printf '%sPolicy%s\n' "$BLUE" "$NC"
  printf '  PAM, Gateway, and KMS are Enterprise-tier capabilities.\n'
  printf '  Local secret scanning remains enabled even if Infisical features are unavailable.\n'
}

case "${1:-status}" in
  scan)
    shift
    run_scan "$@"
    ;;
  pam)
    shift
    run_pam "$@"
    ;;
  gateway)
    shift
    run_gateway "$@"
    ;;
  kms)
    shift
    run_kms "$@"
    ;;
  status)
    shift || true
    show_status
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    printf '%s[capabilities]%s unknown command: %s\n' "$RED" "$NC" "$1" >&2
    usage >&2
    exit 2
    ;;
esac
