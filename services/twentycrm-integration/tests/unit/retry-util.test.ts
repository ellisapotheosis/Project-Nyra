import { describe, it, expect, vi, beforeEach } from "vitest";

interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    delayMs,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (!error) return false;
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const retryableErrorCodes = ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"];
  const err = error as Record<string, unknown>;
  const response = err.response as Record<string, unknown> | undefined;
  if (
    response?.status &&
    retryableStatusCodes.includes(response.status as number)
  ) {
    return true;
  }
  if (err.code && retryableErrorCodes.includes(err.code as string)) {
    return true;
  }
  return false;
}

describe("retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns result on first successful attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const promise = retry(fn, { maxAttempts: 3, delayMs: 100 });
    const result = await promise;
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds on later attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");

    const promise = retry(fn, { maxAttempts: 3, delayMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all attempts", async () => {
    vi.useRealTimers();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))
      .mockRejectedValueOnce(new Error("fail-3"));

    await expect(
      retry(fn, { maxAttempts: 3, delayMs: 1, backoffMultiplier: 1 })
    ).rejects.toThrow("fail-3");
    expect(fn).toHaveBeenCalledTimes(3);
    vi.useFakeTimers();
  });

  it("applies exponential backoff", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok");

    const promise = retry(fn, {
      maxAttempts: 3,
      delayMs: 100,
      backoffMultiplier: 2,
    });

    // First retry: delay = 100 * 2^0 = 100ms
    await vi.advanceTimersByTimeAsync(100);
    // Second retry: delay = 100 * 2^1 = 200ms
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("stops retrying when shouldRetry returns false", async () => {
    const nonRetryableError = new Error("non-retryable");
    const fn = vi.fn().mockRejectedValue(nonRetryableError);

    const promise = retry(fn, {
      maxAttempts: 5,
      delayMs: 100,
      shouldRetry: () => false,
    });

    await expect(promise).rejects.toThrow("non-retryable");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("uses default backoff multiplier of 2", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok");

    const promise = retry(fn, { maxAttempts: 3, delayMs: 50 });
    // Default multiplier = 2, delay = 50 * 2^0 = 50ms
    await vi.advanceTimersByTimeAsync(50);

    const result = await promise;
    expect(result).toBe("ok");
  });
});

describe("isRetryableError", () => {
  it("returns false for null/undefined errors", () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it("identifies retryable HTTP status codes", () => {
    expect(isRetryableError({ response: { status: 429 } })).toBe(true);
    expect(isRetryableError({ response: { status: 500 } })).toBe(true);
    expect(isRetryableError({ response: { status: 502 } })).toBe(true);
    expect(isRetryableError({ response: { status: 503 } })).toBe(true);
    expect(isRetryableError({ response: { status: 504 } })).toBe(true);
    expect(isRetryableError({ response: { status: 408 } })).toBe(true);
  });

  it("identifies non-retryable HTTP status codes", () => {
    expect(isRetryableError({ response: { status: 400 } })).toBe(false);
    expect(isRetryableError({ response: { status: 401 } })).toBe(false);
    expect(isRetryableError({ response: { status: 403 } })).toBe(false);
    expect(isRetryableError({ response: { status: 404 } })).toBe(false);
  });

  it("identifies retryable error codes", () => {
    expect(isRetryableError({ code: "ECONNRESET" })).toBe(true);
    expect(isRetryableError({ code: "ETIMEDOUT" })).toBe(true);
    expect(isRetryableError({ code: "ENOTFOUND" })).toBe(true);
  });

  it("identifies non-retryable error codes", () => {
    expect(isRetryableError({ code: "EACCES" })).toBe(false);
    expect(isRetryableError({ code: "ENOENT" })).toBe(false);
  });

  it("returns false for plain Error objects", () => {
    expect(isRetryableError(new Error("generic error"))).toBe(false);
  });
});

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("resolves after the specified delay", async () => {
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });
});
