#!/usr/bin/env bash
set -euo pipefail
FLAGS=()
[[ "${CF_ENHANCED:-}" == "1" ]] && FLAGS+=("--enhanced")
[[ "${CF_ROO:-}" == "1" ]] && FLAGS+=("--roo")
[[ "${CF_SPARC:-}" == "1" ]] && FLAGS+=("--sparc")
pnpm dlx claude-flow@alpha init --force "${FLAGS[@]}"
