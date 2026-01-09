import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('error-handler');

export interface ApiError extends Error {
  statusCode?: number;
  type?: string;
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Request error:', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Determine error type
  let errorType = error.type || 'server_error';
  if (statusCode === 400) errorType = 'invalid_request_error';
  if (statusCode === 401) errorType = 'authentication_error';
  if (statusCode === 403) errorType = 'permission_error';
  if (statusCode === 404) errorType = 'not_found_error';
  if (statusCode === 429) errorType = 'rate_limit_error';

  // Send error response in OpenAI-compatible format
  res.status(statusCode).json({
    error: {
      message: error.message || 'An unexpected error occurred',
      type: errorType,
      code: statusCode,
    },
  });
}

// Custom error classes
export class BadRequestError extends Error implements ApiError {
  statusCode = 400;
  type = 'invalid_request_error';

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error implements ApiError {
  statusCode = 401;
  type = 'authentication_error';

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  type = 'not_found_error';

  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends Error implements ApiError {
  statusCode = 429;
  type = 'rate_limit_error';

  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ServerError extends Error implements ApiError {
  statusCode = 500;
  type = 'server_error';

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
