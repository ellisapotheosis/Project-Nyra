#!/usr/bin/env bash
set -euo pipefail
CFG="${1:-/etc/cloudflared/config.yml}"
cloudflared tunnel ingress validate --config "$CFG"
