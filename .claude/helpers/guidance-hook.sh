#!/bin/bash
# Capture hook guidance for Claude visibility
GUIDANCE_FILE=".archon-os/last-guidance.txt"
mkdir -p .archon-os

case "$1" in
  "route")
    npx archon-os@alpha hooks route "$2" 2>&1 | tee "$GUIDANCE_FILE"
    ;;
  "pre-edit")
    npx archon-os@alpha hooks pre-edit "$2" 2>&1 | tee "$GUIDANCE_FILE"
    ;;
esac
