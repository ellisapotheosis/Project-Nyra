#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

list_files_if_dir() {
  local dir="$1"
  shift
  if [[ -d "$dir" ]]; then
    find "$dir" "$@"
  fi
}

count_files_if_dir() {
  local dir="$1"
  if [[ -d "$dir" ]]; then
    find "$dir" -type f | wc -l
  else
    echo 0
  fi
}

require_cmd find
require_cmd rg

echo "== Infra Consolidation Audit =="

printf '\n[1/5] Copy-suffix duplicates ( (2), (3), ...)\n'
copy_dupes=$(
  {
    list_files_if_dir infra -type f
    list_files_if_dir scripts -type f
    list_files_if_dir config -type f
    list_files_if_dir environments -type f
  } | rg ' \([0-9]+\)\.' || true
)
if [[ -n "$copy_dupes" ]]; then
  echo "$copy_dupes"
else
  echo "OK: no copy-suffix duplicate files found"
fi

printf '\n[2/5] Empty automation scripts\n'
empty_scripts=$(
  {
    list_files_if_dir scripts -type f \( -name '*.sh' -o -name '*.ps1' -o -name '*.py' \) -size 0
    list_files_if_dir infra/scripts -type f \( -name '*.sh' -o -name '*.ps1' -o -name '*.py' \) -size 0
  } || true
)
if [[ -n "$empty_scripts" ]]; then
  echo "$empty_scripts"
else
  echo "OK: no empty script files found"
fi

printf '\n[3/5] Host compose entrypoints\n'
if [[ -d infra/hosts ]]; then
  find infra/hosts -maxdepth 2 -type f -name 'docker-compose*.yml' | sort
else
  echo "INFO: infra/hosts is missing"
fi

printf '\n[4/5] Canonical vs compatibility config roots\n'
printf 'infra/configs files: '
count_files_if_dir infra/configs
printf 'config files: '
count_files_if_dir config

printf '\n[5/5] Canonical vs compatibility env roots\n'
printf 'infra/env files: '
count_files_if_dir infra/env
printf 'environments files: '
count_files_if_dir environments

printf '\nAudit complete.\n'
