import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const apps = [
  {
    name: 'nyra-webapp',
    url: 'http://localhost:3005',
    routes: [
      '/', '/leads', '/campaigns', '/quotes',
      '/fleet', '/memory', '/admin', '/assistant'
    ]
  },
  {
    name: 'ratehunter-landing',
    url: 'http://localhost:3004',
    routes: ['/']
  },
];

function screenshotName(route) {
  return route === '/' ? 'index.png' : `${route.replace(/\//g, '_').substring(1)}.png`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const screenshotDir = path.join(process.cwd(), 'apps/guidance/screenshots/final-foundation-pass');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = [];

  for (const app of apps) {
    console.log(`Processing ${app.name}...`);
    const appDir = path.join(screenshotDir, app.name);
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    for (const route of app.routes) {
      const page = await context.newPage();
      const url = `${app.url}${route}`;

      console.log(`Taking screenshot of ${url}`);
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Give a little extra time for animations/R3F to settle
        await page.waitForTimeout(2000);

        const fileName = screenshotName(route);
        const filePath = path.join(appDir, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved to ${filePath}`);

        results.push({
          app: app.name,
          route,
          url,
          status: response?.status() ?? 0,
          ok: true,
          screenshot: path.relative(process.cwd(), filePath),
        });
      } catch (err) {
        console.error(`Failed to take screenshot of ${url}: ${err.message}`);
        results.push({
          app: app.name,
          route,
          url,
          status: 0,
          ok: false,
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
}

run().catch(console.error);
