import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { SecurityConfigService } from '../services/security-config';
import { createLogger } from '../utils/logger';
import { UnauthorizedError } from './error-handler';
import { JWTPayload, TokenValidationResult } from '../types/security';

const logger = createLogger('oauth2-middleware');

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      userId?: string;
      userGroups?: string[];
      userPermissions?: string[];
    }
  }
}

/**
 * OAuth2 Middleware
 * Validates JWT tokens using JWKS endpoint
 * Implements zero-trust verification
 */
export class OAuth2Middleware {
  private static jwksClients: Map<string, jwksClient.JwksClient> = new Map();
  private securityConfig: SecurityConfigService;

  constructor() {
    this.securityConfig = SecurityConfigService.getInstance();
  }

  /**
   * Main authentication middleware
   * Validates JWT token and populates req.user
   */
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get OAuth2 config
      const config = await this.securityConfig.getOAuth2Config();

      // If OAuth2 disabled, skip authentication
      if (!config.enabled) {
        return next();
      }

      // Extract token from Authorization header
      const token = this.extractToken(req);
      if (!token) {
        throw new UnauthorizedError('No authentication token provided');
      }

      // Validate token
      const validation = await this.validateToken(token, config);
      if (!validation.valid) {
        logger.warn('Token validation failed', {
          reason: validation.reason,
          error: validation.error,
        });
        throw new UnauthorizedError(
          validation.reason || 'Invalid authentication token'
        );
      }

      // Populate request with user context
      req.user = validation.payload!;
      req.userId = validation.payload!.sub;
      req.userGroups = validation.payload!.groups || [];
      req.userPermissions = validation.payload!.permissions || [];

      logger.debug('Token validated successfully', {
        userId: req.userId,
        groups: req.userGroups,
      });

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        logger.error('Authentication error:', error);
        next(new UnauthorizedError('Authentication failed'));
      }
    }
  };

  /**
   * Optional authentication middleware
   * Validates token if present, but allows unauthenticated requests
   */
  optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const config = await this.securityConfig.getOAuth2Config();
      if (!config.enabled) {
        return next();
      }

      const token = this.extractToken(req);
      if (!token) {
        return next(); // No token, continue as unauthenticated
      }

      const validation = await this.validateToken(token, config);
      if (validation.valid) {
        req.user = validation.payload!;
        req.userId = validation.payload!.sub;
        req.userGroups = validation.payload!.groups || [];
        req.userPermissions = validation.payload!.permissions || [];
      }

      next();
    } catch (error) {
      logger.warn('Optional authentication failed:', error);
      next(); // Continue even if validation fails
    }
  };

  /**
   * Require specific groups middleware
   */
  requireGroups = (requiredGroups: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.userGroups || req.userGroups.length === 0) {
        return next(
          new UnauthorizedError('Authentication required to access this resource')
        );
      }

      const hasRequiredGroup = requiredGroups.some((group) =>
        req.userGroups!.includes(group)
      );

      if (!hasRequiredGroup) {
        return next(
          new UnauthorizedError(
            `Access denied. Required groups: ${requiredGroups.join(', ')}`
          )
        );
      }

      next();
    };
  };

  /**
   * Require specific permissions middleware
   */
  requirePermissions = (requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.userPermissions || req.userPermissions.length === 0) {
        return next(
          new UnauthorizedError('Insufficient permissions to access this resource')
        );
      }

      const hasAllPermissions = requiredPermissions.every((perm) =>
        req.userPermissions!.includes(perm)
      );

      if (!hasAllPermissions) {
        return next(
          new UnauthorizedError(
            `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
          )
        );
      }

      next();
    };
  };

  // ============================================================================
  // Token Validation Methods
  // ============================================================================

  /**
   * Extract JWT token from Authorization header
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    // Support both "Bearer <token>" and just "<token>"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    if (parts.length === 1) {
      return parts[0];
    }

    return null;
  }

  /**
   * Validate JWT token using JWKS
   */
  async validateToken(
    token: string,
    config: any
  ): Promise<TokenValidationResult> {
    try {
      // If token validation disabled, decode without verification
      if (!config.tokenValidation) {
        const decoded = jwt.decode(token) as JWTPayload;
        if (!decoded) {
          return {
            valid: false,
            error: 'Failed to decode token',
          };
        }
        return {
          valid: true,
          payload: decoded,
        };
      }

      // Validate using JWKS
      if (config.jwksEndpoint) {
        return await this.validateWithJWKS(token, config);
      }

      // If no JWKS configured, fail validation
      return {
        valid: false,
        reason: 'Token validation enabled but no JWKS endpoint configured',
      };
    } catch (error) {
      logger.error('Token validation error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }

  /**
   * Validate token using JWKS endpoint
   */
  private async validateWithJWKS(
    token: string,
    config: any
  ): Promise<TokenValidationResult> {
    try {
      // Get or create JWKS client
      const client = this.getJWKSClient(config.jwksEndpoint, config);

      // Get signing key
      const getKey = (header: any, callback: jwt.SigningKeyCallback) => {
        client.getSigningKey(header.kid, (err, key) => {
          if (err) {
            return callback(err);
          }
          const signingKey = key?.getPublicKey();
          callback(null, signingKey);
        });
      };

      // Verify token
      return new Promise((resolve) => {
        jwt.verify(
          token,
          getKey,
          {
            algorithms: config.algorithms || ['RS256'],
            issuer: config.expectedIssuer,
            audience: config.expectedAudience,
            clockTolerance: config.clockTolerance || 60,
          },
          (err, decoded) => {
            if (err) {
              logger.warn('JWT verification failed:', err.message);
              resolve({
                valid: false,
                error: err.message,
                reason: this.mapJWTError(err),
              });
            } else {
              resolve({
                valid: true,
                payload: decoded as JWTPayload,
              });
            }
          }
        );
      });
    } catch (error) {
      logger.error('JWKS validation error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'JWKS validation failed',
      };
    }
  }

  /**
   * Get or create JWKS client for endpoint
   */
  private getJWKSClient(
    jwksUri: string,
    config: any
  ): jwksClient.JwksClient {
    if (OAuth2Middleware.jwksClients.has(jwksUri)) {
      return OAuth2Middleware.jwksClients.get(jwksUri)!;
    }

    const client = jwksClient({
      jwksUri,
      cache: config.cacheJwks !== false,
      cacheMaxAge: config.jwksCacheTtl || 3600000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    OAuth2Middleware.jwksClients.set(jwksUri, client);
    return client;
  }

  /**
   * Map JWT errors to user-friendly messages
   */
  private mapJWTError(error: jwt.VerifyErrors): string {
    if (error.name === 'TokenExpiredError') {
      return 'Token has expired';
    }
    if (error.name === 'JsonWebTokenError') {
      return 'Invalid token format';
    }
    if (error.name === 'NotBeforeError') {
      return 'Token not yet valid';
    }
    return 'Token validation failed';
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Clear JWKS cache
   */
  static clearJWKSCache(): void {
    OAuth2Middleware.jwksClients.clear();
    logger.info('JWKS cache cleared');
  }

  /**
   * Test token validation without middleware
   */
  async testTokenValidation(token: string): Promise<TokenValidationResult> {
    const config = await this.securityConfig.getOAuth2Config();
    return this.validateToken(token, config);
  }
}

// Export singleton instance
export const oauth2Middleware = new OAuth2Middleware();

// Export middleware functions
export const authenticate = oauth2Middleware.authenticate;
export const optionalAuthenticate = oauth2Middleware.optionalAuthenticate;
export const requireGroups = oauth2Middleware.requireGroups;
export const requirePermissions = oauth2Middleware.requirePermissions;
