/**
 * Jest Configuration for Integration Tests
 * Tests for service interactions and API endpoints
 */

export default {
  displayName: 'integration',
  testEnvironment: 'node',

  // Match only integration test files
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/tests/integration/**/*.spec.{ts,tsx,js,jsx}',
  ],

  // Module resolution
  moduleNameMapper: {
    '^@nyra/(.*)$': '<rootDir>/packages/$1/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest.setup.js',
    '<rootDir>/tests/integration/setup.ts',
  ],

  // Transform settings
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Coverage
  collectCoverageFrom: [
    'services/**/*.{ts,tsx,js,jsx}',
    'apps/**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/tests/**',
  ],

  // Longer timeouts for integration tests
  testTimeout: 30000,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],

  // Run tests serially to avoid port conflicts
  maxWorkers: 1,

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/integration/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/global-teardown.ts',
};
