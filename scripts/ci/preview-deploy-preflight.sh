#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "preview deployment preflight"
echo "node=$(node --version)"
echo "pnpm=$(pnpm --version)"
echo "commit=$(git rev-parse --short HEAD)"

for required_file in package.json pnpm-lock.yaml pnpm-workspace.yaml; do
  if [[ ! -f "$required_file" ]]; then
    echo "preview deployment preflight failed: missing $required_file" >&2
    exit 1
  fi
done

declare -A preview_apps=(
  [apps/projectnyra]=projectnyra
  [apps/ratehunter]=ratehunter-landing
)
declare -A preview_build_scripts=(
  [apps/projectnyra]=build
  [apps/ratehunter]=build:cf
)

for app_dir in "${!preview_apps[@]}"; do
  workspace="${preview_apps[$app_dir]}"
  build_script="${preview_build_scripts[$app_dir]}"
  echo "app=$app_dir workspace=$workspace build_script=$build_script"

  for required_file in "$app_dir/package.json" "$app_dir/next.config.js"; do
    if [[ ! -f "$required_file" ]]; then
      echo "preview deployment preflight failed: missing $required_file" >&2
      exit 1
    fi
  done

  if [[ "$(node -p "require('./$app_dir/package.json').name")" != "$workspace" ]]; then
    echo "preview deployment preflight failed: $app_dir is not the $workspace workspace" >&2
    exit 1
  fi

  if [[ "$(node -p "Boolean(require('./$app_dir/package.json').scripts?.['$build_script'])")" != "true" ]]; then
    echo "preview deployment preflight failed: $app_dir has no $build_script script" >&2
    exit 1
  fi

  pnpm --filter "$workspace" "$build_script"
done
