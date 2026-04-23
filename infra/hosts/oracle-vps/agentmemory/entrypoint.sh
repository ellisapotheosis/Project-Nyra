#!/bin/sh
set -eu

cd /opt/agentmemory-src

mkdir -p data/stream_store

iii --config iii-config.docker.yaml &
III_PID=$!

socat TCP-LISTEN:3113,fork,bind=0.0.0.0 TCP:127.0.0.1:3113 &
SOCAT_PID=$!

cleanup() {
  if kill -0 "$III_PID" 2>/dev/null; then
    kill "$III_PID" 2>/dev/null || true
    wait "$III_PID" 2>/dev/null || true
  fi
  if kill -0 "$SOCAT_PID" 2>/dev/null; then
    kill "$SOCAT_PID" 2>/dev/null || true
    wait "$SOCAT_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

node dist/cli.mjs --no-engine --port "${III_REST_PORT:-3111}" &
NODE_PID=$!
wait "$NODE_PID"
