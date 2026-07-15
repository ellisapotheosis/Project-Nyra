#!/usr/bin/env bash
set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

declare -a PATTERNS=(
  'sk-[A-Za-z0-9_-]{20,}'
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}'
  'AIza[0-9A-Za-z_-]{35}'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  'postgres(ql)?://[^[:space:]]+:[^[:space:]@]+@'
  '(^|[^A-Z0-9_])(JWT_SECRET|SESSION_SECRET|AUTH_SECRET|NEXUS_JWT_SECRET|SUPABASE_JWT_SECRET)[A-Za-z0-9_]*[[:space:]]*=[[:space:]]*["'"'"']?[A-Za-z0-9+/=_-]{16,}'
  '(^|[^A-Z0-9_])(SECRET|TOKEN|KEY|PASSWORD|CLIENT_SECRET|SERVICE_ROLE_KEY)[A-Za-z0-9_]*[[:space:]]*=[[:space:]]*["'"'"']?[A-Za-z0-9+/=_-]{32,}'
)

is_tracked() {
  git ls-files --error-unmatch -- "$1" >/dev/null 2>&1
}

file_status() {
  local path="$1"
  if is_tracked "$path"; then
    echo "tracked"
  else
    echo "untracked"
  fi
}

is_suspicious() {
  local tmp="$1"
  local idx
  for idx in "${!PATTERNS[@]}"; do
    if grep -nE -I -m 1 -- "${PATTERNS[$idx]}" "$tmp" >/dev/null 2>&1; then
      return 0
    fi
  done
  return 1
}

status_for_path() {
  local path="$1"
  case "$path" in
    *.example.env|*.template.env|*.sample.env|*.env.example|*.env.template|*.env.sample|*.md|*.txt)
      echo "low"
      ;;
    *.env|*.env.*|*.pem|*.key|*.token|*.secret|*.secrets)
      echo "high"
      ;;
    *)
      echo "medium"
      ;;
  esac
}

echo "${BLUE}=================================================================${NC}"
echo "${BLUE}Project Nyra Env File Audit${NC}"
echo "${BLUE}Root: ${ROOT}${NC}"
echo "${BLUE}=================================================================${NC}"
echo

printf '%-72s %-10s %-8s %s\n' "file" "tracked" "risk" "recommended action"
printf '%-72s %-10s %-8s %s\n' "----" "-------" "----" "------------------"

found=0
tmp="$(mktemp)"
while IFS= read -r -d '' path; do
  [[ -n "$path" ]] || continue
  base="$(basename "$path")"
  case "$base" in
    *.env|*.env.*|*.pem|*.key|*.token|*.secret|*.secrets|*.secret.json|*.secrets.json|*.example.env|*.template.env|*.sample.env|*.env.example|*.env.template|*.env.sample)
      ;;
    *)
      continue
      ;;
  esac
  [[ -f "$path" ]] || continue
  if ! grep -Iq . "$path"; then
    continue
  fi

  tracked="$(file_status "$path")"
  risk="$(status_for_path "$base")"
  action="keep local only or move to Infisical"
  if [[ "$tracked" == "tracked" && "$risk" == "high" ]]; then
    action="remove from git history, rotate if real, replace with .env.example"
  elif [[ "$tracked" == "tracked" ]]; then
    action="verify whether this file should be example/template only"
  fi

  cp "$path" "$tmp"
  if is_suspicious "$tmp"; then
    risk="high"
    action="treat as potential secret file and inspect manually"
  fi

  printf '%-72s %-10s %-8s %s\n' "$path" "$tracked" "$risk" "$action"
  found=1
done < <(git ls-files -co --exclude-standard -z)
rm -f "$tmp"

if [[ "$found" -eq 0 ]]; then
  echo "${GREEN}No env-like files found.${NC}"
fi
