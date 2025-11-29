#!/usr/bin/env node
/**
 * Security Manager for Nyra Distributed GPU Compute
 * Implements zero-trust security, access control, and audit logging
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

class SecurityManager {
  constructor() {
    this.secretsPath = path.join(__dirname, '../../../data/secrets');
    this.auditLogPath = path.join(__dirname, '../../../logs/security-audit.log');
    this.accessPolicies = new Map();
    this.activeSessions = new Map();
    this.rateLimiters = new Map();
    this.init();
  }

  async init() {
    await this.ensureDirectories();
    await this.loadAccessPolicies();
    await this.setupRateLimiters();
    this.setupSecurityHeaders();
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      this.secretsPath,
      path.dirname(this.auditLogPath)
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error.message);
      }
    }
  }

  /**
   * Generate API keys for services
   */
  async generateAPIKey(serviceName, permissions = []) {
    const keyId = uuidv4();
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyInfo = {
      keyId,
      serviceName,
      permissions,
      hashedKey,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      isActive: true
    };

    // Store hashed version
    await this.storeAPIKey(keyInfo);

    // Audit log
    await this.auditLog('API_KEY_GENERATED', {
      keyId,
      serviceName,
      permissions
    });

    return {
      keyId,
      apiKey: `nyra_${keyId}_${apiKey}`,
      serviceName,
      permissions
    };
  }

  /**
   * Validate API key
   */
  async validateAPIKey(apiKey) {
    try {
      // Parse API key format: nyra_{keyId}_{key}
      const parts = apiKey.split('_');
      if (parts.length !== 3 || parts[0] !== 'nyra') {
        return { valid: false, reason: 'Invalid key format' };
      }

      const [, keyId, key] = parts;
      const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

      const keyInfo = await this.getAPIKey(keyId);
      if (!keyInfo) {
        return { valid: false, reason: 'Key not found' };
      }

      if (!keyInfo.isActive) {
        return { valid: false, reason: 'Key deactivated' };
      }

      if (keyInfo.hashedKey !== hashedKey) {
        return { valid: false, reason: 'Invalid key' };
      }

      // Update usage stats
      keyInfo.lastUsed = new Date();
      keyInfo.usageCount++;
      await this.updateAPIKey(keyInfo);

      return {
        valid: true,
        keyId,
        serviceName: keyInfo.serviceName,
        permissions: keyInfo.permissions
      };
    } catch (error) {
      await this.auditLog('API_KEY_VALIDATION_ERROR', { error: error.message });
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Create JWT token for authenticated sessions
   */
  async createSessionToken(keyId, serviceName, permissions) {
    const sessionId = uuidv4();
    const secretKey = await this.getJWTSecret();

    const payload = {
      sessionId,
      keyId,
      serviceName,
      permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    const token = jwt.sign(payload, secretKey);

    // Store session
    this.activeSessions.set(sessionId, {
      keyId,
      serviceName,
      permissions,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    await this.auditLog('SESSION_CREATED', {
      sessionId,
      keyId,
      serviceName
    });

    return token;
  }

  /**
   * Verify JWT token
   */
  async verifySessionToken(token) {
    try {
      const secretKey = await this.getJWTSecret();
      const decoded = jwt.verify(token, secretKey);

      const session = this.activeSessions.get(decoded.sessionId);
      if (!session) {
        return { valid: false, reason: 'Session not found' };
      }

      // Update last activity
      session.lastActivity = new Date();

      return {
        valid: true,
        sessionId: decoded.sessionId,
        keyId: decoded.keyId,
        serviceName: decoded.serviceName,
        permissions: decoded.permissions
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Check access permissions
   */
  checkPermission(userPermissions, requiredPermission) {
    return userPermissions.includes('admin') ||
           userPermissions.includes(requiredPermission) ||
           userPermissions.includes('*');
  }

  /**
   * Express middleware for API authentication
   */
  createAuthMiddleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'No authorization header' });
        }

        let authResult;

        if (authHeader.startsWith('Bearer ')) {
          // JWT token authentication
          const token = authHeader.substring(7);
          authResult = await this.verifySessionToken(token);
        } else if (authHeader.startsWith('ApiKey ')) {
          // API key authentication
          const apiKey = authHeader.substring(7);
          authResult = await this.validateAPIKey(apiKey);
        } else {
          return res.status(401).json({ error: 'Invalid authorization format' });
        }

        if (!authResult.valid) {
          await this.auditLog('AUTH_FAILED', {
            reason: authResult.reason,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          return res.status(401).json({ error: authResult.reason });
        }

        // Attach auth info to request
        req.auth = authResult;

        // Audit successful authentication
        await this.auditLog('AUTH_SUCCESS', {
          serviceName: authResult.serviceName,
          ip: req.ip,
          endpoint: req.path
        });

        next();
      } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  /**
   * Express middleware for permission checking
   */
  createPermissionMiddleware(requiredPermission) {
    return (req, res, next) => {
      if (!req.auth) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!this.checkPermission(req.auth.permissions, requiredPermission)) {
        this.auditLog('PERMISSION_DENIED', {
          serviceName: req.auth.serviceName,
          requiredPermission,
          userPermissions: req.auth.permissions,
          endpoint: req.path
        });

        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermission,
          granted: req.auth.permissions
        });
      }

      next();
    };
  }

  /**
   * Setup rate limiting
   */
  async setupRateLimiters() {
    // API rate limiter
    this.rateLimiters.set('api', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
      handler: async (req, res) => {
        await this.auditLog('RATE_LIMIT_EXCEEDED', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path
        });
        res.status(429).json({ error: 'Rate limit exceeded' });
      }
    }));

    // GPU compute rate limiter (stricter)
    this.rateLimiters.set('gpu', rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // Limit GPU requests
      message: 'GPU compute rate limit exceeded',
      keyGenerator: (req) => {
        return req.auth?.serviceName || req.ip;
      }
    }));

    // Authentication rate limiter (very strict)
    this.rateLimiters.set('auth', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // Only 20 auth attempts per IP
      message: 'Too many authentication attempts'
    }));
  }

  /**
   * Setup security headers
   */
  setupSecurityHeaders() {
    this.helmetConfig = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "https://api.cloudflare.com"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Network access control
   */
  createNetworkACL() {
    const allowedNetworks = [
      '192.168.1.0/24',  // Internal network
      '10.0.0.0/8',      // Private networks
      '172.16.0.0/12'    // Private networks
    ];

    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      // Allow localhost and internal networks
      if (clientIP === '127.0.0.1' || clientIP === '::1') {
        return next();
      }

      // Check if IP is in allowed networks
      const isAllowed = allowedNetworks.some(network => {
        return this.ipInSubnet(clientIP, network);
      });

      if (!isAllowed) {
        this.auditLog('NETWORK_ACCESS_DENIED', {
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          endpoint: req.path
        });

        return res.status(403).json({ error: 'Network access denied' });
      }

      next();
    };
  }

  /**
   * Check if IP is in subnet
   */
  ipInSubnet(ip, subnet) {
    const [subnetIP, prefixLength] = subnet.split('/');
    const subnetMask = (0xFFFFFFFF << (32 - parseInt(prefixLength))) >>> 0;

    const ipInt = this.ipToInt(ip);
    const subnetInt = this.ipToInt(subnetIP);

    return (ipInt & subnetMask) === (subnetInt & subnetMask);
  }

  /**
   * Convert IP string to integer
   */
  ipToInt(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Audit logging
   */
  async auditLog(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      pid: process.pid
    };

    try {
      await fs.appendFile(this.auditLogPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Store API key information
   */
  async storeAPIKey(keyInfo) {
    const filePath = path.join(this.secretsPath, `${keyInfo.keyId}.json`);
    await fs.writeFile(filePath, JSON.stringify(keyInfo, null, 2));
  }

  /**
   * Get API key information
   */
  async getAPIKey(keyId) {
    try {
      const filePath = path.join(this.secretsPath, `${keyId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update API key information
   */
  async updateAPIKey(keyInfo) {
    await this.storeAPIKey(keyInfo);
  }

  /**
   * Get or generate JWT secret
   */
  async getJWTSecret() {
    const secretPath = path.join(this.secretsPath, 'jwt-secret.txt');

    try {
      return await fs.readFile(secretPath, 'utf-8');
    } catch (error) {
      // Generate new secret
      const secret = crypto.randomBytes(64).toString('hex');
      await fs.writeFile(secretPath, secret);
      return secret;
    }
  }

  /**
   * Load access policies from file
   */
  async loadAccessPolicies() {
    const policiesPath = path.join(__dirname, '../../../config/access-policies.json');

    try {
      const data = await fs.readFile(policiesPath, 'utf-8');
      const policies = JSON.parse(data);

      for (const [service, policy] of Object.entries(policies)) {
        this.accessPolicies.set(service, policy);
      }
    } catch (error) {
      // Create default policies
      await this.createDefaultPolicies();
    }
  }

  /**
   * Create default access policies
   */
  async createDefaultPolicies() {
    const defaultPolicies = {
      'orchestrator': {
        permissions: ['admin', 'coordination', 'task-distribution', 'monitoring'],
        rateLimit: 'api',
        networkAccess: 'internal'
      },
      'worker': {
        permissions: ['compute', 'health', 'metrics'],
        rateLimit: 'gpu',
        networkAccess: 'internal'
      },
      'external': {
        permissions: ['health', 'status'],
        rateLimit: 'auth',
        networkAccess: 'external'
      }
    };

    const policiesPath = path.join(__dirname, '../../../config/access-policies.json');
    await fs.writeFile(policiesPath, JSON.stringify(defaultPolicies, null, 2));

    for (const [service, policy] of Object.entries(defaultPolicies)) {
      this.accessPolicies.set(service, policy);
    }
  }

  /**
   * Get security middleware stack
   */
  getMiddlewareStack(options = {}) {
    const {
      enableNetworkACL = true,
      rateLimitType = 'api',
      requireAuth = true,
      requiredPermission = null
    } = options;

    const middleware = [];

    // Security headers
    middleware.push(this.helmetConfig);

    // Network ACL
    if (enableNetworkACL) {
      middleware.push(this.createNetworkACL());
    }

    // Rate limiting
    if (this.rateLimiters.has(rateLimitType)) {
      middleware.push(this.rateLimiters.get(rateLimitType));
    }

    // Authentication
    if (requireAuth) {
      middleware.push(this.createAuthMiddleware());
    }

    // Permission checking
    if (requiredPermission) {
      middleware.push(this.createPermissionMiddleware(requiredPermission));
    }

    return middleware;
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      activeSessions: this.activeSessions.size,
      loadedPolicies: this.accessPolicies.size,
      rateLimiters: Array.from(this.rateLimiters.keys()),
      auditLogPath: this.auditLogPath,
      lastAuditEntry: new Date() // This would be the actual last entry in production
    };
  }
}

module.exports = SecurityManager;

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const securityManager = new SecurityManager();

  (async () => {
    try {
      switch (command) {
        case 'generate-key':
          const serviceName = process.argv[3];
          const permissions = process.argv.slice(4);

          if (!serviceName) {
            console.error('Usage: node security-manager.js generate-key <service-name> [permissions...]');
            process.exit(1);
          }

          const keyInfo = await securityManager.generateAPIKey(serviceName, permissions);
          console.log('Generated API Key:');
          console.log(JSON.stringify(keyInfo, null, 2));
          break;

        case 'status':
          const status = securityManager.getSecurityStatus();
          console.log(JSON.stringify(status, null, 2));
          break;

        default:
          console.log(`
Usage: node security-manager.js <command>

Commands:
  generate-key <service> [permissions...] - Generate new API key
  status                                  - Show security status
          `);
      }
    } catch (error) {
      console.error('Command failed:', error.message);
      process.exit(1);
    }
  })();
}