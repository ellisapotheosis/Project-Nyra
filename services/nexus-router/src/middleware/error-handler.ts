/**
 * Express error-handling middleware for Nexus Router.
 *
 * Re-exports shared error classes and middleware from @nyra/shared so existing
 * imports continue to work.
 */
export {
  HttpError as ApiError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
  ServerError,
  errorHandler,
  asyncHandler,
} from "@nyra/shared";
