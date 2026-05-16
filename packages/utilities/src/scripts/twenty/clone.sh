#!/usr/bin/env bash
set -euo pipefail
TARGET_DIR=${1:-../twentycrm}
if [ -d "$TARGET_DIR/.git" ]; then
  echo "TwentyCRM already cloned at $TARGET_DIR"
  exit 0
fi
git clone https://github.com/twentyhq/twenty "$TARGET_DIR"
