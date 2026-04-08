#!/bin/bash
set -euo pipefail

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }

log "⚠️  PRODUCTION DEPLOYMENT - Requires manual confirmation"
read -p "Deploy to production? (yes/no): " confirm
[[ "$confirm" != "yes" ]] && { log "Deployment cancelled"; exit 0; }

# Backup before deployment
npm run backup || { log "Backup failed"; exit 1; }

# Run full test suite
npm run test:all || { log "Tests failed"; exit 1; }

# Build and deploy
npm run build || { log "Build failed"; exit 1; }
docker-compose -f infra/docker-compose.production.yml up -d --build

log "Production deployment complete"
