#!/bin/bash
set -euo pipefail

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }

log "Deploying to staging environment..."

# Run tests first
npm run test:all || { log "Tests failed, aborting deployment"; exit 1; }

# Build production bundles
npm run build || { log "Build failed"; exit 1; }

# Deploy to staging
docker-compose -f infra/docker-compose.staging.yml down
docker-compose -f infra/docker-compose.staging.yml up -d --build

log "Staging deployment complete"
