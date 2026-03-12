#!/usr/bin/env bash
set -euo pipefail

# Fetch REAL top-20 from ClawHub on your machine via CLI.
OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/openclaw"
mkdir -p "${OUT_DIR}"

command -v node >/dev/null 2>&1 || { echo "❌ node not found"; exit 1; }

echo "→ Fetching top 20 skills by downloads (CLI)"
npx -y clawhub@latest explore --sort downloads --limit 20 --json > "${OUT_DIR}/top20_downloads.json" || {
  echo "❌ CLI fetch failed. Open https://clawhub.ai/skills?sort=downloads in a browser."
  exit 1
}

echo "✅ Wrote ${OUT_DIR}/top20_downloads.json"
