# Security API Integration Checklist

## Quick Integration Guide

This guide provides step-by-step instructions to integrate the OAuth2 & Security Configuration API into the Nexus Router.

## Prerequisites

✅ Node.js 18+ installed
✅ Redis running (optional but recommended)
✅ TypeScript configured
✅ Express server running

## Step 1: Verify Dependencies

Check that these packages are in `package.json`:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "jwks-rsa": "^3.1.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

Install if missing:

```bash
cd services/nexus-router
npm install jsonwebtoken jwks-rsa
npm install --save-dev @types/jsonwebtoken
```

## Step 2: Verify Files Created

Ensure these files exist:

```
services/nexus-router/
├── src/
│   ├── types/
│   │   └── security.ts ✅ (Created)
│   ├── services/
│   │   └── security-config.ts ✅ (Created)
│   ├── middleware/
│   │   └── oauth2.ts ✅ (Created)
│   └── routes/
│       └── security.ts ✅ (Created)
└── docs/
    ├── SECURITY-API.md ✅ (Created)
    └── SECURITY-INTEGRATION.md ✅ (This file)
```

## Step 3: Update Type Exports

**File:** `src/types/index.ts`

Add this line at the end:

```typescript
// Export security types
export * from './security';
```

## Step 4: Register Security Router

**File:** `src/index.ts`

### 4a. Add Import (around line 27)

```typescript
import { securityRouter } from './routes/security';
```

### 4b. Register Route (around line 106)

```typescript
// Add after existing app.use() calls
app.use('/api/security', securityRouter);
```

### 4c. Update Root Endpoint Documentation (around line 130)

```typescript
endpoints: {
  // ... existing endpoints ...
  security: {
    oauth2: '/api/security/oauth2',
    oauth2Test: '/api/security/oauth2/test',
    permissions: '/api/security/permissions',
    groups: '/api/security/groups',
    health: '/api/security/health'
  }
}
```

## Step 5: Compile TypeScript

```bash
npm run build
```

Expected output:
```
✓ Type checking passed
✓ Compilation successful
```

## Step 6: Start Development Server

```bash
npm run dev
```

Expected output:
```
🚀 Nexus Router running on port 8000
📊 Strategy: cost-optimized
💻 Local workers: X
☁️  Cloud fallback: enabled
```

## Step 7: Verify API Endpoints

Test that security endpoints are accessible:

```bash
# Test 1: Get OAuth2 config
curl http://localhost:8000/api/security/oauth2

# Expected: {"success":true,"data":{"enabled":false,...}}

# Test 2: List groups
curl http://localhost:8000/api/security/groups

# Expected: {"success":true,"data":[],...}

# Test 3: Get permissions
curl http://localhost:8000/api/security/permissions

# Expected: {"success":true,"data":{},...}

# Test 4: Security health
curl http://localhost:8000/api/security/health

# Expected: {"success":true,"status":"healthy",...}

# Test 5: Root endpoint shows security docs
curl http://localhost:8000/ | jq .endpoints.security

# Expected: {"oauth2":"/api/security/oauth2",...}
```

## Step 8: Configure OAuth2 (Optional)

If you have an OAuth2 provider:

```bash
curl -X PATCH http://localhost:8000/api/security/oauth2 \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "jwksEndpoint": "https://your-auth.com/.well-known/jwks.json",
    "expectedIssuer": "https://your-auth.com/",
    "expectedAudience": "nexus-api"
  }'
```

## Step 9: Create Initial Groups

```bash
# Create admin group
curl -X POST http://localhost:8000/api/security/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "System administrators",
    "permissions": ["read", "write", "admin", "configure"]
  }'

# Create developers group
curl -X POST http://localhost:8000/api/security/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "developers",
    "description": "Development team",
    "permissions": ["read", "write"]
  }'

# Create readonly group
curl -X POST http://localhost:8000/api/security/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "readonly",
    "description": "Read-only access",
    "permissions": ["read"]
  }'
```

## Step 10: Configure Permissions (Optional)

Set up permissions for MCP servers:

```bash
curl -X PATCH http://localhost:8000/api/security/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "mcp-server-1",
    "allowGroups": ["admin", "developers"],
    "denyGroups": ["readonly"],
    "toolOverrides": {
      "sensitive-operation": {
        "allowGroups": ["admin"],
        "denyGroups": ["developers"]
      }
    }
  }'
```

## Step 11: Apply Authentication Middleware (Optional)

To protect routes with OAuth2 authentication:

**Example:** Protect MCP routes

```typescript
import { authenticate, requireGroups } from './middleware/oauth2';

// Protect all MCP routes
app.use('/mcp', authenticate, mcpRouter);

// Or protect specific endpoints
app.post('/mcp/tools/call',
  authenticate,
  requireGroups(['admin', 'developers']),
  toolCallHandler
);
```

## Step 12: Test Token Validation (If OAuth2 Enabled)

```bash
# Get a JWT token from your OAuth2 provider first
TOKEN="eyJhbGciOiJSUzI1NiIs..."

# Test token validation
curl -X POST http://localhost:8000/api/security/oauth2/test \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# Make authenticated request
curl http://localhost:8000/v1/models \
  -H "Authorization: Bearer $TOKEN"
```

## Environment Variables Reference

Add to `.env` file:

```bash
# Security Configuration
OAUTH2_ENABLED=false
OAUTH2_JWKS_ENDPOINT=https://auth.example.com/.well-known/jwks.json
OAUTH2_EXPECTED_ISSUER=https://auth.example.com/
OAUTH2_EXPECTED_AUDIENCE=nexus-api
OAUTH2_TOKEN_VALIDATION=true
OAUTH2_CACHE_JWKS=true
OAUTH2_JWKS_CACHE_TTL=3600000
OAUTH2_CLOCK_TOLERANCE=60

# Redis (for distributed deployments)
REDIS_URL=redis://localhost:6379
```

## Common Integration Patterns

### Pattern 1: Optional Authentication

Allow both authenticated and unauthenticated requests:

```typescript
import { optionalAuthenticate } from './middleware/oauth2';

app.use('/api/public', optionalAuthenticate, publicRouter);
```

### Pattern 2: Group-Based Access

Require specific groups:

```typescript
import { authenticate, requireGroups } from './middleware/oauth2';

app.use('/api/admin',
  authenticate,
  requireGroups(['admin']),
  adminRouter
);
```

### Pattern 3: Permission-Based Access

Require specific permissions:

```typescript
import { authenticate, requirePermissions } from './middleware/oauth2';

app.delete('/api/data/:id',
  authenticate,
  requirePermissions(['delete']),
  deleteHandler
);
```

### Pattern 4: Dynamic Authorization

Check permissions dynamically based on request context:

```typescript
import { authenticate } from './middleware/oauth2';
import { SecurityConfigService } from './services/security-config';

app.post('/mcp/tools/call',
  authenticate,
  async (req, res, next) => {
    const securityConfig = SecurityConfigService.getInstance();
    const decision = await securityConfig.authorize({
      userId: req.userId!,
      groups: req.userGroups!,
      permissions: req.userPermissions!,
      serverId: req.body.serverId,
      toolId: req.body.toolName,
      action: 'execute'
    });

    if (!decision.allowed) {
      return res.status(403).json({
        error: {
          message: decision.reason || 'Access denied',
          type: 'permission_error',
          code: 403
        }
      });
    }

    next();
  },
  toolCallHandler
);
```

## Troubleshooting

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Clear build cache
rm -rf dist/
npm run build
```

### Issue: "Cannot find module './routes/security'"

**Solution:**
Verify file exists: `services/nexus-router/src/routes/security.ts`

### Issue: Security routes return 404

**Solution:**
1. Check route registration in `src/index.ts`
2. Verify server restarted after changes
3. Check logs for startup errors

### Issue: Redis connection errors

**Solution:**
Service works without Redis (uses in-memory cache). To fix Redis:
```bash
# Start Redis
docker run -d -p 6379:6379 redis

# Or install locally
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt-get install redis-server
# Mac: brew install redis
```

## Verification Checklist

After integration, verify:

- [ ] All files created successfully
- [ ] Type exports added to `src/types/index.ts`
- [ ] Security router imported in `src/index.ts`
- [ ] Security router registered with Express app
- [ ] Root endpoint documentation updated
- [ ] TypeScript compiles without errors
- [ ] Server starts without errors
- [ ] All 5 API endpoints respond correctly
- [ ] Security health endpoint returns healthy status
- [ ] Can create/list/update/delete user groups
- [ ] Can configure OAuth2 settings
- [ ] Can update permission matrix
- [ ] Token validation works (if OAuth2 enabled)

## Next Steps

1. **Configure OAuth2 Provider** - Set up JWKS endpoint
2. **Create User Groups** - Define roles for your organization
3. **Set Permissions** - Configure access control for MCP servers
4. **Apply Middleware** - Protect routes with authentication
5. **Test Thoroughly** - Verify authentication and authorization
6. **Monitor** - Check `/api/security/health` regularly
7. **Audit** - Review permissions and groups periodically

## Support

For detailed API documentation, see:
- [SECURITY-API.md](./SECURITY-API.md) - Complete API reference
- [SECURITY-ARCHITECTURE.md](./SECURITY-ARCHITECTURE.md) - Security architecture (if created)

For issues:
- Check server logs: `npm run dev` output
- Review TypeScript errors: `npm run type-check`
- Test endpoints manually: Use curl or Postman
- Clear caches: `POST /api/security/cache/clear`

## Success!

If all verification steps pass, the Security API is successfully integrated! 🎉

You can now:
- ✅ Configure OAuth2 authentication
- ✅ Manage user groups and permissions
- ✅ Protect routes with authentication
- ✅ Implement fine-grained access control
- ✅ Monitor security health
