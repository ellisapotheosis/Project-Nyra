#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv
source .venv/bin/activate
pip install -r python/requirements.txt
python a2a/nyra_a2a_server.py &
python orchestrators/ag2/host.py
