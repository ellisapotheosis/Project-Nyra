/**
 * Rate Limiting Middleware
 * Prevents abuse and DoS attacks
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createLogger } from '../utils/logger';

const logger = createLogger('RateLimiter');

export interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  // Standard rate limit: 100 requests per 15 minutes
  static standard(config?: RateLimitConfig) {
    return rateLimit({
      windowMs: config?.windowMs || 15 * 60 * 1000,
      max: config?.maxRequests || 100,
      message: config?.message || 'Too many requests, please try again later',
      skipSuccessfulRequests: config?.skipSuccessfulRequests || false,
      skipFailedRequests: config?.skipFailedRequests || false,
      handler: (req: Request, res: Response) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          method: req.method,
        });
        res.status(429).json({
          error: 'Too many requests',
          message: config?.message || 'Please try again later',
          retryAfter: Math.ceil((config?.windowMs || 15 * 60 * 1000) / 1000),
        });
      },
    });
  }

  // Strict rate limit for authentication endpoints: 5 requests per 15 minutes
  static auth(config?: RateLimitConfig) {
    return rateLimit({
      windowMs: config?.windowMs || 15 * 60 * 1000,
      max: config?.maxRequests || 5,
      message: config?.message || 'Too many authentication attempts',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      handler: (req: Request, res: Response) => {
        logger.warn('Auth rate limit exceeded', {
          ip: req.ip,
          path: req.path,
        });
        res.status(429).json({
          error: 'Too many authentication attempts',
          message: 'Account temporarily locked. Please try again in 15 minutes.',
          retryAfter: Math.ceil((config?.windowMs || 15 * 60 * 1000) / 1000),
        });
      },
    });
  }

  // API rate limit: 1000 requests per hour
  static api(config?: RateLimitConfig) {
    return rateLimit({
      windowMs: config?.windowMs || 60 * 60 * 1000,
      max: config?.maxRequests || 1000,
      message: config?.message || 'API rate limit exceeded',
      skipSuccessfulRequests: config?.skipSuccessfulRequests || false,
      handler: (req: Request, res: Response) => {
        logger.warn('API rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          userId: (req as any).user?.id,
        });
        res.status(429).json({
          error: 'API rate limit exceeded',
          message: 'You have exceeded your API quota',
          retryAfter: Math.ceil((config?.windowMs || 60 * 60 * 1000) / 1000),
        });
      },
    });
  }

  // Custom rate limiter with per-user limits
  static perUser(config?: RateLimitConfig & { keyGenerator?: (req: Request) => string }) {
    return rateLimit({
      windowMs: config?.windowMs || 15 * 60 * 1000,
      max: config?.maxRequests || 100,
      keyGenerator: config?.keyGenerator || ((req: Request) => {
        // Use user ID if authenticated, otherwise fall back to IP
        const user = (req as any).user;
        return user?.id || req.ip || 'anonymous';
      }),
      handler: (req: Request, res: Response) => {
        logger.warn('Per-user rate limit exceeded', {
          ip: req.ip,
          userId: (req as any).user?.id,
          path: req.path,
        });
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have made too many requests',
          retryAfter: Math.ceil((config?.windowMs || 15 * 60 * 1000) / 1000),
        });
      },
    });
  }

  // Mortgage-specific: Protect quote generation endpoint
  static quoteGeneration() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 quotes per hour
      keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user?.id || req.ip || 'anonymous';
      },
      handler: (req: Request, res: Response) => {
        logger.warn('Quote generation rate limit exceeded', {
          userId: (req as any).user?.id,
          ip: req.ip,
        });
        res.status(429).json({
          error: 'Quote limit exceeded',
          message: 'You have requested too many quotes. Please try again in 1 hour.',
          retryAfter: 3600,
        });
      },
    });
  }

  // Mortgage-specific: Protect document upload
  static documentUpload() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 uploads per 15 minutes
      keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user?.id || req.ip || 'anonymous';
      },
      handler: (req: Request, res: Response) => {
        logger.warn('Document upload rate limit exceeded', {
          userId: (req as any).user?.id,
          ip: req.ip,
        });
        res.status(429).json({
          error: 'Upload limit exceeded',
          message: 'Too many document uploads. Please try again later.',
          retryAfter: 900,
        });
      },
    });
  }
}
