#!/usr/bin/env node

/**
 * Health check script for Infisical MCP Server
 * Used by Docker healthcheck and monitoring systems
 */

const { spawn } = require('child_process');

const TIMEOUT = 5000; // 5 seconds

async function checkInfisicalCLI() {
  return new Promise((resolve) => {
    const child = spawn('infisical', ['--version'], {
      stdio: 'pipe',
      timeout: TIMEOUT,
    });

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      resolve(code === 0 && output.includes('infisical'));
    });

    child.on('error', () => {
      resolve(false);
    });

    setTimeout(() => {
      child.kill();
      resolve(false);
    }, TIMEOUT);
  });
}

async function checkNodeProcess() {
  try {
    // Check if the main process is responding
    const fs = require('fs');
    const path = require('path');

    // Check if log file exists and was recently updated
    const logPath = path.join('/app/logs', 'infisical-mcp.log');

    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const now = Date.now();
      const fileAge = now - stats.mtimeMs;

      // File should be updated within last 10 minutes
      if (fileAge < 600000) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

async function runHealthCheck() {
  console.log('Running Infisical MCP Server health check...');

  const checks = {
    infisicalCLI: await checkInfisicalCLI(),
    nodeProcess: await checkNodeProcess(),
  };

  console.log('Health check results:', checks);

  const allHealthy = Object.values(checks).every(check => check === true);

  if (allHealthy) {
    console.log('✓ All health checks passed');
    process.exit(0);
  } else {
    console.error('✗ Some health checks failed');
    process.exit(1);
  }
}

runHealthCheck().catch((error) => {
  console.error('Health check error:', error);
  process.exit(1);
});
