#!/usr/bin/env node
/**
 * PHASE 2: Cloudflare Access Policy Automation
 * Uses Playwright MCP to automate Cloudflare dashboard interactions
 */

import { chromium } from 'playwright';

const CLOUDFLARE_DASHBOARD = 'https://dash.cloudflare.com';
const ADMIN_EMAIL = 'edaneandersen@gmail.com';
const NEXUS_DOMAIN = 'nexus.projectnyra.com';

async function setupCloudflareAccess() {
  console.log('🔄 PHASE 2: Setting up Cloudflare Access Policy via Playwright...\n');

  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to Cloudflare Dashboard
    console.log('📍 Navigating to Cloudflare Dashboard...');
    await page.goto(CLOUDFLARE_DASHBOARD);

    // Step 2: Check if already authenticated
    const needsAuth = await page.url().includes('login');
    if (needsAuth) {
      console.log('⚠️  Manual authentication required');
      console.log('   Please log in to Cloudflare Dashboard');
      console.log('   Waiting for authentication...');
      await page.waitForURL('**/dashboard/**', { timeout: 300000 });
    }

    // Step 3: Navigate to Access → Applications
    console.log('🔐 Navigating to Access → Applications...');
    await page.goto(`${CLOUDFLARE_DASHBOARD}/access/applications`);
    await page.waitForLoadState('networkidle');

    // Step 4: Create new application
    console.log(`📋 Creating Access application for ${NEXUS_DOMAIN}...`);

    // Look for "Add application" button
    const addButton = page.locator('button:has-text("Add application")') ||
                     page.locator('button:has-text("Create Application")');

    if (await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addButton.click();
    } else {
      console.log('⚠️  Could not find "Add application" button');
      console.log('   Manual action required at: ' + CLOUDFLARE_DASHBOARD + '/access/applications');
      return false;
    }

    // Step 5: Fill in application details
    console.log(`📝 Configuring application for ${NEXUS_DOMAIN}...`);

    // Application name
    const nameInput = page.locator('input[placeholder*="Application name"]') ||
                     page.locator('input[name*="name"]').first();
    await nameInput.fill('Project Nyra Admin Console');

    // Domain
    const domainInput = page.locator('input[placeholder*="Domain"]') ||
                       page.locator('input[name*="domain"]').first();
    await domainInput.fill(NEXUS_DOMAIN);

    // Application type - select "Self-hosted"
    const typeSelect = page.locator('select, [role="combobox"]').first();
    await typeSelect.click();
    const selfHostedOption = page.locator('text=Self-hosted').first();
    await selfHostedOption.click({ timeout: 5000 }).catch(() => {});

    // Step 6: Save application
    console.log('💾 Saving application...');
    const saveButton = page.locator('button:has-text("Save")') ||
                      page.locator('button:has-text("Create")');
    await saveButton.click();
    await page.waitForLoadState('networkidle');

    // Step 7: Add authentication policy
    console.log(`🔑 Creating email-based policy for ${ADMIN_EMAIL}...`);

    const addPolicyButton = page.locator('button:has-text("Add policy")') ||
                           page.locator('button:has-text("Add Rule")');

    if (await addPolicyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addPolicyButton.click();
    }

    // Policy name
    const policyNameInput = page.locator('input[placeholder*="Policy name"]').first();
    await policyNameInput.fill('Admin Email Access');

    // Action: Allow
    const allowButton = page.locator('label:has-text("Allow")').first();
    await allowButton.click();

    // Add email rule
    const emailOption = page.locator('button:has-text("Email")').first() ||
                       page.locator('text=Email').first();
    await emailOption.click({ timeout: 5000 }).catch(() => {});

    // Enter email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(ADMIN_EMAIL);

    // Step 8: Save policy
    console.log('💾 Saving policy...');
    const savePolicyButton = page.locator('button:has-text("Save")').last();
    await savePolicyButton.click();
    await page.waitForLoadState('networkidle');

    console.log('\n✅ PHASE 2 COMPLETE: Cloudflare Access configured');
    console.log(`   Application: ${NEXUS_DOMAIN}`);
    console.log(`   Policy: Allow ${ADMIN_EMAIL}\n`);

    return true;

  } catch (error) {
    console.error('❌ Error during Phase 2 automation:', error.message);
    console.log('\n⚠️  Fallback: Manual configuration required');
    console.log(`   Dashboard: ${CLOUDFLARE_DASHBOARD}/access/applications`);
    return false;
  } finally {
    await browser.close();
  }
}

// Run automation
setupCloudflareAccess().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
