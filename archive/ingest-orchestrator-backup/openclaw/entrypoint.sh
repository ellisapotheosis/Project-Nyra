#!/usr/bin/env bash
set -euo pipefail
cd /srv/openclaw/src
MODE="${OPENCLAW_MODE:-web}"
case "$MODE" in
  web)
    exec bash -lc 'pnpm dev --host 0.0.0.0 --port ${PORT:-3010} || npm run dev -- --host 0.0.0.0 --port ${PORT:-3010} || python3 -m http.server ${PORT:-3010}'
    ;;
  api)
    exec bash -lc 'pnpm start:api || npm run start:api || python3 -m http.server ${PORT:-3011}'
    ;;
  worker)
    exec bash -lc 'pnpm worker || npm run worker || sleep infinity'
    ;;
  *)
    exec "$@"
    ;;
esac
