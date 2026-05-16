#!/usr/bin/env bash
# Quick shutdown script - wrapper for infra/scripts/runtime/nyra-down.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/infra/scripts/runtime/nyra-down.sh" "$@"
