#!/usr/bin/env bash
# Bring up a Nyra node using the master runner
set -euo pipefail

NODE="${1:-}"
PROFILES="${2:-}"

if [[ -z "$NODE" ]]; then
  echo "Usage: $0 <node> [profiles]"
  exit 1
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/nyra" up "$NODE" "$PROFILES"