#!/bin/bash
# Claude Flow Hook Runner - Bypasses npx cache issues

# Ensure NODE_PATH includes global node_modules
if command -v npm >/dev/null 2>&1; then
    export NODE_PATH="$(npm root -g):${NODE_PATH}"
fi

# Try to run claude-flow directly, fallback to npx
if command -v claude-flow >/dev/null 2>&1; then
    claude-flow "$@"
elif [ -f "node_modules/.bin/claude-flow" ]; then
    node_modules/.bin/claude-flow "$@"
elif command -v pnpm >/dev/null 2>&1; then
    pnpm exec claude-flow@alpha "$@" 2>/dev/null || true
else
    npx --yes claude-flow@alpha "$@" 2>/dev/null || true
fi
