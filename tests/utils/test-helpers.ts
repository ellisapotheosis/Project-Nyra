/**
 * Test Helper Utilities
 * Common utilities for all test types
 */

/**
 * Wait for condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

/**
 * Generate random phone number
 */
export function randomPhone(): string {
  return `555-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Create mock Express request
 */
export function createMockRequest(overrides: any = {}): any {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    method: 'GET',
    url: '/',
    path: '/',
    ...overrides,
  };
}

/**
 * Create mock Express response
 */
export function createMockResponse(): any {
  const res: any = {
    statusCode: 200,
    headers: {},
  };

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockImplementation((key, value) => {
    res.headers[key] = value;
    return res;
  });
  res.getHeader = jest.fn().mockImplementation((key) => res.headers[key]);

  return res;
}

/**
 * Create mock Next.js context
 */
export function createMockNextContext(overrides: any = {}): any {
  return {
    req: createMockRequest(overrides.req),
    res: createMockResponse(),
    query: {},
    params: {},
    ...overrides,
  };
}

/**
 * Suppress console output during test
 */
export function suppressConsole(): () => void {
  const originalConsole = { ...console };

  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  return () => {
    global.console = originalConsole;
  };
}

/**
 * Measure async function execution time
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  return { result, duration };
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < retries - 1) {
        await sleep(Math.min(delay, maxDelay));
        delay *= factor;
      }
    }
  }

  throw lastError;
}

/**
 * Create timestamp in ISO format
 */
export function createTimestamp(offsetMs: number = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Assert array contains object matching properties
 */
export function assertArrayContains(
  array: any[],
  expected: Record<string, any>
): boolean {
  return array.some(item =>
    Object.keys(expected).every(key => item[key] === expected[key])
  );
}

/**
 * Create UUID v4
 */
export function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Mock Date.now()
 */
export function mockDateNow(timestamp: number): () => void {
  const originalNow = Date.now;
  Date.now = jest.fn(() => timestamp);

  return () => {
    Date.now = originalNow;
  };
}

/**
 * Create test JWT token
 */
export function createTestJwt(payload: any = {}): string {
  // Simple mock JWT - not cryptographically secure
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({
    sub: '1234567890',
    name: 'Test User',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  })).toString('base64');
  const signature = 'test-signature';

  return `${header}.${body}.${signature}`;
}
