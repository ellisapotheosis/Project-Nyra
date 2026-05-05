#!/usr/bin/env bash
set -euo pipefail

component="${1:-}"

if [[ -z "$component" ]]; then
  echo "usage: $0 <component-or-registry-item>" >&2
  exit 64
fi

docker exec nyra-ui-engine npx shadxn add "$component"
