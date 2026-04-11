#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "== Infra Consolidation Audit =="

printf '\n[1/5] Copy-suffix duplicates ( (2), (3), ...)\n'
copy_dupes=$(find infra scripts config environments -type f | rg ' \([0-9]+\)\.' || true)
if [[ -n "$copy_dupes" ]]; then
  echo "$copy_dupes"
else
  echo "OK: no copy-suffix duplicate files found"
fi

printf '\n[2/5] Empty automation scripts\n'
empty_scripts=$(find scripts infra/scripts -type f \( -name '*.sh' -o -name '*.ps1' -o -name '*.py' \) -size 0 || true)
if [[ -n "$empty_scripts" ]]; then
  echo "$empty_scripts"
else
  echo "OK: no empty script files found"
fi

printf '\n[3/5] Host compose entrypoints\n'
find infra/hosts -maxdepth 2 -type f -name 'docker-compose*.yml' | sort

printf '\n[4/5] Canonical vs compatibility config roots\n'
printf 'infra/configs files: '
find infra/configs -type f | wc -l
printf 'config files: '
find config -type f | wc -l

printf '\n[5/5] Canonical vs compatibility env roots\n'
printf 'infra/env files: '
find infra/env -type f | wc -l
printf 'environments files: '
find environments -type f | wc -l

printf '\nAudit complete.\n'
