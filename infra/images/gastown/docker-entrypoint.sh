#!/bin/sh
set -e

if [ -n "${GIT_USER:-}" ] && [ -n "${GIT_EMAIL:-}" ]; then
  git config --global user.name "$GIT_USER"
  git config --global user.email "$GIT_EMAIL"
  git config --global credential.helper store
  dolt config --global --add user.name "$GIT_USER" >/dev/null 2>&1 || true
  dolt config --global --add user.email "$GIT_EMAIL" >/dev/null 2>&1 || true
fi

if [ ! -f /gt/mayor/town.json ]; then
  echo "Initializing Gas Town workspace at /gt..."
  /app/gastown/gt install /gt --git
else
  echo "Refreshing Gas Town workspace at /gt..."
  /app/gastown/gt install /gt --git --force
fi

exec "$@"
