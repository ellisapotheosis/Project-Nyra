#!/usr/bin/env bash
# Quick bootup script - wrapper for infra/scripts/runtime/nyra-up.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/infra/scripts/runtime/nyra-up.sh" "$@"
