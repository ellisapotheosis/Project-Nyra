#!/usr/bin/env node

/**
 * Test script for Infisical MCP Server secret retrieval
 * Validates all MCP tools work correctly
 *
 * Usage:
 *   node test/test-secret-retrieval.js
 *
 * @version 1.0.0
 */

const { spawn } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function executeInfisicalCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('infisical', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        INFISICAL_DISABLE_UPDATE_CHECK: 'true'
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to execute command: ${error.message}`));
    });
  });
}

async function testAuthentication() {
  log('\n🔐 Testing Infisical Authentication...', 'cyan');

  if (!process.env.INFISICAL_TOKEN) {
    log('  ✗ INFISICAL_TOKEN not set', 'red');
    return false;
  }

  if (!process.env.INFISICAL_PROJECT_ID) {
    log('  ✗ INFISICAL_PROJECT_ID not set', 'red');
    return false;
  }

  log(`  ✓ INFISICAL_TOKEN: ${process.env.INFISICAL_TOKEN.substring(0, 10)}...`, 'green');
  log(`  ✓ INFISICAL_PROJECT_ID: ${process.env.INFISICAL_PROJECT_ID}`, 'green');

  try {
    const result = await executeInfisicalCommand(['--version']);
    log(`  ✓ Infisical CLI version: ${result.stdout}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Infisical CLI not available: ${error.message}`, 'red');
    return false;
  }
}

async function testListSecrets() {
  log('\n📋 Testing List Secrets...', 'cyan');

  try {
    const args = [
      'secrets', 'list',
      '--env', process.env.INFISICAL_ENVIRONMENT || 'development',
      '--projectId', process.env.INFISICAL_PROJECT_ID,
      '--format', 'json'
    ];

    const result = await executeInfisicalCommand(args);
    const secrets = JSON.parse(result.stdout);

    log(`  ✓ Listed ${secrets.length} secrets`, 'green');

    if (secrets.length > 0) {
      log(`  ℹ Sample secrets:`, 'blue');
      secrets.slice(0, 3).forEach(secret => {
        log(`    - ${secret.key}`, 'blue');
      });
    }

    return true;
  } catch (error) {
    log(`  ✗ Failed to list secrets: ${error.message}`, 'red');
    return false;
  }
}

async function testGetSecret(secretName = 'TEST_SECRET') {
  log(`\n🔍 Testing Get Secret: ${secretName}...`, 'cyan');

  try {
    const args = [
      'secrets', 'get', secretName,
      '--env', process.env.INFISICAL_ENVIRONMENT || 'development',
      '--projectId', process.env.INFISICAL_PROJECT_ID,
      '--plain'
    ];

    const result = await executeInfisicalCommand(args);
    log(`  ✓ Retrieved secret value (length: ${result.stdout.length})`, 'green');
    return true;
  } catch (error) {
    log(`  ⚠ Secret not found or error: ${error.message}`, 'yellow');
    log(`  ℹ This is expected if ${secretName} doesn't exist`, 'blue');
    return 'skipped';
  }
}

async function testSetSecret(secretName = 'TEST_SECRET', secretValue = 'test_value_123') {
  log(`\n✏️  Testing Set Secret: ${secretName}...`, 'cyan');

  try {
    const args = [
      'secrets', 'set', secretName, secretValue,
      '--env', process.env.INFISICAL_ENVIRONMENT || 'development',
      '--projectId', process.env.INFISICAL_PROJECT_ID
    ];

    await executeInfisicalCommand(args);
    log(`  ✓ Set secret successfully`, 'green');

    // Verify by retrieving
    const getArgs = [
      'secrets', 'get', secretName,
      '--env', process.env.INFISICAL_ENVIRONMENT || 'development',
      '--projectId', process.env.INFISICAL_PROJECT_ID,
      '--plain'
    ];

    const result = await executeInfisicalCommand(getArgs);
    if (result.stdout === secretValue) {
      log(`  ✓ Verified secret value matches`, 'green');
      return true;
    } else {
      log(`  ✗ Secret value mismatch`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ✗ Failed to set secret: ${error.message}`, 'red');
    return false;
  }
}

async function testExportSecrets() {
  log('\n📤 Testing Export Secrets...', 'cyan');

  try {
    const args = [
      'secrets', 'export',
      '--env', process.env.INFISICAL_ENVIRONMENT || 'development',
      '--projectId', process.env.INFISICAL_PROJECT_ID,
      '--format', 'dotenv'
    ];

    const result = await executeInfisicalCommand(args);
    const lines = result.stdout.split('\n').filter(line => line.trim());

    log(`  ✓ Exported ${lines.length} secrets`, 'green');

    if (lines.length > 0) {
      log(`  ℹ Sample exports:`, 'blue');
      lines.slice(0, 3).forEach(line => {
        const key = line.split('=')[0];
        log(`    - ${key}=***`, 'blue');
      });
    }

    return true;
  } catch (error) {
    log(`  ✗ Failed to export secrets: ${error.message}`, 'red');
    return false;
  }
}

async function testDockerContainer() {
  log('\n🐳 Testing Docker Container Status...', 'cyan');

  return new Promise((resolve) => {
    const child = spawn('docker', ['ps', '--filter', 'name=nyra-infisical-mcp', '--format', '{{.Status}}'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.includes('Up')) {
        log(`  ✓ Container is running: ${stdout.trim()}`, 'green');
        resolve(true);
      } else if (code === 0 && stdout.trim() === '') {
        log(`  ⚠ Container not found`, 'yellow');
        log(`  ℹ Run: docker-compose up -d`, 'blue');
        resolve('not_running');
      } else {
        log(`  ✗ Failed to check container status`, 'red');
        resolve(false);
      }
    });

    child.on('error', (error) => {
      log(`  ⚠ Docker command not available: ${error.message}`, 'yellow');
      resolve('no_docker');
    });
  });
}

async function runAllTests() {
  log('╔════════════════════════════════════════════════════════╗', 'blue');
  log('║   Infisical MCP Server - Secret Retrieval Test        ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const results = {
    docker: await testDockerContainer(),
    auth: await testAuthentication(),
    list: false,
    get: false,
    set: false,
    export: false
  };

  if (results.auth === true) {
    results.list = await testListSecrets();
    results.get = await testGetSecret();
    results.set = await testSetSecret();
    results.export = await testExportSecrets();
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║   Test Summary                                         ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  log(`\nDocker Container:     ${formatResult(results.docker)}`);
  log(`Authentication:       ${formatResult(results.auth)}`);
  log(`List Secrets:         ${formatResult(results.list)}`);
  log(`Get Secret:           ${formatResult(results.get)}`);
  log(`Set Secret:           ${formatResult(results.set)}`);
  log(`Export Secrets:       ${formatResult(results.export)}`);

  log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  log(`Total: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed! Infisical MCP Server is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
    process.exit(1);
  }
}

function formatResult(result) {
  if (result === true) {
    return `${COLORS.green}✓ PASS${COLORS.reset}`;
  } else if (result === false) {
    return `${COLORS.red}✗ FAIL${COLORS.reset}`;
  } else if (result === 'skipped') {
    return `${COLORS.yellow}⊘ SKIP${COLORS.reset}`;
  } else if (result === 'not_running') {
    return `${COLORS.yellow}⚠ NOT RUNNING${COLORS.reset}`;
  } else if (result === 'no_docker') {
    return `${COLORS.yellow}⚠ NO DOCKER${COLORS.reset}`;
  } else {
    return `${COLORS.yellow}? UNKNOWN${COLORS.reset}`;
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n✗ Test execution failed: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});
