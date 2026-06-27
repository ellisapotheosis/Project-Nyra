/**
 * Shared API response types used across Nyra services.
 *
 * Consolidates the duplicate ApiResponse / PaginationParams / PaginatedResponse
 * definitions that previously lived in:
 *   - services/ratehunter-api/src/types/index.ts
 *   - services/mortgage-assistant-api/src/types/index.ts
 */

/** Standard envelope for all JSON API responses. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/** Query parameters for paginated list endpoints. */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Paginated response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Build an {@link ApiResponse} with the current timestamp. */
export function apiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(message !== undefined && { message }),
    ...(error !== undefined && { error }),
    timestamp: new Date().toISOString(),
  };
}

/** Shorthand for a successful API response. */
export function apiSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return apiResponse(true, data, message);
}

/** Shorthand for a failed API response. */
export function apiError(error: string, message?: string): ApiResponse<never> {
  return apiResponse(false, undefined, message, error);
}
