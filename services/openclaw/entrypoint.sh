#!/bin/sh
set -e

mkdir -p /root/.openclaw

# Substitute env vars into the config template
envsubst < /etc/openclaw/openclaw.json.template > /root/.openclaw/openclaw.json

echo "openclaw config written to /root/.openclaw/openclaw.json"
echo "Starting openclaw gateway on port 18789..."

exec openclaw gateway --port 18789
