#!/usr/bin/env node
/**
 * Full Security Scan CLI
 * Runs CVE scan + validation checks
 */

import { CVETracker } from '../cve/cve-tracker';
import { InputValidator } from '../validation/input-validator';
import { PathValidator } from '../validation/path-validator';
import { SQLValidator } from '../sql/sql-validator';
import { ClaimsAuthorizer } from '../authorization/claims-authorizer';
import { resolve } from 'path';

async function main() {
  const basePath = process.argv[2] || process.cwd();
  const resolvedPath = resolve(basePath);

  console.log('🛡️  Claude Flow V3 Full Security Scan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Target: ${resolvedPath}\n`);

  // 1. CVE Scan
  console.log('1️⃣  Running CVE scan...');
  const cveTracker = new CVETracker();
  const cveResult = await cveTracker.scanForCVEs(resolvedPath);
  console.log(`   ✅ Found ${cveResult.vulnerabilities.length} CVE patterns\n`);

  // 2. Input Validation Check
  console.log('2️⃣  Checking input validation...');
  const inputValidator = new InputValidator();
  const validationTests = [
    { schema: 'email', data: 'test@example.com', shouldPass: true },
    { schema: 'email', data: 'invalid-email', shouldPass: false },
    { schema: 'filepath', data: '../etc/passwd', shouldPass: false },
    { schema: 'sql-param', data: "'; DROP TABLE users; --", shouldPass: false },
  ];

  let validationPassed = 0;
  for (const test of validationTests) {
    const result = inputValidator.validate(test.schema, test.data);
    if (result.success === test.shouldPass) {
      validationPassed++;
    }
  }
  console.log(`   ✅ ${validationPassed}/${validationTests.length} validation tests passed\n`);

  // 3. Path Validation Check
  console.log('3️⃣  Checking path traversal protection...');
  const pathValidator = new PathValidator([resolvedPath]);
  const pathTests = [
    { path: 'normal/path.txt', shouldPass: true },
    { path: '../../../etc/passwd', shouldPass: false },
    { path: '/etc/passwd', shouldPass: false },
  ];

  let pathPassed = 0;
  for (const test of pathTests) {
    const result = pathValidator.validatePath(test.path, resolvedPath);
    if (result.valid === test.shouldPass) {
      pathPassed++;
    }
  }
  console.log(`   ✅ ${pathPassed}/${pathTests.length} path validation tests passed\n`);

  // 4. SQL Validation Check
  console.log('4️⃣  Checking SQL injection protection...');
  const sqlValidator = new SQLValidator();
  const sqlTests = [
    { query: 'SELECT * FROM users WHERE id = ?', shouldPass: true },
    { query: "SELECT * FROM users WHERE id = 1 OR '1'='1'", shouldPass: false },
    { query: 'SELECT * FROM users; DROP TABLE users;', shouldPass: false },
  ];

  let sqlPassed = 0;
  for (const test of sqlTests) {
    const result = sqlValidator.validateQuery(test.query);
    if (result.valid === test.shouldPass) {
      sqlPassed++;
    }
  }
  console.log(`   ✅ ${sqlPassed}/${sqlTests.length} SQL validation tests passed\n`);

  // 5. Authorization Check
  console.log('5️⃣  Checking claims-based authorization...');
  const authorizer = new ClaimsAuthorizer();
  const policies = authorizer.getPolicies();
  console.log(`   ✅ ${policies.length} authorization policies configured\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Security Scan Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`CVE Vulnerabilities:    ${cveResult.vulnerabilities.length}`);
  console.log(`  Critical: ${cveResult.summary.critical}`);
  console.log(`  High:     ${cveResult.summary.high}`);
  console.log(`  Medium:   ${cveResult.summary.medium}`);
  console.log(`  Low:      ${cveResult.summary.low}`);
  console.log(`\nInput Validation:       ${validationPassed}/${validationTests.length} tests passed`);
  console.log(`Path Protection:        ${pathPassed}/${pathTests.length} tests passed`);
  console.log(`SQL Protection:         ${sqlPassed}/${sqlTests.length} tests passed`);
  console.log(`Authorization Policies: ${policies.length} configured`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Overall status
  const hasVulnerabilities = cveResult.summary.critical > 0 || cveResult.summary.high > 0;
  const allTestsPassed =
    validationPassed === validationTests.length &&
    pathPassed === pathTests.length &&
    sqlPassed === sqlTests.length;

  if (hasVulnerabilities) {
    console.log('⚠️  WARNING: Critical or high severity vulnerabilities detected');
    console.log('   Run detailed scan: npm run scan:cve');
    process.exit(1);
  } else if (!allTestsPassed) {
    console.log('⚠️  WARNING: Some security tests failed');
    process.exit(1);
  } else {
    console.log('✅ Security scan complete - No critical issues found');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Security scan failed:', error);
  process.exit(1);
});
