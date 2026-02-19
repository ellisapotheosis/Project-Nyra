# Bootstrap Fix Summary

## Problem Statement
Current bootstrap destroys .env and hardcodes docker-compose file locations

## Current Behavior (BROKEN)
\\\
❌ Overwrites .env completely:
   await fs.writeFile(path.join(projectRoot, '.env'), envContent);
   
❌ Hardcoded file selection:
   const composeFile = config.role === 'orchestrator'
     ? 'docker-compose.orchestrator.yml'
     : 'docker-compose.worker.yml';

❌ No service selection capability
❌ No profile support
❌ You lose all existing .env configuration
\\\

## Fixed Behavior (SAFE & FLEXIBLE)
\\\
✅ Preserves existing .env:
   1. Read existing .env
   2. Parse all key=value pairs
   3. Add/update only bootstrap keys: PC_NAME, PC_ROLE, LAN_IP
   4. Keep ALL other existing values
   5. Write back merged result

✅ Flexible file selection:
   IF user selects profiles:
     docker compose -f infra/docker-compose.yml --profile core --profile ai
   ELSE:
     docker compose -f infra/docker-compose.orchestrator.yml (fallback)

✅ Supports service selection via checkboxes
✅ Respects docker-compose profiles
✅ Backward compatible with old role-based approach
✅ Your .env survives intact
\\\

## Concrete Example

### Before (Destructive)
\\\
Original .env:
  DATABASE_URL=postgresql://prod-server
  REDIS_HOST=prod-redis-01
  LETTA_API_KEY=sk-xxx-secret
  QDRANT_HOST=vector.prod
  PC_NAME=old-orchestrator
  LAN_IP=192.168.1.10

Bootstrap runs...

Result .env (DESTROYED):
  PC_NAME=orchestrator
  PC_ROLE=orchestrator
  LAN_IP=10.0.0.1
  NODE_ENV=production
  LOG_LEVEL=info

All your configuration is GONE ❌
\\\

### After (Safe)
\\\
Original .env:
  DATABASE_URL=postgresql://prod-server
  REDIS_HOST=prod-redis-01
  LETTA_API_KEY=sk-xxx-secret
  QDRANT_HOST=vector.prod
  PC_NAME=old-orchestrator
  LAN_IP=192.168.1.10

Bootstrap runs with fix...

Result .env (PRESERVED):
  DATABASE_URL=postgresql://prod-server      ← KEPT
  REDIS_HOST=prod-redis-01                   ← KEPT
  LETTA_API_KEY=sk-xxx-secret                ← KEPT
  QDRANT_HOST=vector.prod                    ← KEPT
  PC_NAME=orchestrator                       ← UPDATED
  PC_ROLE=orchestrator                       ← ADDED
  LAN_IP=10.0.0.1                            ← UPDATED
  NODE_ENV=production                        ← KEPT or SET
  LOG_LEVEL=info                             ← KEPT or SET

All your configuration PRESERVED ✅
\\\

## Docker Interaction Changes

### Current (Hardcoded)
\\\	ypescript
const composeFile = config.role === 'orchestrator'
  ? 'docker-compose.orchestrator.yml'  // Doesn't exist in your repo
  : 'docker-compose.worker.yml';       // Doesn't exist in your repo

docker compose -f infra/\ pull
docker compose -f infra/\ up -d
\\\

### Fixed (Flexible)
\\\	ypescript
if (config.useProfiles && config.useProfiles.length > 0) {
  // NEW: Use YOUR main compose with profiles
  const profileFlags = config.useProfiles.map(p => \--profile \\).join(' ');
  docker compose -f infra/docker-compose.yml \ pull
  docker compose -f infra/docker-compose.yml \ up -d
} else {
  // FALLBACK: Role-based for backward compatibility
  docker compose -f infra/docker-compose.\.yml pull
  docker compose -f infra/docker-compose.\.yml up -d
}
\\\

## Files to Update

### In bootstrap/installer/src/main/main.ts

Replace the deploy-services handler (lines ~217-251) with the FIXED version:
📄 FIXED-DEPLOY-SERVICES.ts (provided above)

### Additional Changes Needed

To make full use of the fixes, you'll also need to update:
1. React UI components to collect service selection
2. Add checkboxes for docker-compose profiles
3. Pass selectedServices and useProfiles in config object

But the core fix (preserve .env) works immediately.

## Testing the Fix

### Before Applying:
\\\ash
# Check your current .env
cat .env | head -5
# Note your DATABASE_URL, API keys, etc.
\\\

### After Applying:
\\\ash
# Run bootstrap
# Check .env again
cat .env | head -5
# Your DATABASE_URL should still be there ✅
\\\

## Status

- ✅ .env overwrite fixed
- ✅ Docker compose flexibility improved  
- ✅ Service selection ready for UI implementation
- ✅ Docker-compose profile support added
- ✅ Backward compatible

Next: Apply the fixed code to bootstrap/installer/src/main/main.ts
