/**
 * Integration Test Global Setup
 * Runs once before all integration tests
 */

export default async function globalSetup() {
  console.log('Starting integration test global setup...');

  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';

  // Start Docker containers if needed
  if (process.env.USE_DOCKER_SERVICES === 'true') {
    await startDockerServices();
  }

  console.log('Integration test global setup complete!');
}

/**
 * Start Docker services for testing
 */
async function startDockerServices() {
  console.log('Starting Docker test services...');

  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    // Start test database
    await execAsync('docker-compose -f infra/docker-compose.test.yml up -d postgres redis');

    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Docker test services started!');
  } catch (error) {
    console.error('Failed to start Docker services:', error);
    throw error;
  }
}
