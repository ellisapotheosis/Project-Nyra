#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

app_dir="apps/projectnyra"

echo "preview deployment preflight"
echo "node=$(node --version)"
echo "pnpm=$(pnpm --version)"
echo "app=$app_dir"
echo "commit=$(git rev-parse --short HEAD)"

for required_file in package.json pnpm-lock.yaml pnpm-workspace.yaml "$app_dir/package.json" "$app_dir/next.config.js"; do
  if [[ ! -f "$required_file" ]]; then
    echo "preview deployment preflight failed: missing $required_file" >&2
    exit 1
  fi
done

if [[ "$(node -p "require('./$app_dir/package.json').name")" != "projectnyra" ]]; then
  echo "preview deployment preflight failed: $app_dir is not the projectnyra workspace" >&2
  exit 1
fi

if [[ "$(node -p "Boolean(require('./$app_dir/package.json').scripts?.build)")" != "true" ]]; then
  echo "preview deployment preflight failed: $app_dir has no build script" >&2
  exit 1
fi

echo "building the same workspace used by Vercel and Cloudflare previews"
pnpm --filter projectnyra build
