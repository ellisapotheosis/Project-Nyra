# Security Hardening Guide - Project Nyra

**Version**: 1.0
**Last Updated**: 2026-01-10
**Maintained By**: Security Team

## Table of Contents

1. [Introduction](#introduction)
2. [Infrastructure Security](#1-infrastructure-security)
3. [Application Security](#2-application-security)
4. [MCP Server Security](#3-mcp-server-security)
5. [GPU Worker Security](#4-gpu-worker-security)
6. [Monitoring & Audit](#5-monitoring--audit)
7. [Security Checklist](#security-checklist)
8. [Incident Response](#incident-response)

---

## Introduction

This guide provides comprehensive security hardening procedures for Project Nyra's intelligent mortgage platform. It covers infrastructure, application, MCP servers, GPU workers, and monitoring systems.

### Threat Model

**Assets to Protect**:
- Customer PII (Personally Identifiable Information)
- Financial data (mortgage rates, quotes, applications)
- API keys and secrets
- AI models and training data
- Internal system credentials

**Threat Actors**:
- External attackers (SQL injection, XSS, DDoS)
- Insider threats (privilege escalation, data exfiltration)
- Supply chain attacks (compromised dependencies)
- AI-specific attacks (prompt injection, model poisoning)

**Security Objectives**:
- **Confidentiality**: Protect sensitive data at rest and in transit
- **Integrity**: Prevent unauthorized modifications
- **Availability**: Ensure system uptime and resilience
- **Compliance**: Meet financial industry regulations (PCI-DSS, SOC 2)

---

## 1. Infrastructure Security

### 1.1 Docker Security Best Practices

#### Docker Daemon Security

```bash
# 1. Run Docker daemon in rootless mode (recommended)
dockerd-rootless-setuptool.sh install

# 2. Enable Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# 3. Configure daemon.json for security
cat > /etc/docker/daemon.json <<EOF
{
  "icc": false,
  "userns-remap": "default",
  "no-new-privileges": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false
}
EOF

# 4. Restart Docker daemon
sudo systemctl restart docker
```

#### Container Security

**Dockerfile Hardening**:

```dockerfile
# Use minimal, specific base images
FROM node:20-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install only production dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Drop privileges
USER nodejs

# Use read-only root filesystem
RUN chmod -R 755 /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node healthcheck.js || exit 1

EXPOSE 3000
CMD ["node", "server.js"]
```

**Docker Compose Security**:

```yaml
# C:/Dev/Projects/Repos/Project-Nyra/infra/docker/docker-compose.orchestration.yml
services:
  postgresql:
    image: postgres:16-alpine
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - SETGID
      - SETUID
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/postgresql
    user: postgres

  redis:
    image: redis:7-alpine
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SETGID
      - SETUID
    read_only: true
    tmpfs:
      - /tmp
```

#### Image Security Scanning

```bash
# 1. Install Trivy scanner
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | \
  sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# 2. Scan images before deployment
trivy image --severity HIGH,CRITICAL postgres:16-alpine
trivy image --severity HIGH,CRITICAL redis:7-alpine
trivy image --severity HIGH,CRITICAL qdrant/qdrant:latest

# 3. Scan local images
trivy image nyra-archon-os:latest
trivy image nyra-archon-os:latest

# 4. Generate security reports
trivy image --format json --output /reports/image-scan.json nyra-archon-os:latest
```

### 1.2 Network Segmentation

#### Docker Network Architecture

```yaml
# Define isolated networks
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/24

  backend:
    driver: bridge
    internal: true  # No external access
    ipam:
      config:
        - subnet: 172.28.1.0/24

  database:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.28.2.0/24

services:
  # Frontend services
  nginx:
    networks:
      - frontend
      - backend

  # Application services
  archon-os:
    networks:
      - backend
      - database

  # Database services
  postgresql:
    networks:
      - database
```

#### Firewall Rules (UFW)

```bash
# 1. Enable UFW
sudo ufw enable

# 2. Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 3. Allow SSH (change default port)
sudo ufw allow 22122/tcp comment 'SSH'

# 4. Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 5. Allow Tailscale
sudo ufw allow 41641/udp comment 'Tailscale'

# 6. Allow internal Docker networks
sudo ufw allow from 172.28.0.0/16 comment 'Docker networks'

# 7. Rate limiting for SSH
sudo ufw limit 22122/tcp

# 8. Log blocked connections
sudo ufw logging on
```

### 1.3 Secrets Management (Infisical)

#### Infisical Setup

```bash
# 1. Install Infisical CLI
brew install infisical/get-cli/infisical

# 2. Login to Infisical
infisical login

# 3. Initialize project
cd /path/to/project-nyra
infisical init --project-id="8374cea9-e5e8-4050-bda4-b91f25ab30ef"

# 4. Create service token (for CI/CD)
infisical service-token create --name "github-actions" \
  --project-id="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --environment="production"
```

#### Secret Injection

```bash
# Run services with Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared" \
  -- docker compose -f docker-compose.orchestration.yml up -d

# Or use Infisical agent
infisical agent --daemon \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production"
```

#### Secret Rotation Policy

```bash
# Rotate secrets every 90 days
# C:/Dev/Projects/Repos/Project-Nyra/scripts/security/rotate-secrets.sh

#!/bin/bash
set -euo pipefail

# Rotate database passwords
infisical secrets update POSTGRES_PASSWORD --value "$(openssl rand -base64 32)" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared/database"

# Rotate Redis passwords
infisical secrets update REDIS_PASSWORD --value "$(openssl rand -base64 32)" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared/cache"

# Rotate API keys
infisical secrets update QDRANT_API_KEY --value "$(uuidgen)" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared/vector-db"

echo "Secrets rotated successfully. Restart services to apply."
```

### 1.4 API Authentication

#### JWT-Based Authentication

```typescript
// services/auth-service/src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID for revocation
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify token signature
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
      { algorithms: ['HS256'] }
    ) as JWTPayload;

    // Check token revocation list
    const isRevoked = await redisClient.get(`token:revoked:${payload.jti}`);
    if (isRevoked) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Check user session
    const session = await redisClient.get(`session:${payload.userId}`);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

#### API Key Management

```typescript
// services/auth-service/src/models/ApiKey.ts
import { randomBytes, createHash } from 'crypto';
import { db } from '../config/database';

export class ApiKey {
  // Generate API key
  static async create(userId: string, name: string, scopes: string[]): Promise<string> {
    const keyPrefix = 'nyra';
    const keySecret = randomBytes(32).toString('hex');
    const fullKey = `${keyPrefix}_${keySecret}`;

    // Hash the key for storage
    const keyHash = createHash('sha256').update(fullKey).digest('hex');

    await db.query(
      `INSERT INTO api_keys (user_id, key_hash, name, scopes, created_at, last_used_at)
       VALUES ($1, $2, $3, $4, NOW(), NULL)`,
      [userId, keyHash, name, JSON.stringify(scopes)]
    );

    // Return the full key only once
    return fullKey;
  }

  // Verify API key
  static async verify(key: string): Promise<ApiKeyData | null> {
    const keyHash = createHash('sha256').update(key).digest('hex');

    const result = await db.query(
      `UPDATE api_keys
       SET last_used_at = NOW()
       WHERE key_hash = $1 AND revoked_at IS NULL
       RETURNING *`,
      [keyHash]
    );

    return result.rows[0] || null;
  }

  // Revoke API key
  static async revoke(keyId: string): Promise<void> {
    await db.query(
      `UPDATE api_keys SET revoked_at = NOW() WHERE id = $1`,
      [keyId]
    );
  }
}

interface ApiKeyData {
  id: string;
  user_id: string;
  name: string;
  scopes: string[];
  created_at: Date;
  last_used_at: Date | null;
}
```

### 1.5 Rate Limiting

#### Redis-Based Rate Limiter

```typescript
// services/shared/src/middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';

// Global rate limiter (100 requests per 15 minutes)
export const globalRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
});

// Authentication rate limiter (5 attempts per 15 minutes)
export const authRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts. Account temporarily locked.',
    retryAfter: '15 minutes'
  },
});

// AI API rate limiter (30 requests per minute)
export const aiRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator: (req) => {
    // Rate limit by user ID or API key
    return req.user?.userId || req.ip;
  },
  message: {
    error: 'AI API rate limit exceeded.',
    retryAfter: '1 minute'
  },
});

// Database query rate limiter
export const dbQueryRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:db:',
  }),
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => `${req.user?.userId || req.ip}:db`,
});
```

---

## 2. Application Security

### 2.1 Input Validation

#### Zod Schema Validation

```typescript
// services/shared/src/validation/schemas.ts
import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

// Mortgage quote request schema
export const quoteRequestSchema = z.object({
  loanAmount: z.number().min(50000).max(10000000),
  propertyValue: z.number().min(50000).max(20000000),
  creditScore: z.number().min(300).max(850),
  loanTerm: z.enum(['15', '20', '25', '30']),
  propertyType: z.enum(['single_family', 'condo', 'townhouse', 'multi_family']),
  occupancy: z.enum(['primary', 'secondary', 'investment']),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
});

// Sanitization middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
```

### 2.2 SQL Injection Prevention

#### Parameterized Queries

```typescript
// services/shared/src/database/query-builder.ts
import { Pool, PoolClient } from 'pg';

export class SafeQueryBuilder {
  constructor(private pool: Pool) {}

  // Always use parameterized queries
  async query<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      // Log query for auditing (redact sensitive data)
      const sanitizedSql = this.sanitizeForLogging(sql, params);
      console.log('[DB Query]', sanitizedSql);

      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Safe query with automatic escaping
  async findById(table: string, id: string): Promise<any> {
    // Whitelist allowed tables
    if (!this.isValidTable(table)) {
      throw new Error('Invalid table name');
    }

    return this.query(
      `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
      [id]
    );
  }

  // Validate table names against whitelist
  private isValidTable(table: string): boolean {
    const allowedTables = [
      'users',
      'mortgage_quotes',
      'rate_alerts',
      'documents',
      'audit_logs',
    ];
    return allowedTables.includes(table);
  }

  // Sanitize SQL for logging (redact sensitive values)
  private sanitizeForLogging(sql: string, params: any[]): string {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /ssn/i,
      /credit/i,
    ];

    let sanitized = sql;
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      if (sensitivePatterns.some(pattern => sql.match(pattern))) {
        sanitized = sanitized.replace(placeholder, '[REDACTED]');
      } else {
        sanitized = sanitized.replace(
          placeholder,
          typeof param === 'string' ? `'${param}'` : String(param)
        );
      }
    });

    return sanitized;
  }
}
```

### 2.3 XSS Protection

#### Content Security Policy

```typescript
// services/shared/src/middleware/security-headers.ts
import helmet from 'helmet';
import { Express } from 'express';

export const configureSecurityHeaders = (app: Express) => {
  // Use Helmet for secure headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.nyra.ai"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }));

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
};
```

#### HTML Sanitization

```typescript
// services/shared/src/utils/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';

export class Sanitizer {
  // Sanitize HTML content
  static sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
    });
  }

  // Escape for JavaScript context
  static escapeJs(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  // Escape for HTML context
  static escapeHtml(str: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return str.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  // Remove null bytes
  static removeNullBytes(str: string): string {
    return str.replace(/\0/g, '');
  }
}
```

### 2.4 CSRF Protection

```typescript
// services/shared/src/middleware/csrf.ts
import csrf from 'csurf';
import { Express } from 'express';

export const configureCsrf = (app: Express) => {
  // Enable CSRF protection
  const csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  // Apply to state-changing operations
  app.use('/api/*', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return csrfProtection(req, res, next);
    }
    next();
  });

  // Provide CSRF token endpoint
  app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
};
```

### 2.5 Secure Headers

```typescript
// services/shared/src/middleware/secure-headers.ts
export const secureHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};
```

---

## 3. MCP Server Security

### 3.1 Server Authentication

#### MCP Server Configuration

```json
// C:/Users/YOUR_USER/.config/mcp/settings.json
{
  "mcpServers": {
    "ruv-swarm": {
      "command": "node",
      "args": ["C:/Dev/Projects/Repos/Project-Nyra/mcp-ecosystem/ruv-swarm/build/index.js"],
      "env": {
        "MCP_AUTH_ENABLED": "true",
        "MCP_AUTH_TOKEN": "${MCP_RUV_SWARM_TOKEN}",
        "MCP_RATE_LIMIT_ENABLED": "true",
        "MCP_RATE_LIMIT_MAX_REQUESTS": "100",
        "MCP_RATE_LIMIT_WINDOW_MS": "60000",
        "MCP_LOG_LEVEL": "info"
      }
    },
    "flow-nexus": {
      "command": "node",
      "args": ["C:/Dev/Projects/Repos/Project-Nyra/mcp-ecosystem/flow-nexus/build/index.js"],
      "env": {
        "MCP_AUTH_ENABLED": "true",
        "MCP_AUTH_TOKEN": "${MCP_FLOW_NEXUS_TOKEN}",
        "E2B_API_KEY": "${E2B_API_KEY}",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "MCP_RATE_LIMIT_ENABLED": "true"
      }
    }
  }
}
```

#### Token-Based Authentication

```typescript
// mcp-ecosystem/shared/auth/mcp-auth.ts
import crypto from 'crypto';

export class MCPAuth {
  private static readonly TOKEN_PREFIX = 'mcp_';
  private static readonly TOKEN_LENGTH = 32;

  // Generate MCP auth token
  static generateToken(): string {
    const randomBytes = crypto.randomBytes(this.TOKEN_LENGTH);
    return `${this.TOKEN_PREFIX}${randomBytes.toString('hex')}`;
  }

  // Verify MCP auth token
  static verifyToken(providedToken: string, expectedToken: string): boolean {
    if (!providedToken || !expectedToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(providedToken),
      Buffer.from(expectedToken)
    );
  }

  // Middleware for MCP server requests
  static authMiddleware(req: any, res: any, next: Function) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');

    const expectedToken = process.env.MCP_AUTH_TOKEN;

    if (!expectedToken) {
      console.warn('MCP_AUTH_TOKEN not configured');
      return next();
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'MCP_AUTH_MISSING_TOKEN',
      });
    }

    if (!this.verifyToken(token, expectedToken)) {
      return res.status(403).json({
        error: 'Invalid authentication token',
        code: 'MCP_AUTH_INVALID_TOKEN',
      });
    }

    next();
  }
}
```

### 3.2 Tool Authorization

#### Role-Based Access Control for MCP Tools

```typescript
// mcp-ecosystem/shared/auth/mcp-authorization.ts
export enum MCPRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  AGENT = 'agent',
  READONLY = 'readonly',
}

export enum MCPToolPermission {
  SWARM_INIT = 'swarm:init',
  SWARM_DESTROY = 'swarm:destroy',
  AGENT_SPAWN = 'agent:spawn',
  TASK_ORCHESTRATE = 'task:orchestrate',
  SANDBOX_CREATE = 'sandbox:create',
  SANDBOX_EXECUTE = 'sandbox:execute',
  NEURAL_TRAIN = 'neural:train',
  WORKFLOW_CREATE = 'workflow:create',
}

const ROLE_PERMISSIONS: Record<MCPRole, MCPToolPermission[]> = {
  [MCPRole.ADMIN]: Object.values(MCPToolPermission),
  [MCPRole.DEVELOPER]: [
    MCPToolPermission.SWARM_INIT,
    MCPToolPermission.AGENT_SPAWN,
    MCPToolPermission.TASK_ORCHESTRATE,
    MCPToolPermission.SANDBOX_CREATE,
    MCPToolPermission.SANDBOX_EXECUTE,
    MCPToolPermission.WORKFLOW_CREATE,
  ],
  [MCPRole.AGENT]: [
    MCPToolPermission.TASK_ORCHESTRATE,
    MCPToolPermission.SANDBOX_EXECUTE,
  ],
  [MCPRole.READONLY]: [],
};

export class MCPAuthorization {
  static hasPermission(role: MCPRole, permission: MCPToolPermission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  }

  static checkPermission(role: MCPRole, permission: MCPToolPermission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(
        `Insufficient permissions. Required: ${permission}, Role: ${role}`
      );
    }
  }

  // Decorator for MCP tool handlers
  static requirePermission(permission: MCPToolPermission) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const context = args[0]; // First argument is typically context
        const userRole = context.role || MCPRole.READONLY;

        MCPAuthorization.checkPermission(userRole, permission);

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}
```

### 3.3 Request Validation

```typescript
// mcp-ecosystem/shared/validation/mcp-validator.ts
import { z } from 'zod';

export class MCPValidator {
  // Validate swarm initialization request
  static readonly swarmInitSchema = z.object({
    topology: z.enum(['mesh', 'hierarchical', 'ring', 'star']),
    maxAgents: z.number().min(1).max(100).default(5),
    strategy: z.enum(['balanced', 'specialized', 'adaptive']).default('balanced'),
  });

  // Validate agent spawn request
  static readonly agentSpawnSchema = z.object({
    type: z.enum(['researcher', 'coder', 'analyst', 'optimizer', 'coordinator']),
    capabilities: z.array(z.string()).optional(),
    name: z.string().max(100).optional(),
  });

  // Validate task orchestration request
  static readonly taskOrchestateSchema = z.object({
    task: z.string().min(1).max(10000),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    strategy: z.enum(['parallel', 'sequential', 'adaptive']).default('adaptive'),
    maxAgents: z.number().min(1).max(10).optional(),
  });

  // Validate sandbox creation request
  static readonly sandboxCreateSchema = z.object({
    template: z.enum(['node', 'python', 'react', 'nextjs', 'vanilla', 'base', 'claude-code']),
    name: z.string().max(100).optional(),
    timeout: z.number().min(60).max(3600).default(3600),
    env_vars: z.record(z.string()).optional(),
    install_packages: z.array(z.string()).optional(),
  });

  // Generic validation wrapper
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }
}
```

### 3.4 Rate Limiting Per Server

```typescript
// mcp-ecosystem/shared/middleware/mcp-rate-limiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

export class MCPRateLimiter {
  private limiters: Map<string, RateLimiterMemory>;

  constructor() {
    this.limiters = new Map();
  }

  // Create rate limiter for specific tool
  createLimiter(toolName: string, maxRequests: number, windowMs: number) {
    this.limiters.set(
      toolName,
      new RateLimiterMemory({
        points: maxRequests,
        duration: windowMs / 1000,
      })
    );
  }

  // Check rate limit
  async checkLimit(toolName: string, identifier: string): Promise<void> {
    const limiter = this.limiters.get(toolName);

    if (!limiter) {
      // No rate limit configured for this tool
      return;
    }

    try {
      await limiter.consume(identifier);
    } catch (error) {
      throw new Error(
        `Rate limit exceeded for ${toolName}. Please try again later.`
      );
    }
  }

  // Middleware for MCP tool calls
  rateLimitMiddleware(toolName: string) {
    return async (req: any, res: any, next: Function) => {
      const identifier = req.user?.id || req.ip || 'anonymous';

      try {
        await this.checkLimit(toolName, identifier);
        next();
      } catch (error) {
        res.status(429).json({
          error: (error as Error).message,
          code: 'MCP_RATE_LIMIT_EXCEEDED',
        });
      }
    };
  }
}

// Default rate limits
export const defaultMCPRateLimits = {
  'swarm_init': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  'agent_spawn': { maxRequests: 50, windowMs: 60000 }, // 50 per minute
  'task_orchestrate': { maxRequests: 100, windowMs: 60000 }, // 100 per minute
  'sandbox_create': { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  'sandbox_execute': { maxRequests: 200, windowMs: 60000 }, // 200 per minute
  'neural_train': { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
};
```

---

## 4. GPU Worker Security

### 4.1 Tailscale VPN Setup

#### Installation and Configuration

```bash
# 1. Install Tailscale on GPU workers
curl -fsSL https://tailscale.com/install.sh | sh

# 2. Authenticate with Tailscale
sudo tailscale up --accept-routes

# 3. Get Tailscale IP
tailscale ip -4

# 4. Configure Tailscale ACL (on Tailscale admin console)
# https://login.tailscale.com/admin/acls
```

**Tailscale ACL Configuration**:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:orchestrator"],
      "dst": ["tag:gpu-worker:*"]
    },
    {
      "action": "accept",
      "src": ["tag:gpu-worker"],
      "dst": ["tag:database:5432", "tag:redis:6379"]
    }
  ],
  "tagOwners": {
    "tag:orchestrator": ["admin@nyra.ai"],
    "tag:gpu-worker": ["admin@nyra.ai"],
    "tag:database": ["admin@nyra.ai"],
    "tag:redis": ["admin@nyra.ai"]
  },
  "hosts": {
    "orchestrator-mini": "100.64.0.1",
    "worker-rtx5090": "100.64.0.10",
    "worker-rtx3090": "100.64.0.11",
    "worker-rtx3060": "100.64.0.12"
  }
}
```

#### Nexus Router Configuration

```yaml
# C:/Dev/Projects/Repos/Project-Nyra/infra/docker/docker-compose.orchestration.yml
services:
  nexus-router:
    environment:
      # Use Tailscale IPs for GPU workers
      WORKER_5090_URL: http://100.64.0.10:8000
      WORKER_3090_URL: http://100.64.0.11:8000
      WORKER_3060_URL: http://100.64.0.12:8000

      # Enable TLS for worker communication
      WORKER_TLS_ENABLED: "true"
      WORKER_TLS_VERIFY: "true"
```

### 4.2 SSH Hardening

#### SSH Configuration

```bash
# C:/Dev/Projects/Repos/Project-Nyra/scripts/security/harden-ssh.sh

#!/bin/bash
set -euo pipefail

# 1. Backup original sshd_config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 2. Configure secure SSH settings
sudo tee /etc/ssh/sshd_config.d/99-nyra-hardening.conf <<EOF
# Change default port
Port 22122

# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no
ChallengeResponseAuthentication no
PubkeyAuthentication yes

# Disable empty passwords
PermitEmptyPasswords no

# Allow only specific users
AllowUsers nyra-admin

# Limit authentication attempts
MaxAuthTries 3
MaxSessions 2

# Set idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable X11 forwarding
X11Forwarding no

# Disable tunneling
AllowTcpForwarding no
AllowStreamLocalForwarding no
GatewayPorts no
PermitTunnel no

# Use strong ciphers
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group-exchange-sha256

# Enable strict mode
StrictModes yes

# Log verbosely
LogLevel VERBOSE
EOF

# 3. Test configuration
sudo sshd -t

# 4. Restart SSH service
sudo systemctl restart sshd

echo "SSH hardening complete. New SSH port: 22122"
```

#### SSH Key Management

```bash
# Generate strong SSH key (Ed25519)
ssh-keygen -t ed25519 -C "nyra-orchestrator@nyra.ai" -f ~/.ssh/id_ed25519_nyra

# Copy public key to GPU workers
ssh-copy-id -i ~/.ssh/id_ed25519_nyra.pub -p 22122 nyra-admin@worker-rtx5090

# Configure SSH client
cat >> ~/.ssh/config <<EOF
Host worker-rtx5090
    HostName 100.64.0.10
    Port 22122
    User nyra-admin
    IdentityFile ~/.ssh/id_ed25519_nyra
    IdentitiesOnly yes

Host worker-rtx3090
    HostName 100.64.0.11
    Port 22122
    User nyra-admin
    IdentityFile ~/.ssh/id_ed25519_nyra
    IdentitiesOnly yes

Host worker-rtx3060
    HostName 100.64.0.12
    Port 22122
    User nyra-admin
    IdentityFile ~/.ssh/id_ed25519_nyra
    IdentitiesOnly yes
EOF
```

### 4.3 Firewall Rules

```bash
# C:/Dev/Projects/Repos/Project-Nyra/scripts/security/configure-firewall.sh

#!/bin/bash
set -euo pipefail

# GPU Worker Firewall Configuration

# 1. Reset UFW
sudo ufw --force reset

# 2. Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 3. Allow SSH (custom port)
sudo ufw allow 22122/tcp comment 'SSH'

# 4. Allow Tailscale
sudo ufw allow 41641/udp comment 'Tailscale'

# 5. Allow LLM inference API (only from Tailscale network)
sudo ufw allow from 100.64.0.0/10 to any port 8000 proto tcp comment 'LLM API'

# 6. Allow monitoring (Prometheus)
sudo ufw allow from 100.64.0.1 to any port 9090 proto tcp comment 'Prometheus'

# 7. Rate limiting for SSH
sudo ufw limit 22122/tcp

# 8. Enable logging
sudo ufw logging on

# 9. Enable firewall
sudo ufw --force enable

# 10. Show status
sudo ufw status verbose
```

### 4.4 Model Access Control

```typescript
// services/nexus-router/src/middleware/model-access-control.ts
import { Request, Response, NextFunction } from 'express';

interface ModelAccessPolicy {
  modelName: string;
  allowedUsers: string[];
  allowedRoles: string[];
  requiresApproval: boolean;
  maxTokens: number;
}

const MODEL_ACCESS_POLICIES: ModelAccessPolicy[] = [
  {
    modelName: 'llama-3.3-70b',
    allowedUsers: ['*'],
    allowedRoles: ['admin', 'developer', 'agent'],
    requiresApproval: false,
    maxTokens: 4096,
  },
  {
    modelName: 'claude-opus-4.5',
    allowedUsers: ['*'],
    allowedRoles: ['admin', 'developer'],
    requiresApproval: false,
    maxTokens: 200000,
  },
  {
    modelName: 'deepseek-v3',
    allowedUsers: ['admin@nyra.ai'],
    allowedRoles: ['admin'],
    requiresApproval: true,
    maxTokens: 8192,
  },
];

export class ModelAccessControl {
  static checkAccess(
    modelName: string,
    userId: string,
    userRole: string
  ): boolean {
    const policy = MODEL_ACCESS_POLICIES.find(p => p.modelName === modelName);

    if (!policy) {
      // Model not found, deny by default
      return false;
    }

    // Check role
    if (!policy.allowedRoles.includes(userRole)) {
      return false;
    }

    // Check user
    if (!policy.allowedUsers.includes('*') && !policy.allowedUsers.includes(userId)) {
      return false;
    }

    return true;
  }

  static middleware(req: Request, res: Response, next: NextFunction) {
    const { model } = req.body;
    const userId = req.user?.userId || 'anonymous';
    const userRole = req.user?.role || 'guest';

    if (!model) {
      return res.status(400).json({ error: 'Model name required' });
    }

    const hasAccess = ModelAccessControl.checkAccess(model, userId, userRole);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied to requested model',
        model,
        userId,
        userRole,
      });
    }

    // Enforce token limits
    const policy = MODEL_ACCESS_POLICIES.find(p => p.modelName === model);
    if (policy && req.body.max_tokens > policy.maxTokens) {
      req.body.max_tokens = policy.maxTokens;
    }

    next();
  }
}
```

---

## 5. Monitoring & Audit

### 5.1 Access Logging

#### Structured Logging with Winston

```typescript
// services/shared/src/logging/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, printf } = winston.format;

// Custom format for security events
const securityFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...metadata,
  });
});

// Create logger instance
export const securityLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(),
    securityFormat
  ),
  transports: [
    // Rotate security logs daily
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '90d',
      level: 'info',
    }),
    // Separate file for security incidents
    new DailyRotateFile({
      filename: 'logs/security-incidents-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '365d',
      level: 'warn',
    }),
  ],
});

// Security event types
export enum SecurityEvent {
  AUTH_SUCCESS = 'auth:success',
  AUTH_FAILURE = 'auth:failure',
  AUTH_LOCKOUT = 'auth:lockout',
  TOKEN_REVOKED = 'token:revoked',
  PERMISSION_DENIED = 'permission:denied',
  RATE_LIMIT_EXCEEDED = 'rate_limit:exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious:activity',
  SQL_INJECTION_ATTEMPT = 'attack:sql_injection',
  XSS_ATTEMPT = 'attack:xss',
  CSRF_FAILURE = 'attack:csrf',
  DATA_ACCESS = 'data:access',
  DATA_MODIFICATION = 'data:modification',
  ADMIN_ACTION = 'admin:action',
}

// Log security event
export const logSecurityEvent = (
  event: SecurityEvent,
  userId: string | null,
  details: Record<string, any>
) => {
  securityLogger.info({
    event,
    userId,
    ip: details.ip,
    userAgent: details.userAgent,
    ...details,
  });
};
```

#### Access Logging Middleware

```typescript
// services/shared/src/middleware/access-logger.ts
import { Request, Response, NextFunction } from 'express';
import { securityLogger, logSecurityEvent, SecurityEvent } from '../logging/logger';

export const accessLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user?.userId || null;

    securityLogger.info({
      event: 'http:request',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Log suspicious activities
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent(SecurityEvent.PERMISSION_DENIED, userId, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    if (res.statusCode === 429) {
      logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, userId, {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
    }
  });

  next();
};
```

### 5.2 Audit Trails

#### Database Audit Log Schema

```sql
-- C:/Dev/Projects/Repos/Project-Nyra/infra/migrations/001_create_audit_logs.sql

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- Partition by month for better performance
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Add more partitions as needed
```

#### Audit Logger Service

```typescript
// services/shared/src/audit/audit-logger.ts
import { Pool } from 'pg';

interface AuditLogEntry {
  eventType: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  constructor(private pool: Pool) {}

  async log(entry: AuditLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs (
        event_type, user_id, entity_type, entity_id, action,
        old_values, new_values, ip_address, user_agent, request_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        entry.eventType,
        entry.userId || null,
        entry.entityType || null,
        entry.entityId || null,
        entry.action,
        entry.oldValues ? JSON.stringify(entry.oldValues) : null,
        entry.newValues ? JSON.stringify(entry.newValues) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.requestId || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
      ]
    );
  }

  // Query audit logs
  async query(filters: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.entityType) {
      conditions.push(`entity_type = $${paramIndex++}`);
      params.push(filters.entityType);
    }

    if (filters.entityId) {
      conditions.push(`entity_id = $${paramIndex++}`);
      params.push(filters.entityId);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;

    const result = await this.pool.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex}`,
      [...params, limit]
    );

    return result.rows;
  }
}
```

### 5.3 Security Scanning

#### Automated Vulnerability Scanning

```bash
# C:/Dev/Projects/Repos/Project-Nyra/scripts/security/scan.sh

#!/bin/bash
set -euo pipefail

REPORT_DIR="./security-reports"
mkdir -p "$REPORT_DIR"

echo "Starting security scans..."

# 1. Dependency vulnerability scanning (npm audit)
echo "1/5: Scanning npm dependencies..."
pnpm audit --json > "$REPORT_DIR/npm-audit-$(date +%Y%m%d).json" || true

# 2. Container image scanning (Trivy)
echo "2/5: Scanning Docker images..."
trivy image --format json --output "$REPORT_DIR/trivy-postgres-$(date +%Y%m%d).json" postgres:16-alpine
trivy image --format json --output "$REPORT_DIR/trivy-redis-$(date +%Y%m%d).json" redis:7-alpine
trivy image --format json --output "$REPORT_DIR/trivy-qdrant-$(date +%Y%m%d).json" qdrant/qdrant:latest

# 3. SAST (Static Application Security Testing) with Semgrep
echo "3/5: Running SAST with Semgrep..."
semgrep --config=auto --json --output="$REPORT_DIR/semgrep-$(date +%Y%m%d).json" .

# 4. Secret scanning with TruffleHog
echo "4/5: Scanning for secrets..."
trufflehog git file://. --json > "$REPORT_DIR/trufflehog-$(date +%Y%m%d).json" || true

# 5. Infrastructure as Code scanning (Checkov)
echo "5/5: Scanning IaC with Checkov..."
checkov -d ./infra --framework dockerfile,docker_compose -o json > "$REPORT_DIR/checkov-$(date +%Y%m%d).json" || true

echo "Security scans complete. Reports saved to $REPORT_DIR"

# Generate summary
echo "Generating summary..."
node scripts/security/generate-summary.js "$REPORT_DIR"
```

#### CI/CD Security Scanning

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly
    - cron: '0 0 * * 0'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/typescript
            p/javascript
            p/docker

      - name: Run npm audit
        run: pnpm audit --audit-level=high

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

### 5.4 Vulnerability Management

#### Vulnerability Response Workflow

```typescript
// scripts/security/vulnerability-manager.ts
interface Vulnerability {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  package: string;
  version: string;
  patchedVersion?: string;
  cve?: string;
  description: string;
  detectedAt: Date;
}

class VulnerabilityManager {
  // SLA for vulnerability remediation
  private readonly REMEDIATION_SLA = {
    CRITICAL: 24 * 60 * 60 * 1000, // 24 hours
    HIGH: 7 * 24 * 60 * 60 * 1000, // 7 days
    MEDIUM: 30 * 24 * 60 * 60 * 1000, // 30 days
    LOW: 90 * 24 * 60 * 60 * 1000, // 90 days
  };

  async processVulnerabilities(vulns: Vulnerability[]): Promise<void> {
    const now = Date.now();

    for (const vuln of vulns) {
      const sla = this.REMEDIATION_SLA[vuln.severity];
      const deadline = new Date(vuln.detectedAt.getTime() + sla);
      const isOverdue = now > deadline.getTime();

      console.log(`[${vuln.severity}] ${vuln.package}@${vuln.version}`);
      console.log(`  CVE: ${vuln.cve || 'N/A'}`);
      console.log(`  Patched: ${vuln.patchedVersion || 'No patch available'}`);
      console.log(`  Deadline: ${deadline.toISOString()}`);
      console.log(`  Status: ${isOverdue ? 'OVERDUE' : 'Within SLA'}`);

      if (vuln.severity === 'CRITICAL' && isOverdue) {
        // Alert security team
        await this.alertSecurityTeam(vuln);
      }

      if (vuln.patchedVersion) {
        // Create GitHub issue for patching
        await this.createRemediationIssue(vuln);
      }
    }
  }

  private async alertSecurityTeam(vuln: Vulnerability): Promise<void> {
    // Send alert via Slack, email, PagerDuty, etc.
    console.log(`ALERT: Critical vulnerability overdue - ${vuln.id}`);
  }

  private async createRemediationIssue(vuln: Vulnerability): Promise<void> {
    // Create GitHub issue for tracking remediation
    console.log(`Creating remediation issue for ${vuln.package}`);
  }
}
```

---

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] **Infrastructure**
  - [ ] Docker containers run as non-root users
  - [ ] Read-only root filesystems enabled
  - [ ] Security capabilities dropped (cap_drop: ALL)
  - [ ] Container images scanned for vulnerabilities
  - [ ] Network segmentation configured
  - [ ] Firewall rules configured and tested
  - [ ] Secrets managed via Infisical (no .env files in repo)
  - [ ] TLS/SSL certificates configured (Let's Encrypt)

- [ ] **Application**
  - [ ] Input validation on all endpoints (Zod schemas)
  - [ ] SQL queries parameterized (no string concatenation)
  - [ ] XSS protection enabled (CSP headers)
  - [ ] CSRF tokens implemented
  - [ ] Rate limiting configured
  - [ ] Authentication middleware applied
  - [ ] Role-based authorization implemented
  - [ ] Error messages don't leak sensitive info
  - [ ] Logging configured (access logs, audit logs)

- [ ] **MCP Servers**
  - [ ] Authentication tokens configured
  - [ ] Tool authorization (RBAC) implemented
  - [ ] Request validation schemas defined
  - [ ] Rate limiting per tool configured
  - [ ] Audit logging enabled

- [ ] **GPU Workers**
  - [ ] Tailscale VPN configured
  - [ ] SSH hardened (key-based, custom port)
  - [ ] Firewall rules applied
  - [ ] Model access control implemented
  - [ ] Monitoring agents installed

- [ ] **Monitoring & Audit**
  - [ ] Access logging configured
  - [ ] Audit trail database created
  - [ ] Security event alerting set up
  - [ ] Vulnerability scanning automated
  - [ ] Log rotation configured
  - [ ] Backup and retention policies defined

- [ ] **Compliance**
  - [ ] PII encryption at rest and in transit
  - [ ] Data retention policies documented
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] GDPR compliance verified (if applicable)
  - [ ] SOC 2 controls implemented (if applicable)

### Ongoing Security Tasks

- [ ] **Daily**
  - [ ] Review security logs for anomalies
  - [ ] Monitor failed authentication attempts
  - [ ] Check system resource usage

- [ ] **Weekly**
  - [ ] Review vulnerability scan reports
  - [ ] Update dependencies (pnpm update)
  - [ ] Review access logs

- [ ] **Monthly**
  - [ ] Rotate API keys and secrets
  - [ ] Review user permissions
  - [ ] Test backup restoration
  - [ ] Security awareness training

- [ ] **Quarterly**
  - [ ] Penetration testing
  - [ ] Security audit
  - [ ] Update security policies
  - [ ] Review incident response plan

---

## Incident Response

### Incident Response Plan

#### 1. Preparation

- **Incident Response Team**:
  - Incident Commander
  - Security Engineer
  - DevOps Engineer
  - Communications Lead

- **Communication Channels**:
  - Slack: `#security-incidents`
  - Email: `security@nyra.ai`
  - Phone: On-call rotation (PagerDuty)

#### 2. Detection & Analysis

**Common Incident Types**:
- Unauthorized access
- Data breach
- DDoS attack
- Malware infection
- Insider threat

**Detection Methods**:
- Automated alerts (Prometheus, Grafana)
- Log analysis (ELK Stack)
- User reports
- Vulnerability scans

#### 3. Containment

**Immediate Actions**:

```bash
# Isolate compromised system
sudo ufw deny from <attacker_ip>

# Revoke compromised credentials
infisical secrets delete JWT_SECRET
infisical secrets create JWT_SECRET --value "$(openssl rand -base64 64)"

# Stop affected services
docker compose -f docker-compose.orchestration.yml stop <service>

# Capture forensic evidence
sudo tar czf /backups/forensics-$(date +%Y%m%d-%H%M%S).tar.gz /var/log/

# Take database snapshot
pg_dump -h localhost -U postgres nyra > /backups/nyra-forensic-$(date +%Y%m%d).sql
```

#### 4. Eradication

- Remove malware or unauthorized access
- Patch vulnerabilities
- Update compromised credentials
- Apply security patches

#### 5. Recovery

- Restore from clean backups
- Verify system integrity
- Gradually restore services
- Monitor for re-infection

#### 6. Post-Incident Review

- Document timeline of events
- Identify root cause
- Update security controls
- Conduct lessons learned session
- Update incident response plan

### Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Incident Commander | TBD | security@nyra.ai |
| Security Lead | TBD | +1-XXX-XXX-XXXX |
| DevOps Lead | TBD | +1-XXX-XXX-XXXX |
| Legal Counsel | TBD | legal@nyra.ai |

---

## Compliance

### PCI-DSS Requirements (if handling payments)

- [ ] Requirement 1: Install and maintain firewall
- [ ] Requirement 2: Change default passwords
- [ ] Requirement 3: Protect stored cardholder data
- [ ] Requirement 4: Encrypt transmission of cardholder data
- [ ] Requirement 5: Use and update anti-virus software
- [ ] Requirement 6: Develop secure systems and applications
- [ ] Requirement 7: Restrict access to cardholder data
- [ ] Requirement 8: Assign unique ID to each person
- [ ] Requirement 9: Restrict physical access to cardholder data
- [ ] Requirement 10: Track and monitor all access
- [ ] Requirement 11: Regularly test security systems
- [ ] Requirement 12: Maintain information security policy

### GDPR Compliance (if handling EU data)

- [ ] Data mapping and inventory
- [ ] Privacy by design
- [ ] Data protection impact assessments
- [ ] Right to access (data export)
- [ ] Right to erasure (data deletion)
- [ ] Data breach notification (72 hours)
- [ ] Data processing agreements
- [ ] Privacy policy and consent

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI-DSS Standards](https://www.pcisecuritystandards.org/)
- [GDPR Official Text](https://gdpr-info.eu/)

---

## Document Maintenance

- **Next Review Date**: 2026-04-10
- **Review Frequency**: Quarterly
- **Owner**: Security Team
- **Approver**: CISO

---

**Document History**:
- 2026-01-10: Initial version created
- TBD: Next update

---

*This document is confidential and intended for internal use only.*
