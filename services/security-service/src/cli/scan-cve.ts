#!/usr/bin/env node
/**
 * CVE Scanner CLI
 * Run: tsx src/cli/scan-cve.ts [path]
 */

import { CVETracker } from '../cve/cve-tracker';
import { resolve } from 'path';

async function main() {
  const basePath = process.argv[2] || process.cwd();
  const resolvedPath = resolve(basePath);

  console.log('🔍 Claude Flow V3 CVE Scanner');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Scanning: ${resolvedPath}\n`);

  const tracker = new CVETracker();
  const result = await tracker.scanForCVEs(resolvedPath);

  console.log('📊 Scan Results');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Files scanned: ${result.filesScanned}/${result.totalFiles}`);
  console.log(`Total vulnerabilities: ${result.vulnerabilities.length}\n`);

  console.log('🚨 Severity Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Critical: ${result.summary.critical}`);
  console.log(`High:     ${result.summary.high}`);
  console.log(`Medium:   ${result.summary.medium}`);
  console.log(`Low:      ${result.summary.low}\n`);

  if (result.vulnerabilities.length > 0) {
    console.log('📋 Findings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const finding of result.vulnerabilities) {
      console.log(`\n[${finding.severity.toUpperCase()}] ${finding.cveId}`);
      console.log(`File: ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
      console.log(`Matches: ${finding.matches}`);
      if (finding.context) {
        console.log(`Context: ${finding.context}`);
      }
      console.log(`\nRemediation:\n${finding.remediation.split('\n').slice(0, 5).join('\n')}`);
    }
  }

  if (result.recommendations.length > 0) {
    console.log('\n\n💡 Recommendations');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Scan complete at ${result.timestamp.toISOString()}`);

  // Exit with error code if critical or high vulnerabilities found
  if (result.summary.critical > 0 || result.summary.high > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Scan failed:', error);
  process.exit(1);
});
