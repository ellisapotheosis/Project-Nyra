#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "[Nyra] Applying bootstrap payload to repo root: $ROOT_DIR"
python3 "$(dirname "${BASH_SOURCE[0]}")/nyra_apply.py"
echo "[Nyra] Apply complete. Run ./bootstrap/verify_kit.sh next."
