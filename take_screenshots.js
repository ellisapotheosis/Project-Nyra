import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const apps = [
  { name: 'admin-shell', url: 'http://localhost:3002', routes: ['/', '/leads', '/quotes'] },
  { name: 'nyra-admin', url: 'http://localhost:3008', routes: ['/'] },
  { name: 'landing-legacy', url: 'http://localhost:3007', routes: ['/'] },
  { name: 'landing-main', url: 'http://localhost:3004', routes: ['/'] },
  { name: 'webapp', url: 'http://localhost:3005', routes: [
      '/', '/admin', '/applications', '/assistant', '/campaigns',
      '/campaigns/builder', '/campaigns/builder/1', '/crm',
      '/leads', '/leads/1', '/pipeline', '/quotes', '/tools/openclaw'
    ]
  },
  { name: 'mortgage-crm', url: 'http://localhost:3006', routes: ['/', '/leads/1'] },
  { name: 'twenty-shell', url: 'http://localhost:3003', routes: ['/'] },
  { name: 'nexus-ui', url: 'http://localhost:3018', routes: ['/'] },
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const screenshotDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  for (const app of apps) {
    console.log(`Processing ${app.name}...`);
    const appDir = path.join(screenshotDir, app.name);
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir);
    }

    for (const route of app.routes) {
      const page = await context.newPage();
      const url = `${app.url}${route}`;
      console.log(`Taking screenshot of ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const fileName = route === '/' ? 'index.png' : `${route.replace(/\//g, '_')}.png`;
        const filePath = path.join(appDir, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved to ${filePath}`);
      } catch (err) {
        console.error(`Failed to take screenshot of ${url}: ${err.message}`);
      }
      await page.close();
    }
  }

  await browser.close();
}

run().catch(console.error);
