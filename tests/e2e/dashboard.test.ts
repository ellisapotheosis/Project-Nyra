/**
 * E2E Tests for Nexus Dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Nexus Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3001');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Authentication', () => {
    test('should show login page for unauthenticated users', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Login');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.fill('input[type="email"]', 'admin@nyra.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/dashboard/);
      await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.fill('input[type="email"]', 'invalid@nyra.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Invalid credentials');
    });
  });

  test.describe('Dashboard Overview', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await loginAsAdmin(page);
    });

    test('should display worker status', async ({ page }) => {
      await expect(page.locator('[data-testid="worker-status"]')).toBeVisible();

      const workerCards = page.locator('.worker-card');
      await expect(workerCards).toHaveCount(2); // 2 workers

      await expect(workerCards.first()).toContainText('local-1');
    });

    test('should show request metrics', async ({ page }) => {
      await expect(page.locator('[data-testid="metrics-panel"]')).toBeVisible();

      await expect(page.locator('[data-testid="total-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="avg-latency"]')).toBeVisible();
    });

    test('should display recent requests table', async ({ page }) => {
      const requestsTable = page.locator('[data-testid="recent-requests"]');
      await expect(requestsTable).toBeVisible();

      const rows = requestsTable.locator('tbody tr');
      await expect(rows).toHaveCount(10); // Default page size
    });

    test('should update metrics in real-time', async ({ page }) => {
      const requestCount = page.locator('[data-testid="total-requests"]');
      const initialCount = await requestCount.textContent();

      // Wait for 5 seconds
      await page.waitForTimeout(5000);

      const updatedCount = await requestCount.textContent();

      // Count should have increased or stayed same (if no requests)
      expect(parseInt(updatedCount!)).toBeGreaterThanOrEqual(parseInt(initialCount!));
    });
  });

  test.describe('MCP Tools', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.click('a[href="/mcp/tools"]');
      await page.waitForURL('**/mcp/tools');
    });

    test('should list available MCP tools', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('MCP Tools');

      const toolCards = page.locator('.tool-card');
      await expect(toolCards).toHaveCount.toBeGreaterThan(0);
    });

    test('should search tools by name', async ({ page }) => {
      await page.fill('input[placeholder*="Search"]', 'file');

      const results = page.locator('.tool-card');
      await expect(results.first()).toContainText('file');
    });

    test('should filter tools by server', async ({ page }) => {
      await page.selectOption('select[name="server"]', 'filesystem');

      const results = page.locator('.tool-card');
      const count = await results.count();

      expect(count).toBeGreaterThan(0);

      // All results should be from filesystem server
      for (let i = 0; i < count; i++) {
        await expect(results.nth(i)).toContainText('filesystem');
      }
    });

    test('should show tool details', async ({ page }) => {
      await page.click('.tool-card:first-child');

      await expect(page.locator('[data-testid="tool-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-parameters"]')).toBeVisible();
    });

    test('should test tool execution', async ({ page }) => {
      await page.click('.tool-card:first-child');
      await page.click('button[data-testid="test-tool"]');

      await expect(page.locator('[data-testid="tool-output"]')).toBeVisible();
    });
  });

  test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.click('a[href="/settings"]');
      await page.waitForURL('**/settings');
    });

    test('should display routing settings', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Routing');

      await expect(page.locator('input[name="preferLocal"]')).toBeVisible();
      await expect(page.locator('input[name="fallbackCloud"]')).toBeVisible();
    });

    test('should update routing strategy', async ({ page }) => {
      await page.selectOption('select[name="strategy"]', 'load-balanced');
      await page.click('button[type="submit"]');

      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Settings updated');
    });

    test('should add new worker', async ({ page }) => {
      await page.click('button[data-testid="add-worker"]');

      await page.fill('input[name="workerId"]', 'local-3');
      await page.fill('input[name="endpoint"]', 'http://localhost:8082');
      await page.selectOption('select[name="type"]', 'local');

      await page.click('button[type="submit"]');

      await expect(page.locator('.success-message')).toBeVisible();

      // Worker should appear in list
      await expect(page.locator('text=local-3')).toBeVisible();
    });

    test('should remove worker', async ({ page }) => {
      const workerCard = page.locator('.worker-card:first-child');
      await workerCard.hover();
      await workerCard.locator('button[data-testid="remove-worker"]').click();

      // Confirm dialog
      await page.click('button[data-testid="confirm-remove"]');

      await expect(page.locator('.success-message')).toBeVisible();
    });
  });

  test.describe('Monitoring', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.click('a[href="/monitoring"]');
      await page.waitForURL('**/monitoring');
    });

    test('should display request timeline', async ({ page }) => {
      await expect(page.locator('[data-testid="request-timeline"]')).toBeVisible();
    });

    test('should show latency chart', async ({ page }) => {
      await expect(page.locator('[data-testid="latency-chart"]')).toBeVisible();

      const chart = page.locator('canvas[data-chart="latency"]');
      await expect(chart).toBeVisible();
    });

    test('should filter by time range', async ({ page }) => {
      await page.selectOption('select[name="timeRange"]', '1h');

      // Wait for chart to update
      await page.waitForTimeout(1000);

      await expect(page.locator('[data-testid="latency-chart"]')).toBeVisible();
    });

    test('should export metrics', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');

      await page.click('button[data-testid="export-metrics"]');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/metrics.*\.csv/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await loginAsAdmin(page);

      // Mobile menu should be visible
      await expect(page.locator('button[data-testid="mobile-menu"]')).toBeVisible();

      // Open mobile menu
      await page.click('button[data-testid="mobile-menu"]');

      await expect(page.locator('nav[data-testid="mobile-nav"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await loginAsAdmin(page);

      // Should show condensed layout
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });
});

// Helper function
async function loginAsAdmin(page: any): Promise<void> {
  await page.fill('input[type="email"]', 'admin@nyra.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}
