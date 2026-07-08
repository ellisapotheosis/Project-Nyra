#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
HOOK_PATH="$ROOT/scripts/security/hooks"

mkdir -p "$HOOK_PATH"
chmod 755 "$ROOT/scripts/security/nyra-secret-scan.sh" "$ROOT/scripts/security/install-hooks.sh" "$HOOK_PATH/pre-commit"
chmod 755 "$ROOT/scripts/security/tests/secret-scan-smoke.sh"

git config core.hooksPath scripts/security/hooks
echo "Installed Git hooks path: scripts/security/hooks"
echo "Pre-commit hook: $HOOK_PATH/pre-commit"
