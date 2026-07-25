#!/usr/bin/env bash
# infra/scripts/guarded-down.sh
#
# Refuses to stop containers labelled com.projectnyra.protected=true
# unless --force flag is explicitly passed.
#
# Usage:
#   bash ../../scripts/guarded-down.sh [--force] [docker compose down args...]
#
# The guarded stop requires explicit service name targeting when any protected
# container would be affected. This prevents broad `make down` from wiping
# cloudflared, portainer, or syncthing.

set -euo pipefail

FORCE=false
ARGS=()

for arg in "$@"; do
    if [[ "$arg" == "--force" ]]; then
        FORCE=true
    else
        ARGS+=("$arg")
    fi
done

# Find protected containers in the current compose scope
PROTECTED=$(docker compose ps --format json 2>/dev/null \
    | python3 -c "
import sys, json
data = sys.stdin.read().strip()
if not data: sys.exit(0)
for line in data.splitlines():
    try:
        c = json.loads(line)
        labels = c.get('Labels', '') or ''
        if 'com.projectnyra.protected=true' in labels:
            print(c.get('Name', ''))
    except Exception:
        pass
" 2>/dev/null || true)

if [[ -n "$PROTECTED" ]] && [[ "$FORCE" != "true" ]]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║  ⚠  DO-NOT-STOP containers detected in this compose project:    ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "$PROTECTED" | while read -r name; do
        echo "  • $name"
    done
    echo ""
    echo "Run with --force to override, or stop individual services by name."
    echo "Example:  docker compose stop <service-name>"
    echo ""
    exit 1
fi

exec docker compose "${ARGS[@]}"
