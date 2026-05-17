import { logger } from './logger.util';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    delayMs,
    backoffMultiplier = 2,
    shouldRetry = () => true
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : String(error)
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (e.g., network errors, rate limits)
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const retryableErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];

  if (error.response?.status && retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  if (error.code && retryableErrorCodes.includes(error.code)) {
    return true;
  }

  return false;
}
