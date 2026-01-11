/**
 * Integration Test Setup
 * Configuration for integration tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Test database and services
let testDb: any;
let testRedis: any;
let testServers: any[] = [];

/**
 * Setup before all integration tests
 */
beforeAll(async () => {
  console.log('Setting up integration test environment...');

  // Start test database
  await setupTestDatabase();

  // Start test Redis
  await setupTestRedis();

  // Apply migrations
  await applyTestMigrations();

  console.log('Integration test environment ready!');
}, 60000);

/**
 * Cleanup after all integration tests
 */
afterAll(async () => {
  console.log('Cleaning up integration test environment...');

  // Stop all test servers
  await Promise.all(testServers.map(server => server.close()));

  // Close Redis connection
  if (testRedis) {
    await testRedis.quit();
  }

  // Close database connection
  if (testDb) {
    await testDb.destroy();
  }

  console.log('Integration test environment cleaned up!');
}, 30000);

/**
 * Reset state before each test
 */
beforeEach(async () => {
  // Clear test data
  await clearTestData();

  // Reset mocks
  jest.clearAllMocks();
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  // Clean up any test resources
});

/**
 * Setup test database
 */
async function setupTestDatabase() {
  // Use Docker or in-memory database for tests
  // Example using environment variable
  const dbUrl = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/nyra_test';

  console.log('Connecting to test database:', dbUrl);

  // Initialize database connection
  // testDb = await createConnection(dbUrl);
}

/**
 * Setup test Redis
 */
async function setupTestRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  console.log('Connecting to test Redis:', redisUrl);

  // Initialize Redis connection
  // testRedis = new Redis(redisUrl);
}

/**
 * Apply test migrations
 */
async function applyTestMigrations() {
  console.log('Applying test migrations...');

  // Run migrations
  // await testDb.migrate.latest();

  // Seed test data
  // await testDb.seed.run();
}

/**
 * Clear test data
 */
async function clearTestData() {
  // Clear all test data from database
  // await testDb('leads').del();
  // await testDb('users').where('email', 'like', '%@test.com').del();

  // Clear Redis cache
  // await testRedis.flushdb();
}

/**
 * Create test server helper
 */
export async function createTestServer(app: any): Promise<any> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      testServers.push(server);
      resolve(server);
    });
  });
}

/**
 * Get test database connection
 */
export function getTestDb() {
  return testDb;
}

/**
 * Get test Redis connection
 */
export function getTestRedis() {
  return testRedis;
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await waitFor(delay);
    }
  }

  throw new Error('Retry failed');
}
