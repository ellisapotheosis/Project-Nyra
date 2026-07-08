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
  --history       Scan git history via patch text
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

if command -v infisical >/dev/null 2>&1; then
  if infisical --help >/dev/null 2>&1; then
    echo "${BLUE}[nyra-secret-scan]${NC} Infisical CLI detected; local fallback scanner remains the enforced path." >&2
  fi
fi

if [[ "$INSTALL_HOOK" -eq 1 ]]; then
  hook_dir="$ROOT/scripts/security/hooks"
  mkdir -p "$hook_dir"
  cat > "$hook_dir/pre-commit" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
exec "$ROOT/scripts/security/nyra-secret-scan.sh" --staged
EOF
  chmod 755 "$hook_dir/pre-commit"
  git config core.hooksPath scripts/security/hooks
  echo "${GREEN}[nyra-secret-scan]${NC} installed hook at scripts/security/hooks/pre-commit"
  exit 0
fi

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

leak_count=0

banner() {
  echo "${BLUE}=================================================================${NC}"
  echo "${BLUE}Project Nyra Secret Scan${NC}"
  echo "${BLUE}Mode: ${MODE}${NC}"
  echo "${BLUE}Root: ${ROOT}${NC}"
  echo "${BLUE}=================================================================${NC}"
}

scan_file() {
  local source="$1"
  local display_path="$2"
  local temp_file="$3"

  if [[ ! -s "$temp_file" ]]; then
    return 0
  fi

  local hit=0
  local idx
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

should_skip_audit_path() {
  case "$1" in
    docs/*|apps/guidance/*|.agents/skills/*|**/.open-next/*|**/.next/*|**/node_modules/*|**/.turbo/*|**/dist/*|**/coverage/*|**/*.backup*|**/*.bak)
      return 0
      ;;
  esac
  return 1
}

scan_path_list() {
  local source="$1"
  local list_mode="$2"
  local path
  local tmp

  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' RETURN

  case "$list_mode" in
    staged)
      while IFS= read -r -d '' path; do
        [[ -n "$path" ]] || continue
        case "$path" in
          *example*|*template*|*sample*)
            ;;
          *.env|*.env.*|*.env.local|*.env.*.local|*.pem|*.key|*.token|*.secret|*.secrets)
            echo "${YELLOW}[LEAK-DETECTED]${NC} ${source}: ${path}"
            echo "  - SECRET_PATH"
            leak_count=$((leak_count + 1))
            continue
            ;;
        esac
        if git diff --cached --numstat -- "$path" | awk '{ if ($1 == "-" && $2 == "-") exit 0; exit 1 }'; then
          continue
        fi
        if ! git show ":$path" >"$tmp" 2>/dev/null; then
          continue
        fi
        scan_file "$source" "$path" "$tmp"
      done < <(git diff --cached --name-only -z --diff-filter=ACMR)
      ;;
    all)
      while IFS= read -r -d '' path; do
        [[ -n "$path" ]] || continue
        if should_skip_audit_path "$path"; then
          continue
        fi
        [[ -f "$path" ]] || continue
        case "$path" in
          *example*|*template*|*sample*)
            ;;
          *.env|*.env.*|*.env.local|*.env.*.local|*.pem|*.key|*.token|*.secret|*.secrets)
            echo "${YELLOW}[LEAK-DETECTED]${NC} ${source}: ${path}"
            echo "  - SECRET_PATH"
            leak_count=$((leak_count + 1))
            continue
            ;;
        esac
        if ! grep -Iq . "$path"; then
          continue
        fi
        cp "$path" "$tmp"
        scan_file "$source" "$path" "$tmp"
      done < <(git ls-files -co --exclude-standard -z)
      ;;
    history)
      while IFS= read -r path; do
        [[ -n "$path" ]] || continue
        if should_skip_audit_path "$path"; then
          continue
        fi
        if git log --all --follow --pretty=format: -- "$path" | head -n 1 >/dev/null 2>&1; then
          if git log -p --all --no-color -- "$path" >"$tmp" 2>/dev/null; then
            scan_file "$source" "$path (history)" "$tmp"
          fi
        fi
      done < <(git ls-files)
      ;;
  esac

  rm -f "$tmp"
  trap - RETURN
}

banner

if [[ "$MODE" == "history" ]]; then
  echo "${YELLOW}[nyra-secret-scan]${NC} history scan is expensive; continuing because it was explicitly requested."
fi

case "$MODE" in
  staged)
    scan_path_list "staged" "staged"
    ;;
  all)
    scan_path_list "working-tree" "all"
    ;;
  history)
    scan_path_list "history" "history"
    ;;
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
