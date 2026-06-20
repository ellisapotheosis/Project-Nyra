# Auth Service - Authentication & Authorization Service

## 🎯 SERVICE CONTEXT

**Purpose**: Express.js TypeScript service providing comprehensive authentication, authorization, session management, and security for all Project Nyra applications.

**Port**: 3100
**Language**: TypeScript + Express.js + Passport
**Dependencies**: express, passport, jsonwebtoken, bcrypt, redis, @types/node
**Template**: CLAUDE-MD-TypeScript.md (star topology for centralized auth)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Express Development Pattern
**MANDATORY**: All auth endpoints, middleware, and strategies MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Authentication strategies
  - Write("src/strategies/jwt.strategy.ts", jwtStrategy)
  - Write("src/strategies/local.strategy.ts", localStrategy)
  - Write("src/strategies/google.strategy.ts", googleOAuth)
  - Write("src/strategies/microsoft.strategy.ts", microsoftOAuth)

  // Auth endpoints
  - Write("src/routes/auth.routes.ts", allAuthRoutes)
  - Write("src/routes/mfa.routes.ts", mfaRoutes)
  - Write("src/routes/password.routes.ts", passwordRoutes)

  // Middleware
  - Write("src/middleware/auth.middleware.ts", authMiddleware)
  - Write("src/middleware/rate-limit.middleware.ts", rateLimiting)
  - Write("src/middleware/rbac.middleware.ts", roleBasedAccess)

  // Tests
  - Write("tests/auth.test.ts", authTests)
  - Bash("pnpm test")
```

### Security-First Auth Rules
**CRITICAL**: Every authentication feature MUST enforce security best practices:

- **Password Security**: bcrypt with cost factor 12+, minimum 8 characters
- **JWT Security**: Short-lived access tokens (15min), long-lived refresh tokens (7 days)
- **Session Security**: Secure cookies, HttpOnly, SameSite=Strict
- **Rate Limiting**: Login attempts (5/15min), registration (10/hour), password reset (3/hour)
- **MFA**: TOTP-based two-factor authentication support
- **OAuth 2.0**: Secure OAuth flows for Google, Microsoft
- **Input Validation**: All inputs validated and sanitized
- **HTTPS Only**: Enforce HTTPS in production
- **CORS**: Whitelist allowed origins only

## 📊 AUTH SERVICE ARCHITECTURE

### Authentication Flow
```
Client → Login Request → Credential Validation → Password Hash Check
    ↓
If Valid: Generate JWT Access Token + Refresh Token → Store Session in Redis
    ↓
If MFA Enabled: Send MFA Challenge → Validate TOTP Code → Issue Tokens
    ↓
Return: { accessToken, refreshToken, user, expiresIn }
```

### Authorization Flow
```
Client Request with JWT → Extract Token → Verify Signature → Check Expiration
    ↓
Extract User ID → Load User + Roles from DB → Check Required Permission
    ↓
If Authorized: Proceed to Route Handler
If Unauthorized: Return 403 Forbidden
If Token Expired: Return 401 Unauthorized (client should refresh)
```

### Supported Authentication Methods

**1. Local Authentication (Username/Password)**
- Email + password
- bcrypt password hashing
- Account lockout after failed attempts
- Email verification required

**2. JWT Token Authentication**
- Access tokens (15 min expiry)
- Refresh tokens (7 day expiry)
- Token revocation support
- Rotating refresh tokens

**3. OAuth 2.0**
- Google OAuth 2.0
- Microsoft OAuth 2.0
- Automatic account creation on first login
- Email verification via OAuth provider

**4. Multi-Factor Authentication (MFA)**
- TOTP (Time-based One-Time Password)
- QR code generation for authenticator apps
- Backup codes generation
- MFA enforcement policies

**5. API Key Authentication**
- Service-to-service authentication
- API key generation and management
- Rate limiting per API key
- Key rotation support

## 🐝 AUTH SERVICE SWARM

### Agent Configuration
```yaml
topology: star  # Centralized auth with service spokes
maxAgents: 6
strategy: specialized
language: typescript
framework: express

agents:
  auth_architect:
    role: Authentication Strategy Design
    focus: [passport-strategies, jwt-handling, oauth-flows]
    responsibilities:
      - Design Passport.js strategies
      - Implement JWT generation/validation
      - Configure OAuth 2.0 flows
      - Handle token refresh logic
    concurrent_tasks: [multiple-strategies, parallel-endpoints]

  security_specialist:
    role: Security Hardening
    focus: [password-hashing, rate-limiting, input-validation]
    responsibilities:
      - Implement bcrypt password hashing
      - Configure rate limiting
      - Validate and sanitize inputs
      - Enforce security headers
    concurrent_tasks: [multiple-security-layers, parallel-validation]

  middleware_engineer:
    role: Express Middleware Development
    focus: [auth-middleware, rbac-middleware, error-handling]
    responsibilities:
      - Create authentication middleware
      - Implement RBAC authorization
      - Handle errors gracefully
      - Manage session state
    concurrent_tasks: [multiple-middleware, parallel-validation]

  session_manager:
    role: Session & Token Management
    focus: [redis-sessions, token-refresh, revocation]
    responsibilities:
      - Manage Redis sessions
      - Handle token refresh
      - Implement token revocation
      - Track active sessions
    concurrent_tasks: [multiple-sessions, parallel-operations]

  mfa_specialist:
    role: Multi-Factor Authentication
    focus: [totp-generation, qr-codes, backup-codes]
    responsibilities:
      - Generate TOTP secrets
      - Create QR codes
      - Generate backup codes
      - Validate MFA attempts
    concurrent_tasks: [multiple-mfa-operations, parallel-validation]

  test_engineer:
    role: Security Testing
    focus: [jest, supertest, security-testing]
    responsibilities:
      - Write authentication tests
      - Test authorization flows
      - Security penetration testing
      - Load testing rate limits
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 EXPRESS + TYPESCRIPT PATTERNS

### JWT Authentication Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

interface AuthRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roles: user.roles
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
};

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Load user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account deactivated' });
      return;
    }

    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRole = requiredRoles.some(role => req.user!.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredRoles,
        current: req.user.roles
      });
      return;
    }

    next();
  };
};
```

### Login Endpoint with Rate Limiting
```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.middleware';
import { storeRefreshToken } from '../services/session.service';

const router = express.Router();

// Rate limiting: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, mfaCode } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check account status
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account deactivated' });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ error: 'Email not verified' });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (!passwordValid) {
        // Track failed attempt
        await user.incrementFailedLoginAttempts();

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if MFA is enabled
      if (user.mfaEnabled) {
        if (!mfaCode) {
          return res.status(200).json({
            requiresMFA: true,
            message: 'MFA code required'
          });
        }

        const mfaValid = await user.verifyTOTP(mfaCode);

        if (!mfaValid) {
          return res.status(401).json({ error: 'Invalid MFA code' });
        }
      }

      // Reset failed attempts
      await user.resetFailedLoginAttempts();

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in Redis
      await storeRefreshToken(user.id, refreshToken);

      // Update last login
      await user.updateLastLogin();

      return res.status(200).json({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;
```

### Password Security
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Cost factor (higher = more secure but slower)

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const validatePasswordStrength = (password: string): {
  valid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
```

## 🔒 SECURITY & COMPLIANCE

### Security Headers
```typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet()); // Security headers

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📈 PERFORMANCE TARGETS

### Authentication Performance
- Login endpoint: < 200ms p95 latency
- Token validation: < 10ms p95 latency
- Session lookup (Redis): < 5ms p95 latency
- Password hashing: < 100ms (bcrypt cost 12)

### Security Targets
- Failed login lockout: 5 attempts
- Token refresh window: 7 days
- MFA code validity: 30 seconds (TOTP)
- Rate limit: 5 login attempts per 15 minutes per IP

## 🧪 TESTING REQUIREMENTS

```typescript
import request from 'supertest';
import app from '../app';

describe('Auth Service', () => {
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should enforce rate limiting', async () => {
      // Make 6 rapid login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' });
      }

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(response.status).toBe(429); // Too Many Requests
    });
  });
});
```

---

**This service is the security gateway for all of Project Nyra. Every request flows through authentication. Compromise here compromises the entire platform. Security is non-negotiable.**
