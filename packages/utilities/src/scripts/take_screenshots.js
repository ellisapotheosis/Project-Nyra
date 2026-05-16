import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const apps = [
  { name: 'admin-shell', url: 'http://localhost:3002', routes: ['/'] },
  { name: 'nyra-admin', url: 'http://localhost:3008', routes: ['/', '/leads', '/quotes'] },
  { name: 'landing-legacy', url: 'http://localhost:3007', routes: ['/', '/thank-you'] },
  { name: 'landing-main', url: 'http://localhost:3004', routes: ['/'] },
  { name: 'webapp', url: 'http://localhost:3005', routes: [
      '/', '/applications', '/assistant', '/campaigns',
      '/campaigns/builder', '/campaigns/builder/1', '/crm',
      '/leads', '/leads/1', '/pipeline', '/quotes', '/settings',
      '/tools/openclaw'
    ]
  },
  { name: 'mortgage-crm', url: 'http://localhost:3006', routes: ['/', '/leads/1'] },
  { name: 'twenty-shell', url: 'http://localhost:3003', routes: ['/'] },
  { name: 'nexus-ui', url: 'http://localhost:3018', routes: ['/'] },
];

function screenshotName(route) {
  return route === '/' ? 'index.png' : `${route.replace(/\//g, '_')}.png`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const screenshotDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const results = [];

  for (const app of apps) {
    console.log(`Processing ${app.name}...`);
    const appDir = path.join(screenshotDir, app.name);
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir);
    }

    for (const route of app.routes) {
      const page = await context.newPage();
      const url = `${app.url}${route}`;
      const consoleMessages = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          consoleMessages.push(`${message.type()}: ${message.text()}`);
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });
      page.on('requestfailed', (request) => {
        failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'request failed'}`);
      });

      console.log(`Taking screenshot of ${url}`);
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);
        const status = response?.status() ?? 0;
        const fileName = screenshotName(route);
        const filePath = path.join(appDir, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved to ${filePath}`);
        results.push({
          app: app.name,
          route,
          url,
          status,
          ok: status >= 200 && status < 400 && pageErrors.length === 0,
          screenshot: path.relative(process.cwd(), filePath),
          consoleMessages,
          pageErrors,
          failedRequests,
        });
      } catch (err) {
        console.error(`Failed to take screenshot of ${url}: ${err.message}`);
        results.push({
          app: app.name,
          route,
          url,
          status: 0,
          ok: false,
          screenshot: null,
          consoleMessages,
          pageErrors,
          failedRequests,
          error: err.message,
        });
      }
      await page.close();
    }
  }

  await browser.close();

  const reportPath = path.join(screenshotDir, 'capture-report.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Wrote ${reportPath}`);

  const failures = results.filter((result) => !result.ok);
  if (failures.length > 0) {
    console.error(`Capture completed with ${failures.length} page issue(s).`);
    process.exitCode = 1;
  }
}

run().catch(console.error);
