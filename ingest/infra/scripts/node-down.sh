#!/usr/bin/env bash
# Bring down a Nyra node using the master runner
set -euo pipefail

NODE="${1:-}"

if [[ -z "$NODE" ]]; then
  echo "Usage: $0 <node>"
  exit 1
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/nyra" down "$NODE"