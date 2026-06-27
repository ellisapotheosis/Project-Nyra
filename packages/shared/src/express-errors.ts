/**
 * Express-specific error-handling middleware and async handler wrapper.
 *
 * Separated from errors.ts so that non-Express consumers (Next.js, scripts)
 * can import the error classes without pulling in Express types.
 */

import type { Request, Response, NextFunction } from "express";
import { HttpError } from "./errors.js";

/**
 * Express error-handling middleware.
 * Catches any thrown {@link HttpError} (or plain Error) and returns a
 * structured JSON error response.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const type = error instanceof HttpError ? error.type : "server_error";

  res.status(statusCode).json({
    error: {
      message: error.message || "An unexpected error occurred",
      type,
      code: statusCode,
    },
  });
}

/**
 * Wraps an async Express route handler so rejected promises are forwarded
 * to the Express error pipeline via `next(err)`.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
