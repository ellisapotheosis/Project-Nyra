/**
 * Playwright Global Setup
 * Runs once before all E2E tests
 */

import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Starting E2E test setup...");

  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.E2E_TEST = "true";

  // Create browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for services to be ready
    const baseURL = config.projects[0].use.baseURL || "http://localhost:3010";

    console.log(`Waiting for ${baseURL} to be ready...`);

    // Try to connect with retries
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await page.goto(baseURL, {
          timeout: 2000,
          waitUntil: "domcontentloaded",
        });

        if (response && response.ok()) {
          console.log("Service is ready!");
          break;
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Service not ready after 30 attempts: ${error}`);
        }
        await page.waitForTimeout(1000);
      }
    }

    // Seed test data if needed
    await seedTestData(page);

    // Create test users
    await createTestUsers(page);

    console.log("E2E test setup complete!");
  } catch (error) {
    console.error("E2E setup failed:", error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

async function seedTestData(page: any) {
  // Add test data seeding logic here
  console.log("Seeding test data...");

  // Example: Create test mortgage rates
  // await page.evaluate(() => {
  //   localStorage.setItem('test-data-seeded', 'true');
  // });
}

async function createTestUsers(page: any) {
  // Create test users for E2E tests
  console.log("Creating test users...");

  // Example: Register test user
  // const testUser = {
  //   email: 'test@example.com',
  //   password: 'TestPassword123!',
  // };

  // Store test credentials for tests to use
  // await page.evaluate((user) => {
  //   localStorage.setItem('test-user', JSON.stringify(user));
  // }, testUser);
}

export default globalSetup;
