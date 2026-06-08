#!/usr/bin/env bash
set -euo pipefail
"$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/infra/scripts/openclaw/channels.sh" "$@"
