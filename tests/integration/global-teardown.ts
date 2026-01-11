/**
 * Integration Test Global Teardown
 * Runs once after all integration tests
 */

export default async function globalTeardown() {
  console.log('Starting integration test global teardown...');

  // Stop Docker containers if they were started
  if (process.env.USE_DOCKER_SERVICES === 'true') {
    await stopDockerServices();
  }

  console.log('Integration test global teardown complete!');
}

/**
 * Stop Docker services
 */
async function stopDockerServices() {
  console.log('Stopping Docker test services...');

  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    await execAsync('docker-compose -f infra/docker-compose.test.yml down -v');
    console.log('Docker test services stopped!');
  } catch (error) {
    console.error('Failed to stop Docker services:', error);
  }
}
