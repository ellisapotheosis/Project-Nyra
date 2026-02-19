#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-.}"
OUT_DIR="${2:-./_audit}"
SCAN_DIRS=("infra" "apps" "services" "systems" "bootstrap" "scripts")
INCLUDE_EXT_REGEX='(\.ya?ml|\.json|\.md|\.tsx?|\.jsx?|\.mjs|\.cjs|\.env(\..*)?$|Dockerfile(\..*)?$|\.conf|\.ini|\.txt)$'

repo="$(cd "$REPO_ROOT" && pwd)"
out="$repo/$OUT_DIR"
mkdir -p "$out/docker_logs"

now="$(date +%F_%H-%M-%S)"
inv_csv="$out/env_inventory.csv"
missing_md="$out/missing_env_report.md"
docker_md="$out/docker_status.md"
inf_json="$out/infisical_missing_secrets.json"

# collect env files
declare -A envset
while IFS= read -r -d '' f; do
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=(.*)$ ]]; then
      k="${BASH_REMATCH[1]}"
      envset["$k"]=1
    fi
  done < "$f"
done < <(find "$repo" -type f \( -name ".env" -o -name ".env.*" -o -name "env" -o -name "env.*" -o -name "*.env" -o -name "*.env.*" \) -print0 2>/dev/null || true)

# scan files
declare -A refs
add_ref() {
  local var="$1"; local file="$2"
  [[ -z "$var" ]] && return
  refs["$var"]+="$file | "
}

# regex patterns
rx_compose='\$\{([A-Za-z_][A-Za-z0-9_]*)(:[^}]*)?\}'
rx_node='process\.env\.([A-Za-z_][A-Za-z0-9_]*)'
rx_dockerenv='^[[:space:]]*ENV[[:space:]]+([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*='

files=()
for d in "${SCAN_DIRS[@]}"; do
  [[ -d "$repo/$d" ]] && files+=( "$repo/$d" )
done
[[ ${#files[@]} -eq 0 ]] && files=( "$repo" )

while IFS= read -r -d '' f; do
  content="$(cat "$f" 2>/dev/null || true)"
  [[ -z "$content" ]] && continue

  while [[ "$content" =~ $rx_compose ]]; do
    add_ref "${BASH_REMATCH[1]}" "$f"
    content="${content#*"${BASH_REMATCH[0]}"}"
  done

  content2="$(cat "$f" 2>/dev/null || true)"
  while [[ "$content2" =~ $rx_node ]]; do
    add_ref "${BASH_REMATCH[1]}" "$f"
    content2="${content2#*"${BASH_REMATCH[0]}"}"
  done

  # docker ENV lines
  while IFS= read -r line; do
    if [[ "$line" =~ $rx_dockerenv ]]; then
      add_ref "${BASH_REMATCH[1]}" "$f"
    fi
  done < "$f"

done < <(find "${files[@]}" -type f -regextype posix-extended -regex ".*$INCLUDE_EXT_REGEX" -print0 2>/dev/null || true)

# write CSV
{
  echo "var,is_secret_guess,is_set_in_env_files,references"
  for k in "${!refs[@]}"; do
    secret_guess="false"
    [[ "$k" =~ (KEY|TOKEN|SECRET|PASS|PWD|PRIVATE|CERT|SIGNING|JWT|OAUTH|CLIENT_SECRET|API_KEY) ]] && secret_guess="true"
    is_set="false"
    [[ -n "${envset[$k]+x}" ]] && is_set="true"
    echo "\"$k\",$secret_guess,$is_set,\"${refs[$k]}\""
  done | sort
} > "$inv_csv"

# missing report
{
  echo "# Missing Env Vars Report ($now)"
  echo
  echo "RepoRoot: $repo"
  echo "OutDir: $out"
  echo
  echo "## Missing variables (referenced but not found in any .env files)"
  echo
  while IFS= read -r line; do
    var="$(echo "$line" | cut -d',' -f1 | tr -d '"')"
    is_secret="$(echo "$line" | cut -d',' -f2)"
    is_set="$(echo "$line" | cut -d',' -f3)"
    refs_line="$(echo "$line" | cut -d',' -f4-)"
    if [[ "$var" != "var" && "$is_set" == "false" ]]; then
      echo "- **$var** (secret_guess=$is_secret)"
      echo "  - refs: $refs_line"
    fi
  done < "$inv_csv"
} > "$missing_md"

# infisical template
{
  echo "{"
  echo "  \"generated_at\": \"${now}\","
  echo "  \"repo_root\": \"${repo}\","
  echo "  \"missing_secrets\": ["
  first=1
  while IFS= read -r line; do
    var="$(echo "$line" | cut -d',' -f1 | tr -d '"')"
    is_secret="$(echo "$line" | cut -d',' -f2)"
    is_set="$(echo "$line" | cut -d',' -f3)"
    if [[ "$var" != "var" && "$is_set" == "false" && "$is_secret" == "true" ]]; then
      [[ $first -eq 0 ]] && echo "    ,"
      first=0
      echo "    {\"key\":\"$var\",\"value\":\"\",\"note\":\"missing (fill & import into Infisical)\"}"
    fi
  done < "$inv_csv"
  echo
  echo "  ]"
  echo "}"
} > "$inf_json"

# docker status
{
  echo "# Docker Status ($now)"
  echo
  echo "## docker ps -a"
  echo '```'
  docker ps -a 2>&1 || true
  echo '```'
  echo
  echo "## docker compose ls"
  echo '```'
  docker compose ls 2>&1 || true
  echo '```'
} > "$docker_md"

echo "Wrote:"
echo " - $inv_csv"
echo " - $missing_md"
echo " - $inf_json"
echo " - $docker_md"
