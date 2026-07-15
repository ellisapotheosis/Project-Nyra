#!/usr/bin/env bash
set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MODE="staged"
INSTALL_HOOK=0
SHOW_HELP=0

usage() {
  cat <<'EOF'
Usage: nyra-secret-scan.sh [--staged|--all|--history] [--install-hook]

Modes:
  --staged        Scan staged content only (default, hook-safe)
  --all           Scan tracked + untracked working tree files
  --history       Scan git history
  --install-hook  Install this scanner as the repo pre-commit hook
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staged) MODE="staged" ;;
    --all) MODE="all" ;;
    --history) MODE="history" ;;
    --install-hook) INSTALL_HOOK=1 ;;
    -h|--help) SHOW_HELP=1 ;;
    *)
      echo "${RED}[nyra-secret-scan]${NC} unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
  shift
done

if [[ "$SHOW_HELP" -eq 1 ]]; then
  usage
  exit 0
fi

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "${RED}[nyra-secret-scan]${NC} missing dependency: $cmd" >&2
    exit 2
  fi
}

require_command git
require_command grep

CI_MODE="${CI:-false}"

banner() {
  echo "${BLUE}=================================================================${NC}"
  echo "${BLUE}Project Nyra Secret Scan${NC}"
  echo "${BLUE}Mode: ${MODE}${NC}"
  echo "${BLUE}CI: ${CI_MODE}${NC}"
  echo "${BLUE}Root: ${ROOT}${NC}"
  echo "${BLUE}=================================================================${NC}"
}

supports_infisical_scan() {
  command -v infisical >/dev/null 2>&1 && infisical scan --help >/dev/null 2>&1
}

install_hook() {
  local hook_dir="$ROOT/scripts/security/hooks"
  mkdir -p "$hook_dir"

  cat > "$hook_dir/pre-commit" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
exec "$ROOT/scripts/security/nyra-secret-scan.sh" --staged
EOF

  chmod 755 "$hook_dir/pre-commit"
  git config --local core.hooksPath scripts/security/hooks
  chmod 755 "$ROOT/scripts/security/nyra-secret-scan.sh"
  echo "${GREEN}[nyra-secret-scan]${NC} installed hook at scripts/security/hooks/pre-commit"
}

declare -a RULE_NAMES=(
  "OPENAI_KEY"
  "ANTHROPIC_KEY"
  "GITHUB_TOKEN"
  "GOOGLE_API_KEY"
  "PRIVATE_KEY_BLOCK"
  "DATABASE_URL_WITH_PASSWORD"
  "JWT_SECRET_ASSIGNMENT"
  "GENERIC_HIGH_ENTROPY_ASSIGNMENT"
  "SECRET_PATH"
)

declare -a RULE_PATTERNS=(
  'sk-[A-Za-z0-9_-]{20,}'
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}'
  'AIza[0-9A-Za-z_-]{35}'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  'postgres(ql)?://[^[:space:]]+:[^[:space:]@]+@'
  '(^|[^A-Z0-9_])(JWT_SECRET|SESSION_SECRET|AUTH_SECRET|NEXUS_JWT_SECRET|SUPABASE_JWT_SECRET)[A-Za-z0-9_]*[[:space:]]*=[[:space:]]*["'"'"']?[A-Za-z0-9+/=_-]{16,}'
  '(^|[^A-Z0-9_])(SECRET|TOKEN|KEY|PASSWORD|CLIENT_SECRET|SERVICE_ROLE_KEY)[A-Za-z0-9_]*[[:space:]]*=[[:space:]]*["'"'"']?[A-Za-z0-9+/=_-]{32,}'
  '(^|/)\.env([./_-]|$)'
)

should_skip_path() {
  case "$1" in
    Makefile|*/Makefile|*.mk|*"/node_modules/"*|*"/.next/"*|*"/.turbo/"*|*"/dist/"*|*"/build/"*|*"/coverage/"*|*"/.cache/"*|*"/.pnpm-store/"*|*"/vendor/"*)
      return 0
      ;;
  esac
  return 1
}

scan_file() {
  local source="$1"
  local display_path="$2"
  local temp_file="$3"
  local hit=0
  local idx

  if [[ ! -s "$temp_file" ]]; then
    return 0
  fi

  for idx in "${!RULE_NAMES[@]}"; do
    if grep -nE -I -m 1 -- "${RULE_PATTERNS[$idx]}" "$temp_file" >/dev/null 2>&1; then
      if [[ "$hit" -eq 0 ]]; then
        echo "${YELLOW}[LEAK-DETECTED]${NC} ${source}: ${display_path}"
        hit=1
      fi
      echo "  - ${RULE_NAMES[$idx]}"
      leak_count=$((leak_count + 1))
    fi
  done
}

scan_staged_fallback() {
  local path tmp
  tmp="$(mktemp)"
  while IFS= read -r -d '' path; do
    [[ -n "$path" ]] || continue
    if should_skip_path "$path"; then
      continue
    fi
    case "$path" in
      *example*|*template*|*sample*)
        ;;
      *.env|*.env.*|*.env.local|*.env.*.local|*.pem|*.key|*.token|*.secret|*.secrets)
        echo "${YELLOW}[LEAK-DETECTED]${NC} staged: ${path}"
        echo "  - SECRET_PATH"
        leak_count=$((leak_count + 1))
        continue
        ;;
    esac
    if ! git show ":$path" >"$tmp" 2>/dev/null; then
      continue
    fi
    scan_file "staged" "$path" "$tmp"
  done < <(git diff --cached --name-only -z --diff-filter=ACMR)
  rm -f "$tmp"
}

scan_worktree_fallback() {
  local path tmp
  tmp="$(mktemp)"
  while IFS= read -r -d '' path; do
    [[ -n "$path" ]] || continue
    if should_skip_path "$path"; then
      continue
    fi
    [[ -f "$path" ]] || continue
    case "$path" in
      *example*|*template*|*sample*)
        ;;
      *.env|*.env.*|*.env.local|*.env.*.local|*.pem|*.key|*.token|*.secret|*.secrets)
        echo "${YELLOW}[LEAK-DETECTED]${NC} working-tree: ${path}"
        echo "  - SECRET_PATH"
        leak_count=$((leak_count + 1))
        continue
        ;;
    esac
    if ! grep -Iq . "$path"; then
      continue
    fi
    cp "$path" "$tmp"
    scan_file "working-tree" "$path" "$tmp"
  done < <(git ls-files -co --exclude-standard -z)
  rm -f "$tmp"
}

scan_history_fallback() {
  local path tmp
  tmp="$(mktemp)"
  while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    if should_skip_path "$path"; then
      continue
    fi
    if git log -p --all --no-color -- "$path" >"$tmp" 2>/dev/null; then
      scan_file "history" "$path" "$tmp"
    fi
  done < <(git ls-files)
  rm -f "$tmp"
}

scan_with_infisical() {
  local tmp_log tmp_report status
  tmp_log="$(mktemp)"
  tmp_report="$(mktemp)"

  set +e
  case "$MODE" in
    staged)
      infisical scan git-changes --staged --redact --no-color --report-format=json --report-path="$tmp_report" 2>&1 | tee "$tmp_log"
      ;;
    all)
      infisical scan --no-git --source "$ROOT" --redact --no-color --report-format=json --report-path="$tmp_report" 2>&1 | tee "$tmp_log"
      ;;
    history)
      infisical scan --source "$ROOT" --log-opts="--all" --redact --no-color --report-format=json --report-path="$tmp_report" 2>&1 | tee "$tmp_log"
      ;;
  esac
  status=${PIPESTATUS[0]}
  set -e

  if [[ "$status" -eq 0 ]]; then
    rm -f "$tmp_log" "$tmp_report"
    return 0
  fi

  if [[ "$status" -eq 1 ]]; then
    echo
    echo "${RED}[nyra-secret-scan]${NC} suspected secret material found."
    echo "Remediation:"
    echo "  1. Remove the secret from the file."
    echo "  2. Rotate the exposed credential."
    echo "  3. Store the replacement in Infisical."
    echo "  4. Re-stage and recommit the sanitized file."
    rm -f "$tmp_log" "$tmp_report"
    exit 1
  fi

  rm -f "$tmp_log" "$tmp_report"
  return 1
}

banner

if [[ "$INSTALL_HOOK" -eq 1 ]]; then
  install_hook
  exit 0
fi

infisical_status=1
if supports_infisical_scan; then
  if scan_with_infisical; then
    infisical_status=0
    echo "${BLUE}[nyra-secret-scan]${NC} Infisical scan passed; running local fallback rules."
  else
    infisical_status=$?
    echo "${YELLOW}[nyra-secret-scan]${NC} Infisical scan unavailable or failed unexpectedly; falling back to local rules."
  fi
else
  echo "${YELLOW}[nyra-secret-scan]${NC} Infisical scan unavailable; using local fallback rules."
fi

leak_count=0

case "$MODE" in
  staged) scan_staged_fallback ;;
  all) scan_worktree_fallback ;;
  history) scan_history_fallback ;;
esac

if [[ "$leak_count" -gt 0 ]]; then
  echo
  echo "${RED}[nyra-secret-scan]${NC} suspected secret material found."
  echo "Remediation:"
  echo "  1. Remove the secret from the file."
  echo "  2. Rotate the exposed credential."
  echo "  3. Store the replacement in Infisical."
  echo "  4. Re-stage and recommit the sanitized file."
  exit 1
fi

echo "${GREEN}[nyra-secret-scan]${NC} no suspected secrets detected."
