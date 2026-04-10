#!/usr/bin/env bash
set -euo pipefail
read -rp "Glob pattern (e.g., src/**/*.ts): " PATTERN
read -rp "Instructions (e.g., Add 'use client' to top of Next.js components): " EDIT
npx archon-os@alpha booster batch "$PATTERN" --instructions "$EDIT"
