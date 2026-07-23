#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
HOOK_DIR="${ROOT}/.git/hooks"

mkdir -p "${HOOK_DIR}"
cp "${ROOT}/infra/security/secret-scanning/pre-commit" "${HOOK_DIR}/pre-commit"
chmod +x "${HOOK_DIR}/pre-commit"

echo "✓ Installed Project Nyra pre-commit secret scan hook."
echo "  Location: ${HOOK_DIR}/pre-commit"
echo ""
echo "To test:"
echo "  bash ${HOOK_DIR}/pre-commit"
echo ""
echo "To bypass (emergency only):"
echo "  git commit --no-verify"
