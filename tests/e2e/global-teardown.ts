/**
 * Playwright Global Teardown
 * Runs once after all E2E tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Starting E2E test teardown...');

  // Create browser instance for cleanup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

    // Navigate to app
    await page.goto(baseURL, {
      timeout: 5000,
      waitUntil: 'domcontentloaded',
    }).catch(() => {
      console.log('Service already shut down');
    });

    // Clean up test data
    await cleanupTestData(page);

    // Remove test users
    await removeTestUsers(page);

    console.log('E2E test teardown complete!');
  } catch (error) {
    console.error('E2E teardown error (non-fatal):', error);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

async function cleanupTestData(page: any) {
  // Clean up test data
  console.log('Cleaning up test data...');

  try {
    await page.evaluate(() => {
      // Remove test data from localStorage
      localStorage.removeItem('test-data-seeded');
      localStorage.removeItem('test-user');
    }).catch(() => {
      // Ignore errors if page is not available
    });
  } catch (error) {
    // Non-fatal error
    console.log('Could not clean up localStorage (service may be down)');
  }
}

async function removeTestUsers(page: any) {
  // Remove test users
  console.log('Removing test users...');

  // Example: Call API to remove test users
  // await page.request.delete('/api/test-users').catch(() => {});
}

export default globalTeardown;
