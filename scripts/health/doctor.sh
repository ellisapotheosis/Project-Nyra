#!/usr/bin/env bash
# Quick doctor script - wrapper for infra/scripts/runtime/nyra-doctor.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/infra/scripts/runtime/nyra-doctor.sh" "$@"
