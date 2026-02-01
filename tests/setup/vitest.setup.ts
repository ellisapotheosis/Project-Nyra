/**
 * Vitest Global Setup
 *
 * TDD London School (Mockist) approach:
 * - Focus on testing behavior and interactions
 * - Heavy use of mocks and stubs
 * - Outside-in testing philosophy
 */

import { beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase } from '../utils/database';
import { setupTestMemory } from '../utils/memory';
import { setupTestMCP } from '../utils/mcp';

// Global test configuration
beforeEach(async () => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  vi.restoreAllMocks();

  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});

afterEach(async () => {
  // Cleanup after each test
  vi.clearAllTimers();
  vi.useRealTimers();
});

// Database setup/teardown
export const setupDatabase = async () => {
  return await setupTestDatabase();
};

// Memory system setup
export const setupMemory = async () => {
  return await setupTestMemory();
};

// MCP server setup
export const setupMCP = async () => {
  return await setupTestMCP();
};

// Global test utilities
global.testTimeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
