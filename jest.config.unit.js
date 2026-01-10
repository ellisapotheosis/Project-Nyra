/**
 * Jest Configuration for Unit Tests
 * Fast, isolated tests for individual functions and components
 */

module.exports = {
  displayName: 'unit',
  testEnvironment: 'node',

  // Match only unit test files
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/apps/**/tests/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/services/**/tests/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/packages/**/tests/**/*.test.{ts,tsx,js,jsx}',
  ],

  // Module resolution
  moduleNameMapper: {
    '^@nyra/(.*)$': '<rootDir>/packages/$1/src',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

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
    '**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/tests/**',
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/',
    '/tests/',
  ],

  // Fast timeouts for unit tests
  testTimeout: 5000,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/',
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
