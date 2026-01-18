# OAuth2 & Security Configuration API

## Overview

The Nexus Router Security API provides comprehensive OAuth2 authentication, claims-based authorization, and permission management capabilities. This API follows zero-trust security principles and implements fine-grained access control.

## Features

- **OAuth2 JWT Authentication** - JWKS-based token validation
- **Claims-Based Authorization** - Group and permission-based access control
- **Permission Matrix** - Server and tool-level access policies
- **User Group Management** - Role-based access control (RBAC)
- **Security Health Monitoring** - Real-time security status
- **Cache Management** - Configurable caching for performance

## Installation

### 1. Install Dependencies

```bash
cd services/nexus-router
npm install
```

Required packages (already added to package.json):
- `jsonwebtoken` (^9.0.2) - JWT token handling
- `jwks-rsa` (^3.1.0) - JWKS endpoint integration
- `@types/jsonwebtoken` (^9.0.5) - TypeScript definitions

### 2. Integrate Security Router

Add to `src/index.ts`:

```typescript
import { securityRouter } from './routes/security';

// Add route registration (around line 114)
app.use('/api/security', securityRouter);

// Update root endpoint to include security endpoints
endpoints: {
  // ... existing endpoints
  security: {
    oauth2: '/api/security/oauth2',
    oauth2Test: '/api/security/oauth2/test',
    permissions: '/api/security/permissions',
    groups: '/api/security/groups',
    health: '/api/security/health'
  }
}
```

### 3. Environment Variables

Add to `.env`:

```bash
# OAuth2 Configuration (optional - can configure via API)
OAUTH2_ENABLED=false
OAUTH2_JWKS_ENDPOINT=https://your-auth-provider.com/.well-known/jwks.json
OAUTH2_EXPECTED_ISSUER=https://your-auth-provider.com/
OAUTH2_EXPECTED_AUDIENCE=your-api-audience
```

### 4. Start the Service

```bash
npm run dev
```

## API Endpoints

### OAuth2 Configuration

#### GET /api/security/oauth2
Get current OAuth2 configuration (sensitive fields redacted).

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": false,
    "jwksEndpoint": "https://***/.well-known/jwks.json",
    "expectedIssuer": "https://auth.example.com/",
    "expectedAudience": "api-audience",
    "tokenValidation": true,
    "cacheJwks": true,
    "algorithms": ["RS256", "RS384", "RS512"]
  },
  "timestamp": "2025-01-18T..."
}
```

#### PATCH /api/security/oauth2
Update OAuth2 configuration.

**Request:**
```json
{
  "enabled": true,
  "jwksEndpoint": "https://auth.example.com/.well-known/jwks.json",
  "expectedIssuer": "https://auth.example.com/",
  "expectedAudience": "nexus-api",
  "tokenValidation": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "jwksEndpoint": "https://***/.well-known/jwks.json",
    "expectedIssuer": "https://auth.example.com/",
    "expectedAudience": "nexus-api",
    "tokenValidation": true
  },
  "message": "OAuth2 configuration updated successfully",
  "timestamp": "2025-01-18T..."
}
```

#### POST /api/security/oauth2/test
Test JWT token validation.

**Request:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expectedGroups": ["admin", "developers"]
}
```

**Response (Valid Token):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "payload": {
      "sub": "user123",
      "iss": "https://auth.example.com/",
      "aud": "nexus-api",
      "exp": 1737244800,
      "iat": 1737241200
    },
    "groups": ["admin", "developers"],
    "permissions": ["read", "write", "admin"],
    "hasExpectedGroups": true,
    "timestamp": "2025-01-18T..."
  }
}
```

**Response (Invalid Token):**
```json
{
  "success": false,
  "data": {
    "valid": false,
    "errors": ["Token has expired"],
    "timestamp": "2025-01-18T..."
  }
}
```

### Permission Matrix

#### GET /api/security/permissions
Get permissions matrix for all servers.

**Response:**
```json
{
  "success": true,
  "data": {
    "mcp-server-1": {
      "allowGroups": ["admin", "developers"],
      "denyGroups": ["guests"],
      "toolOverrides": {
        "dangerous-tool": {
          "allowGroups": ["admin"],
          "denyGroups": ["developers"]
        }
      }
    },
    "mcp-server-2": {
      "allowGroups": ["admin"],
      "denyGroups": [],
      "toolOverrides": {}
    }
  },
  "metadata": {
    "serverCount": 2,
    "totalToolOverrides": 1
  },
  "timestamp": "2025-01-18T..."
}
```

#### PATCH /api/security/permissions
Update permissions for a specific server.

**Request:**
```json
{
  "serverId": "mcp-server-1",
  "allowGroups": ["admin", "developers", "analysts"],
  "denyGroups": ["guests", "readonly"],
  "toolOverrides": {
    "sensitive-data-access": {
      "allowGroups": ["admin"],
      "denyGroups": ["developers", "analysts"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mcp-server-1": {
      "allowGroups": ["admin", "developers", "analysts"],
      "denyGroups": ["guests", "readonly"],
      "toolOverrides": {
        "sensitive-data-access": {
          "allowGroups": ["admin"],
          "denyGroups": ["developers", "analysts"]
        }
      }
    }
  },
  "message": "Permissions updated for server: mcp-server-1",
  "timestamp": "2025-01-18T..."
}
```

#### GET /api/security/permissions/:serverId
Get permissions for a specific server.

**Response:**
```json
{
  "success": true,
  "data": {
    "allowGroups": ["admin", "developers"],
    "denyGroups": ["guests"],
    "toolOverrides": {}
  },
  "serverId": "mcp-server-1",
  "timestamp": "2025-01-18T..."
}
```

### User Groups

#### GET /api/security/groups
List all user groups.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "group_1737241200_abc123",
      "name": "administrators",
      "description": "System administrators with full access",
      "permissions": ["read", "write", "admin", "configure"],
      "memberCount": 5,
      "createdAt": "2025-01-18T10:00:00.000Z",
      "updatedAt": "2025-01-18T10:00:00.000Z"
    },
    {
      "id": "group_1737241201_def456",
      "name": "developers",
      "description": "Development team",
      "permissions": ["read", "write"],
      "memberCount": 20,
      "createdAt": "2025-01-18T10:00:01.000Z",
      "updatedAt": "2025-01-18T10:00:01.000Z"
    }
  ],
  "metadata": {
    "totalGroups": 2,
    "totalMembers": 25
  },
  "timestamp": "2025-01-18T..."
}
```

#### GET /api/security/groups/:id
Get a specific user group.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group_1737241200_abc123",
    "name": "administrators",
    "description": "System administrators with full access",
    "permissions": ["read", "write", "admin", "configure"],
    "memberCount": 5,
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  },
  "timestamp": "2025-01-18T..."
}
```

#### POST /api/security/groups
Create a new user group.

**Request:**
```json
{
  "name": "analysts",
  "description": "Data analysts with read-only access",
  "permissions": ["read", "query"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group_1737241300_ghi789",
    "name": "analysts",
    "description": "Data analysts with read-only access",
    "permissions": ["read", "query"],
    "memberCount": 0,
    "createdAt": "2025-01-18T10:01:40.000Z",
    "updatedAt": "2025-01-18T10:01:40.000Z"
  },
  "message": "Group created: analysts",
  "timestamp": "2025-01-18T..."
}
```

#### PATCH /api/security/groups/:id
Update an existing user group.

**Request:**
```json
{
  "name": "senior-analysts",
  "description": "Senior analysts with write access",
  "permissions": ["read", "write", "query"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group_1737241300_ghi789",
    "name": "senior-analysts",
    "description": "Senior analysts with write access",
    "permissions": ["read", "write", "query"],
    "memberCount": 0,
    "createdAt": "2025-01-18T10:01:40.000Z",
    "updatedAt": "2025-01-18T10:05:00.000Z"
  },
  "message": "Group updated: group_1737241300_ghi789",
  "timestamp": "2025-01-18T..."
}
```

#### DELETE /api/security/groups/:id
Delete a user group.

**Response:**
```json
{
  "success": true,
  "message": "Group deleted: group_1737241300_ghi789",
  "timestamp": "2025-01-18T..."
}
```

### Security Health & Utilities

#### GET /api/security/health
Get security subsystem health status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "data": {
    "oauth2": {
      "enabled": true,
      "configured": true,
      "jwksReachable": true,
      "lastValidation": "2025-01-18T10:05:00.000Z"
    },
    "permissions": {
      "configured": true,
      "serverCount": 3,
      "groupCount": 4
    },
    "audit": {
      "enabled": false,
      "recentViolations": 0
    }
  },
  "timestamp": "2025-01-18T..."
}
```

#### POST /api/security/cache/clear
Clear security configuration cache and JWKS cache.

**Response:**
```json
{
  "success": true,
  "message": "Security cache cleared successfully",
  "timestamp": "2025-01-18T..."
}
```

## Using OAuth2 Authentication

### 1. Enable OAuth2

```bash
curl -X PATCH http://localhost:8000/api/security/oauth2 \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "jwksEndpoint": "https://auth.example.com/.well-known/jwks.json",
    "expectedIssuer": "https://auth.example.com/",
    "expectedAudience": "nexus-api",
    "tokenValidation": true
  }'
```

### 2. Test Token Validation

```bash
curl -X POST http://localhost:8000/api/security/oauth2/test \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "expectedGroups": ["admin"]
  }'
```

### 3. Make Authenticated Requests

Once OAuth2 is enabled, include JWT token in Authorization header:

```bash
curl -X GET http://localhost:8000/v1/models \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

The middleware will:
1. Extract JWT from Authorization header
2. Validate signature using JWKS
3. Verify issuer, audience, and expiration
4. Extract groups and permissions
5. Populate `req.user`, `req.userGroups`, `req.userPermissions`

### 4. Applying Middleware to Routes

To protect specific routes, apply the authentication middleware:

```typescript
import { authenticate, requireGroups, requirePermissions } from './middleware/oauth2';

// Require authentication
app.use('/api/admin', authenticate, adminRouter);

// Require specific groups
app.use('/api/sensitive', authenticate, requireGroups(['admin']), sensitiveRouter);

// Require specific permissions
app.use('/api/write', authenticate, requirePermissions(['write']), writeRouter);
```

## Authorization Flow

### Permission Evaluation Order

1. **Check Deny Groups (Server Level)** - Deny takes precedence
2. **Check Tool Overrides (If Applicable)**
   - Check tool deny groups
   - Check tool allow groups
3. **Check Server Allow Groups**
4. **Default: Allow if no restrictions configured**

### Example Authorization Scenario

Given:
- User groups: `["developers", "analysts"]`
- Server permissions:
  ```json
  {
    "allowGroups": ["admin", "developers"],
    "denyGroups": ["readonly"],
    "toolOverrides": {
      "database-delete": {
        "allowGroups": ["admin"],
        "denyGroups": ["developers"]
      }
    }
  }
  ```

Results:
- Access to server: **ALLOWED** (in `developers` group)
- Access to `database-query` tool: **ALLOWED** (inherits server access)
- Access to `database-delete` tool: **DENIED** (explicitly denied for `developers`)

## Security Best Practices

### 1. Token Validation

- Always enable `tokenValidation: true` in production
- Use JWKS endpoints with proper caching
- Set appropriate `clockTolerance` (default: 60 seconds)
- Verify `expectedIssuer` and `expectedAudience` match your auth provider

### 2. Permission Management

- **Deny overrides allow** - Use deny lists sparingly
- Apply least privilege principle - Only grant necessary permissions
- Use tool-level overrides for fine-grained control
- Regularly audit permission configurations

### 3. Group Management

- Create specific groups for different roles
- Document group purposes in `description` field
- Track `memberCount` for auditing
- Remove unused groups regularly

### 4. Cache Management

- Default cache TTL: 1 minute (configurable)
- Clear cache after configuration changes
- Monitor cache hit rates for performance
- Use Redis for distributed deployments

### 5. Monitoring

- Check `/api/security/health` regularly
- Monitor token validation failures
- Track permission denials
- Implement audit logging for security events

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": 400
  }
}
```

Error types:
- `invalid_request_error` (400) - Invalid request body/parameters
- `authentication_error` (401) - Invalid or missing authentication
- `permission_error` (403) - Insufficient permissions
- `not_found_error` (404) - Resource not found
- `server_error` (500) - Internal server error

## Integration Examples

### Example 1: Protect MCP Proxy Routes

```typescript
import { authenticate, requireGroups } from './middleware/oauth2';
import { SecurityConfigService } from './services/security-config';

// Protect MCP tool calls with authorization
router.post('/mcp/tools/call',
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
  mcpToolCallHandler
);
```

### Example 2: Admin Dashboard Protection

```typescript
// Protect admin routes
app.use('/api/admin',
  authenticate,
  requireGroups(['admin']),
  adminRouter
);
```

### Example 3: Multi-Tier Access Control

```typescript
// Read access for all authenticated users
app.get('/api/data',
  authenticate,
  dataReadHandler
);

// Write access for specific groups
app.post('/api/data',
  authenticate,
  requireGroups(['admin', 'editors']),
  dataWriteHandler
);

// Delete access for admins only
app.delete('/api/data/:id',
  authenticate,
  requireGroups(['admin']),
  requirePermissions(['delete']),
  dataDeleteHandler
);
```

## Architecture

### Components

1. **OAuth2Middleware** (`src/middleware/oauth2.ts`)
   - JWT token validation using JWKS
   - Request context population
   - Group and permission enforcement

2. **SecurityConfigService** (`src/services/security-config.ts`)
   - OAuth2 configuration management
   - Permission matrix storage
   - User group CRUD operations
   - Authorization decision engine

3. **Security Routes** (`src/routes/security.ts`)
   - RESTful API endpoints
   - Input validation using Zod
   - Error handling and logging

4. **Security Types** (`src/types/security.ts`)
   - TypeScript type definitions
   - Zod validation schemas
   - Request/response interfaces

### Data Flow

```
Request → OAuth2Middleware → Authorization Check → Route Handler
   ↓            ↓                      ↓
Extract JWT → Validate Token → Check Permissions → Execute
   ↓            ↓                      ↓
JWKS Query → Group Extraction → Decision → Response
```

### Storage

- **Redis** (primary) - Distributed configuration storage
- **In-Memory Cache** (fallback) - Local cache with 1-minute TTL
- **Configuration Keys**:
  - `security:oauth2:config` - OAuth2 configuration
  - `security:permissions:matrix` - Permission matrix
  - `security:groups:{id}` - Individual group data

## Testing

### Manual Testing

```bash
# 1. Configure OAuth2
curl -X PATCH http://localhost:8000/api/security/oauth2 \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "jwksEndpoint": "https://..."}'

# 2. Create groups
curl -X POST http://localhost:8000/api/security/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "developers", "permissions": ["read", "write"]}'

# 3. Configure permissions
curl -X PATCH http://localhost:8000/api/security/permissions \
  -H "Content-Type: application/json" \
  -d '{"serverId": "mcp-1", "allowGroups": ["developers"]}'

# 4. Test token
curl -X POST http://localhost:8000/api/security/oauth2/test \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJ..."}'

# 5. Check health
curl -X GET http://localhost:8000/api/security/health
```

### Automated Testing

```typescript
import request from 'supertest';
import { app } from '../src/index';

describe('Security API', () => {
  it('should update OAuth2 config', async () => {
    const response = await request(app)
      .patch('/api/security/oauth2')
      .send({
        enabled: true,
        jwksEndpoint: 'https://auth.example.com/.well-known/jwks.json'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Troubleshooting

### Issue: Token validation fails with "JWKS endpoint unreachable"

**Solution:**
1. Verify JWKS endpoint URL is correct and accessible
2. Check firewall/network settings
3. Ensure HTTPS is properly configured
4. Test JWKS endpoint manually: `curl https://your-jwks-endpoint`

### Issue: "Token has expired" errors

**Solution:**
1. Check clock synchronization between servers
2. Increase `clockTolerance` setting (default: 60 seconds)
3. Verify token `exp` claim is in the future
4. Ensure your auth provider is issuing valid tokens

### Issue: Authorization denied despite correct groups

**Solution:**
1. Verify user groups are correctly embedded in JWT claims
2. Check permission matrix configuration
3. Review deny groups (deny overrides allow)
4. Test authorization decision: Check `/api/security/permissions/:serverId`

### Issue: Cache not updating after configuration changes

**Solution:**
1. Clear cache manually: `POST /api/security/cache/clear`
2. Restart the service
3. Check Redis connection status
4. Reduce cache TTL in development

## Support

For issues, questions, or contributions:
- GitHub: https://github.com/your-org/project-nyra
- Documentation: See `docs/` directory
- Security Issues: Report privately to security@your-org.com
