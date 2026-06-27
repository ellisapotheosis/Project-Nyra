/**
 * Shared HTTP error classes and Express error-handling middleware.
 *
 * Consolidates the duplicate error infrastructure that previously lived in:
 *   - services/nexus-router/src/middleware/error-handler.ts
 *   - Inline patterns in services/crm-api, ratehunter-api, etc.
 */

/** Base API error with HTTP status code and machine-readable type. */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly type: string = "server_error"
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message, "invalid_request_error");
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message, "authentication_error");
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message, "permission_error");
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, message, "not_found_error");
  }
}

export class RateLimitError extends HttpError {
  constructor(message = "Rate limit exceeded") {
    super(429, message, "rate_limit_error");
  }
}

export class ServerError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, message, "server_error");
  }
}
