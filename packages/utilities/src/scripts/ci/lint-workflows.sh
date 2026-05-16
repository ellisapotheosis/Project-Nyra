#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if command -v actionlint >/dev/null 2>&1; then
  exec actionlint -color -shellcheck= -pyflakes=
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "actionlint is not installed and docker is unavailable." >&2
  exit 1
fi

docker run --rm -v "$ROOT_DIR":/repo -w /repo rhysd/actionlint:latest -color -shellcheck= -pyflakes=
