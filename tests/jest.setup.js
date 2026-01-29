/**
 * Jest Setup File
 * Global test setup and configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.CLAUDE_FLOW_ENV = 'test';

// Mock environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/nyra_test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.API_BASE_URL = 'http://localhost:3000';

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithMatch(received, ...expected) {
    const calls = received.mock.calls;
    const pass = calls.some(call =>
      expected.every((expectedArg, index) => {
        if (typeof expectedArg === 'object' && expectedArg !== null) {
          return Object.keys(expectedArg).every(
            key => call[index] && call[index][key] === expectedArg[key]
          );
        }
        return call[index] === expectedArg;
      })
    );

    return {
      pass,
      message: () =>
        pass
          ? `expected function not to have been called with matching arguments`
          : `expected function to have been called with matching arguments`,
    };
  },
});

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
});

global.createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

// Suppress console output during tests (except errors)
const originalConsole = { ...console };
global.originalConsole = originalConsole;

if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error,
    debug: jest.fn(),
  };
}

// Clean up after all tests
afterAll(() => {
  // Restore console
  if (!process.env.DEBUG_TESTS) {
    global.console = originalConsole;
  }
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  if (process.env.DEBUG_TESTS) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});

// Increase timeout for slow tests
jest.setTimeout(10000);
