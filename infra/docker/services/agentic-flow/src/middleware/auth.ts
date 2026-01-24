/**
 * Authentication Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip auth for health checks
  if (req.path.startsWith('/health')) {
    next();
    return;
  }

  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || apiKey !== config.apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key',
    });
    return;
  }

  next();
}
