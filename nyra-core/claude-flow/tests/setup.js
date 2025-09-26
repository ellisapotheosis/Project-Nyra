/**
 * Jest Test Setup
 * Global test configuration and setup
 */

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.MCP_LOG_LEVEL = 'error';
process.env.MCP_CONSOLE_LOGGING = 'false';
process.env.MCP_FILE_LOGGING = 'false';

// Mock timers for deterministic testing
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
});