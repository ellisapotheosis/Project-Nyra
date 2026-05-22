#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

RUN_BUILD=1
RUN_SECURITY=1
REPORT_DIR="${NYRA_RELEASE_REPORT_DIR:-tests/results/release-candidate}"

usage() {
  cat <<'EOF'
Usage: scripts/release/check-release-candidate.sh [options]

Runs the local, non-live release-candidate gate set for Project Nyra.

Options:
  --quick          Skip the workspace production build and quick security scan.
  --no-build       Skip the workspace production build.
  --no-security    Skip the quick security scan.
  --report-dir DIR  Write the timestamped release report under DIR.
  -h, --help       Show this help.

This script does not run live provider, CRM, DNS, Cloudflare, or borrower-data
smoke tests. Those remain owner-gated in docs/user-todo/.
EOF
}

while (($#)); do
  case "$1" in
    --)
      ;;
    --quick)
      RUN_BUILD=0
      RUN_SECURITY=0
      ;;
    --no-build)
      RUN_BUILD=0
      ;;
    --no-security)
      RUN_SECURITY=0
      ;;
    --report-dir)
      shift
      REPORT_DIR="${1:-}"
      if [[ -z "$REPORT_DIR" ]]; then
        echo "--report-dir requires a value" >&2
        exit 2
      fi
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/release-candidate-${TIMESTAMP}.log"
exec > >(tee "$REPORT_FILE") 2>&1

echo "Project Nyra release-candidate report: $REPORT_FILE"
echo "Generated at: $TIMESTAMP"

section() {
  printf '\n== %s ==\n' "$1"
}

run() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
  "$@"
}

section "Workspace Cleanliness"
run git status --short --untracked-files=all
run git diff --check

section "Dependency Audit"
run pnpm audit --prod

section "Smoke Test Suite"
run pnpm test

section "Lead Lifecycle Dry Run"
run pnpm smoke:lead-lifecycle -- --dry-run --report-dir tests/results/lead-lifecycle-smoke

section "App Lint"
run pnpm -C apps/projectnyra lint
run pnpm -C apps/ratehunter lint

section "Infisical Static Coverage"
run pnpm infra:check:infisical

section "Finish-Line Static Validators"
run pnpm exec tsx scripts/release/finish-line-validators.ts --report-dir tests/results/finish-line-readiness

if ((RUN_SECURITY)); then
  section "Quick Security Scan"
  run bash scripts/security/scan.sh --quick
else
  section "Quick Security Scan"
  echo "Skipped by --no-security"
fi

if ((RUN_BUILD)); then
  section "Workspace Build"
  run pnpm -w build
else
  section "Workspace Build"
  echo "Skipped by --no-build"
fi

section "Owner-Gated Checks Not Run"
cat <<'EOF'
- Live DNS and Cloudflare Access validation.
- Live Infisical/provider credential verification.
- Live Twenty CRM write/read smoke.
- Twilio/SendGrid outbound and callback smoke.
- Tailscale/GPU worker private-network smoke.
- Live lead lifecycle:
  pnpm smoke:lead-lifecycle -- --live --report-dir tests/results/lead-lifecycle-smoke

Use docs/user-todo/ and docs/FINISH_LINE_ACCELERATION_PLAN.md after the owner
clears those gates.
EOF

section "Result"
echo "Local release-candidate checks completed."
echo "Report written to $REPORT_FILE"
